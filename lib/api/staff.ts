/**
 * Hospital-staff workspace data layer.
 *
 * SECURITY CONTRACT (Phase 1, complete mediation):
 *  - Role boundary: this module ONLY talks to staff-permissioned endpoints
 *    (cards lookup, patient-scoped chart paths, visits, access requests and
 *    grants). It NEVER calls the /patients/me/... family — the API answers
 *    those with IsPatient, and the patient module never calls these.
 *    Cross-role leakage is structurally impossible at the client, and the
 *    API enforces it again with IsHospitalStaff/IsDoctor/IsFromVerified
 *    Hospital.
 *  - PHI consent: patient chart reads (patient profile and records) are
 *    grant-gated SERVER-SIDE per request — an active, non-revoked
 *    AccessGrant for the staff member's hospital tied to an ACTIVE visit.
 *    The UI merely renders; a revoked grant turns the next request into a
 *    403 and the page degrades to a safe error (fail-closed).
 *  - The client never persists PHI (no localStorage) and never sends
 *    raw errors to the DOM (controlled copy via ResourceState).
 */
"use client";

import { apiFetch } from "@/lib/api";
import { useResource, type ResourceState } from "@/lib/api/use-resource";

// ---------- Response shapes (mirror the API serializers) ----------

export interface StaffProfile {
  id: string;
  full_name: string;
  role: string;
  professional_license_number: string | null;
  hospital: string;
  hospital_name: string;
  hospital_verification_status: string;
  created_at: string;
}

export interface ActiveGrant {
  id: string;
  access_request: {
    id: string;
    visit: string;
    patient: string;
    hospital: string;
    hospital_name: string;
    requested_by_staff: string;
    requested_by_staff_name: string;
    request_type: string;
    access_level: string;
    status: string;
    approval_code: string;
    created_at: string;
    responded_at: string | null;
    patient_response_deadline: string | null;
  };
  access_level: string;
  granted_at: string;
  granted_by: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  is_active: boolean;
  // Read-only display fields added to AccessGrantSerializer.
  patient_name?: string | null;
  patient_date_of_birth?: string | null;
  visit_status?: string | null;
}

export interface CardLookupResult {
  patient_id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  card_reference: string;
  card_expires_at: string;
  access_request_required: boolean;
}

export interface StaffPatientProfile {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  blood_type: string | null;
}

export interface MedicalRecord {
  id: string;
  entry_type: string;
  description: string;
  verification_status: string;
  hospital: string | null;
  visit: string | null;
  created_at: string;
  hospital_name: string | null;
  created_by_name: string | null;
  verified_by_name: string | null;
}

export interface Visit {
  id: string;
  hospital: string;
  hospital_name: string | null;
  admitted_at: string;
  checked_out_at: string | null;
  checkout_requested_by_patient_at: string | null;
  status: string;
}

// ---------- Resource hooks (staff-permissioned endpoints only) ----------

/** Active consent grants for the staff member's hospital (grant-gated list). */
export function useStaffActiveGrants(): ResourceState<ActiveGrant[]> {
  return useResource<ActiveGrant[]>("/access-grants/hospital/active/", "[staff]");
}

/** Patient profile — requires an active grant for this staff's hospital. */
export function useStaffPatient(patientId: string): ResourceState<StaffPatientProfile> {
  return useResource<StaffPatientProfile>(`/patients/${patientId}/`, "[staff]");
}

/** Patient records — requires an active grant; may be filtered by access
 * level server-side (critical_info_only returns a subset). */
export function useStaffPatientRecords(patientId: string): ResourceState<MedicalRecord[]> {
  return useResource<MedicalRecord[]>(`/patients/${patientId}/records/`, "[staff]");
}

// ---------- Mutations (caller owns UI state; server stays source of truth) ----------

function errorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") {
    return (e as { message: string }).message;
  }
  return fallback;
}

/** Identify a patient by their card reference. Identity only — no PHI
 * beyond name/DOB/gender; `access_request_required` is always true. */
export async function lookupCard(cardReference: string): Promise<CardLookupResult> {
  const result = await apiFetch<CardLookupResult>("/cards/lookup/", {
    method: "POST",
    body: { card_reference: cardReference.trim() },
  });
  if (!result) throw new Error("Card lookup returned no data");
  return result;
}

/** Start a new visit for a patient (checked-in care episode). Consent is
 * NOT implied by starting a visit — reading the chart still needs a grant. */
export async function startVisit(patientId: string): Promise<Visit> {
  const visit = await apiFetch<Visit>("/visits/", {
    method: "POST",
    body: { patient: patientId },
  });
  if (!visit) throw new Error("Start-visit returned no data");
  return visit;
}

/**
 * Request chart access for an active visit. Creates a PENDING access
 * request that the patient must approve before any PHI is returned.
 * Throws with the server's message.
 */
export async function createAccessRequest(
  visitId: string,
  accessLevel: "full_record" | "critical_info_only" = "full_record",
): Promise<{ id: string; status: string }> {
  const request = await apiFetch<{ id: string; status: string }>("/access-requests/", {
    method: "POST",
    body: { visit: visitId, request_type: "normal", access_level: accessLevel },
  });
  if (!request) throw new Error("Access request returned no data");
  return request;
}

/**
 * Doctor-only verification of a self-reported record. The API enforces
 * IsDoctor + hospital scoping; the UI hides the button for non-doctors as
 * a hint only — a nurse forcing this call still gets a 403.
 */
export async function verifyRecord(recordId: string): Promise<MedicalRecord> {
  const record = await apiFetch<MedicalRecord>(`/records/${recordId}/verify/`, {
    method: "POST",
  });
  if (!record) throw new Error("Verify returned no data");
  return record;
}

/** Add a clinical chart entry during an active, consent-granted visit.
 * Rejected server-side for critical-info-only grants. */
export async function addPatientRecord(
  patientId: string,
  input: { entry_type: string; description: string },
): Promise<MedicalRecord> {
  const record = await apiFetch<MedicalRecord>(`/patients/${patientId}/records/`, {
    method: "POST",
    body: { entry_type: input.entry_type.trim(), description: input.description.trim() },
  });
  if (!record) throw new Error("Add-record returned no data");
  return record;
}

/** Check out a visit. Server also revokes all of that visit's grants. */
export async function checkoutVisit(visitId: string): Promise<Visit> {
  const visit = await apiFetch<Visit>(`/visits/${visitId}/checkout/`, {
    method: "POST",
  });
  if (!visit) throw new Error("Checkout returned no data");
  return visit;
}

export interface AiSummaryResult {
  summary: string | null;
}

/**
 * Generate an AI clinical summary of the patient's chart (server-side
 * Groq call; stateless — the summary is never persisted). Same grant gate
 * as every other chart read: the server re-checks the active grant per
 * request. Loading/error state lives in the caller.
 */
export async function summarizePatient(patientId: string): Promise<AiSummaryResult> {
  const result = await apiFetch<AiSummaryResult>(`/patients/${patientId}/summarize/`, {
    method: "POST",
  });
  if (!result) throw new Error("Summarize returned no data");
  return result;
}

export { errorMessage as staffErrorMessage };
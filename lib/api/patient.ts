/**
 * Patient-portal data layer.
 *
 * Every call goes through the single auth-aware apiFetch entry
 * (lib/api/index.ts) — Phase 1 complete mediation: nothing here builds
 * raw requests or touches tokens. Endpoints are all /patients/me/* (the
 * API scopes by request.user); this client never sends patient IDs, so
 * there is no IDOR surface to introduce at this boundary.
 *
 * Fail-closed contract (Phase 2):
 *  - a resource hook renders either full data or a safe error state;
 *    it never renders partial data and never auto-retries (apiFetch does
 *    ONE refresh + retry on a 401, then throws).
 *  - `error` is a controlled generic string for the UI; raw ApiError
 *    details go to the console only, never the DOM.
 */
"use client";

import { apiFetch } from "@/lib/api";
import { useResource, type ResourceState } from "@/lib/api/use-resource";

// ---------- Response shapes (mirror the API serializers) ----------

export interface PatientProfile {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  blood_type: string | null;
  account_type: string;
  created_at: string;
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

export interface PatientCard {
  id: string;
  card_reference: string;
  issued_at: string;
  renewed_at: string | null;
  expires_at: string;
  status: string;
  is_active: boolean;
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

/** Wire type for POST /patients/me/records/. */
export interface CreateRecordInput {
  entry_type: string;
  description: string;
}

// ---------- Resource hooks (one per endpoint; never Promise.all-coupled) ----------
// useResource lives in lib/api/use-resource.ts and is shared with the staff
// module. Console label is "[patient]" so failures are diagnosable by role.

export function useMyProfile(): ResourceState<PatientProfile> {
  // /auth/me/ returns the PatientProfile directly (patients only).
  return useResource<PatientProfile>("/auth/me/", "[patient]");
}

export function useMyCard(): ResourceState<PatientCard | null> {
  // data === null means "no active card" (API returns success with null).
  return useResource<PatientCard | null>("/patients/me/card/", "[patient]");
}

export function useMyRecords(): ResourceState<MedicalRecord[]> {
  return useResource<MedicalRecord[]>("/patients/me/records/", "[patient]");
}

export function useMyVisits(): ResourceState<Visit[]> {
  return useResource<Visit[]>("/patients/me/visits/", "[patient]");
}

// ---------- Mutations (caller owns UI state; server stays source of truth) ----------

/** Issue the patient's first card. Throws on failure; caller shows a toast. */
export async function issueMyCard(): Promise<PatientCard> {
  const card = await apiFetch<PatientCard>("/patients/me/card/", {
    method: "POST",
  });
  if (!card) throw new Error("Card endpoint returned no data");
  return card;
}

/** Renew the patient's active card. Throws on failure; caller shows a toast. */
export async function renewMyCard(): Promise<PatientCard> {
  const card = await apiFetch<PatientCard>(
    "/patients/me/card/renew/",
    { method: "POST" },
  );
  if (!card) throw new Error("Renew endpoint returned no data");
  return card;
}

/**
 * Add a patient self-reported record. Validation is allow-listed here
 * (trim, non-empty, max lengths mirroring the serializer); the API
 * re-validates everything server-side.
 */
export async function createMyRecord(input: CreateRecordInput): Promise<MedicalRecord> {
  const payload = {
    entry_type: input.entry_type.trim(),
    description: input.description.trim(),
  };
  if (!payload.entry_type || payload.entry_type.length > 100) {
    throw new Error("Entry type is required (max 100 characters).");
  }
  if (!payload.description || payload.description.length > 2000) {
    throw new Error("Description is required (max 2000 characters).");
  }
  const record = await apiFetch<MedicalRecord>(
    "/patients/me/records/",
    { method: "POST", body: payload },
  );
  if (!record) throw new Error("Create-record endpoint returned no data");
  return record;
}
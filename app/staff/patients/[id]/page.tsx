"use client";

/**
 * Staff patient chart — the PHI-sensitive screen.
 *
 * Consent model (server-enforced, per request): the profile and records
 * endpoints return data ONLY while an active, non-revoked AccessGrant for
 * this staff member's hospital exists, tied to an ACTIVE visit. Query
 * params `visit` and `level` are UI affordances only (they tell the page
 * which controls to show); the server re-validates every call — a revoked
 * grant turns the next request into a 403 and the page degrades safely.
 *
 * Actions:
 *  - Add chart note: only for full_record grants (API rejects critical-).
 *  - Check out: ends the visit and revokes its grants (server-side).
 *  - Verify: doctor-only (API enforces IsDoctor).
 */
import { Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { formatDate } from "@/components/dashboard/MedicalRecordsTable";
import { StaffRecordsList } from "@/components/staff/StaffRecordsList";
import { StaffShell } from "@/components/staff/StaffShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProtectedPage } from "@/lib/auth/guards";
import { useAuth } from "@/lib/auth/provider";
import {
  addPatientRecord,
  checkoutVisit,
  staffErrorMessage,
  summarizePatient,
  useStaffPatient,
  useStaffPatientRecords,
} from "@/lib/api/staff";

function PatientChart({ patientId }: { patientId: string }) {
  const { profile } = useAuth();
  const searchParams = useSearchParams();

  // UI affordances (NOT authorization — the API re-checks consent).
  const visitId = searchParams.get("visit");
  const level = searchParams.get("level");

  const patient = useStaffPatient(patientId);
  const records = useStaffPatientRecords(patientId);

  const staffRole = typeof profile?.role === "string" ? profile.role : "";
  const canVerify = staffRole === "doctor";
  const canAddNotes = level === "full_record";
  const canCheckout = Boolean(visitId);

  const [noteType, setNoteType] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkoutArmed, setCheckoutArmed] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  async function handleSummarize() {
    if (summarizing) return; // in-flight lock (double-click guard)
    setSummarizing(true);
    setSummaryError(null);
    try {
      const result = await summarizePatient(patientId);
      setSummary(result.summary);
      if (!result.summary) {
        setSummaryError("No records to summarize yet.");
      }
    } catch (e) {
      setSummaryError(staffErrorMessage(e, "Could not generate the summary."));
    } finally {
      setSummarizing(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    const type = noteType.trim();
    const body = noteBody.trim();
    if (!type || !body || saving) return;
    if (type.length > 100) {
      toast.error("Entry type must be 100 characters or fewer.");
      return;
    }
    if (body.length > 2000) {
      toast.error("Description must be 2000 characters or fewer.");
      return;
    }
    setSaving(true);
    try {
      await addPatientRecord(patientId, { entry_type: type, description: body });
      toast.success("Chart note added");
      setNoteType("");
      setNoteBody("");
      records.reload();
    } catch (e) {
      toast.error(staffErrorMessage(e, "Could not add the note."));
    } finally {
      setSaving(false);
    }
  }

  async function handleCheckout() {
    if (!visitId || checkingOut) return;
    if (!checkoutArmed) {
      // Two-step confirm: first click arms, second executes.
      setCheckoutArmed(true);
      return;
    }
    setCheckingOut(true);
    try {
      await checkoutVisit(visitId);
      toast.success("Visit checked out — patient access revoked.");
    } catch (e) {
      toast.error(staffErrorMessage(e, "Could not check out this visit."));
    } finally {
      setCheckingOut(false);
      setCheckoutArmed(false);
    }
  }

  const p = patient.data;

  return (
    <>
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              {patient.loading ? "Patient chart" : p?.full_name ?? "Patient chart"}
              {!patient.loading && p && <Badge variant="secondary">{p.gender ?? "—"}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : patient.error || !p ? (
              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <p>
                  {patient.error ??
                    "This patient chart is not available right now."}
                </p>
                <p className="flex items-center gap-2 text-xs">
                  Access requires the patient&apos;s approved request for an
                  active visit at your hospital.
                </p>
                <div>
                  <Button variant="outline" size="sm" onClick={patient.reload}>
                    Try again
                  </Button>
                </div>
              </div>
            ) : (
              <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Date of birth</dt>
                  <dd>{p.date_of_birth ? formatDate(p.date_of_birth) : "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Blood type</dt>
                  <dd>{p.blood_type ?? "—"}</dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <CardTitle className="text-base">AI clinical summary</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSummarize}
              disabled={summarizing}
            >
              <Sparkles className="mr-2 size-4" />
              {summarizing ? "Summarizing…" : summary ? "Regenerate" : "See AI summary"}
            </Button>
          </CardHeader>
          <CardContent>
            {summary ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{summary}</p>
            ) : summaryError ? (
              <p className="text-sm text-destructive">{summaryError}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Generate a concise brief of this patient&apos;s chart with AI.
                Always verify against the raw records below — this is not medical advice.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <StaffRecordsList
          records={records.data}
          loading={records.loading}
          error={records.error}
          canVerify={canVerify}
          onRetry={records.reload}
          onChanged={records.reload}
        />
      </div>

      {canAddNotes && (
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Add chart note</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNote} className="flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="note-type">Entry type</Label>
                    <Input
                      id="note-type"
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value)}
                      placeholder="e.g. diagnosis, medication, allergy"
                      maxLength={100}
                      autoComplete="off"
                      disabled={saving}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="note-body">Note</Label>
                    <Textarea
                      id="note-body"
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      placeholder="Clinical note"
                      rows={3}
                      maxLength={2000}
                      disabled={saving}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={!noteType.trim() || !noteBody.trim() || saving}>
                    {saving ? "Adding…" : "Add to chart"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {canCheckout && (
        <div className="px-4 lg:px-6">
          <Card className="border-amber-300 dark:border-amber-700">
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Ends this visit and revokes this patient&apos;s chart access
                for your hospital.
              </p>
              <Button
                variant={checkoutArmed ? "destructive" : "outline"}
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut
                  ? "Checking out…"
                  : checkoutArmed
                    ? "Confirm check-out"
                    : "Check out visit"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export default function StaffPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ProtectedPage userTypes={["hospital_staff"]}>
        <StaffShell title="Patient chart">
          <PatientChartLoader params={params} />
        </StaffShell>
      </ProtectedPage>
    </Suspense>
  );
}

function PatientChartLoader({ params }: { params: Promise<{ id: string }> }) {
  const [patientId, setPatientId] = useState<string | null>(null);

  // Next 15 async params — resolve once; the id is a server-validated UUID
  // on every API call (invalid ids 404, un-granted ids 403).
  useEffect(() => {
    let cancelled = false;
    void params.then((p) => {
      if (!cancelled) setPatientId(p.id);
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  if (!patientId) return null;
  return <PatientChart patientId={patientId} />;
}
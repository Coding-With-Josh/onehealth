"use client";

/**
 * Staff card lookup — the hospital check-in identity step.
 *
 * Flow (consent-gated by design): lookup returns ONLY identity (name, DOB,
 * gender) and `access_request_required: true`. Chart access requires the
 * patient to approve an access request tied to an ACTIVE visit. This page
 * starts the visit (POST /visits/) and files the access request
 * (POST /access-requests/) — the patient must approve it in their portal
 * before any PHI is returned. The verify/record APIs enforce this
 * server-side regardless of what the UI does.
 */
import { ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { formatDate } from "@/components/dashboard/MedicalRecordsTable";
import { StaffShell } from "@/components/staff/StaffShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProtectedPage } from "@/lib/auth/guards";
import {
  createAccessRequest,
  lookupCard,
  staffErrorMessage,
  startVisit,
  type CardLookupResult,
} from "@/lib/api/staff";

function LookupPage() {
  const searchParams = useSearchParams();
  const [ref, setRef] = useState("");

  // Prefill from the workspace quick-search (?ref=OH-…). The parameter is
  // display state only — the lookup call still validates + hits the API.
  useEffect(() => {
    const fromQuery = searchParams.get("ref");
    if (fromQuery) setRef(fromQuery);
  }, [searchParams]);

  const [result, setResult] = useState<CardLookupResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [starting, setStarting] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const clean = ref.trim().toUpperCase();
    if (!clean || searching) return;
    if (clean.length > 100) {
      toast.error("Card reference is too long.");
      return;
    }
    setSearching(true);
    setResult(null);
    try {
      const found = await lookupCard(clean);
      setResult(found);
    } catch (e) {
      toast.error(staffErrorMessage(e, "Could not look up this card."));
    } finally {
      setSearching(false);
    }
  }

  async function handleStartVisitAndRequest() {
    if (!result || starting) return; // in-flight lock (double-submit guard)
    setStarting(true);
    try {
      const visit = await startVisit(result.patient_id);
      await createAccessRequest(visit.id, "full_record");
      toast.success("Visit started — access request sent. Awaiting patient approval.");
    } catch (e) {
      toast.error(staffErrorMessage(e, "Could not start the visit."));
    } finally {
      setStarting(false);
    }
  }

  return (
    <StaffShell title="Card lookup">
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Identify a patient</CardTitle>
            <CardDescription>
              Enter the reference on the patient&apos;s card. This returns
              identity only — medical records stay locked until the patient
              approves access.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form onSubmit={handleLookup} className="flex gap-2">
              <Label htmlFor="card-ref" className="sr-only">
                Card reference
              </Label>
              <Input
                id="card-ref"
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                placeholder="OH-…"
                autoComplete="off"
                className="max-w-xs font-mono text-sm"
                disabled={searching}
              />
              <Button type="submit" disabled={!ref.trim() || searching}>
                {searching ? "Looking up…" : "Look up"}
              </Button>
            </form>

            {result && (
              <div className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold">{result.full_name}</p>
                  <Badge variant="secondary">Card valid</Badge>
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Date of birth</dt>
                    <dd>
                      {result.date_of_birth ? formatDate(result.date_of_birth) : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Gender</dt>
                    <dd>{result.gender ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Card</dt>
                    <dd className="font-mono text-xs">{result.card_reference}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Expires</dt>
                    <dd>{formatDate(result.card_expires_at)}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="size-4 shrink-0" />
                    Chart access requires the patient&apos;s approval.
                  </p>
                  <Button
                    onClick={handleStartVisitAndRequest}
                    disabled={starting}
                  >
                    {starting
                      ? "Starting visit…"
                      : "Start visit & request access"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StaffShell>
  );
}

export default function StaffLookupPage() {
  return (
    <Suspense fallback={null}>
      <ProtectedPage userTypes={["hospital_staff"]}>
        <LookupPage />
      </ProtectedPage>
    </Suspense>
  );
}
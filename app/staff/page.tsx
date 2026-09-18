"use client";

/**
 * Hospital-staff workspace landing.
 *
 * Lists the hospital's ACTIVE access grants (patients who have approved
 * chart access for an ongoing visit). Rows link to the patient chart; the
 * chart itself is grant-gated server-side on every request. The card
 * lookup sits one click away for walk-in patients without consent yet.
 *
 * Values come from lib/api/staff.ts (lib/api/use-resource.ts) — each
 * widget degrades independently to a safe state, never partial data.
 */
import { FileSearch, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { useStaffActiveGrants } from "@/lib/api/staff";

function accessLevelBadge(level: string) {
  if (level === "critical_info_only") {
    return <Badge variant="secondary">Critical info only</Badge>;
  }
  return <Badge className="bg-green-600 text-white">Full record</Badge>;
}

export default function StaffWorkspacePage() {
  const grants = useStaffActiveGrants();
  const router = useRouter();
  const [ref, setRef] = useState("");

  const list = grants.data ?? [];
  const fullAccess = list.filter((g) => g.access_level === "full_record").length;

  async function submitLookup(e: React.FormEvent) {
    e.preventDefault();
    const clean = ref.trim().toUpperCase();
    if (!clean) return;
    router.push(`/staff/lookup/?ref=${encodeURIComponent(clean)}`);
  }

  return (
    <ProtectedPage userTypes={["hospital_staff"]}>
      <StaffShell title="Active patients">
        <div className="px-4 lg:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active patients</CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {grants.loading ? "…" : grants.error ? "—" : String(list.length)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {grants.loading
                    ? "Loading"
                    : grants.error
                      ? "Unavailable right now"
                      : "with approved chart access"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Full record</CardTitle>
                <ShieldCheck className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {grants.loading ? "…" : grants.error ? "—" : String(fullAccess)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {grants.loading
                    ? "Loading"
                    : grants.error
                      ? "Unavailable right now"
                      : "full chart access patients"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Card lookup</CardTitle>
                <FileSearch className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <form onSubmit={submitLookup} className="flex gap-2">
                  <Label htmlFor="quick-ref" className="sr-only">
                    Card reference
                  </Label>
                  <Input
                    id="quick-ref"
                    value={ref}
                    onChange={(e) => setRef(e.target.value)}
                    placeholder="OH-…"
                    autoComplete="off"
                    className="font-mono text-sm"
                  />
                  <Button type="submit" disabled={!ref.trim()}>
                    Look up
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground">
                  Identify a walk-in patient. Chart access still needs patient
                  approval.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Patients with approved access</CardTitle>
              <CardDescription>
                People whose access request your hospital approved for an active
                visit. Opening a chart re-validates consent on the server.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {grants.loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : grants.error && !grants.data ? (
                <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                  <p>{grants.error}</p>
                  <div>
                    <Button variant="outline" size="sm" onClick={grants.reload}>
                      Try again
                    </Button>
                  </div>
                </div>
              ) : list.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active access grants. Look up a patient card to start a
                  visit and request access.
                </p>
              ) : (
                <ul className="divide-y">
                  {list.map((grant) => (
                    <li key={grant.id} className="py-3">
                      <Link
                        href={`/staff/patients/${grant.access_request.patient}/?visit=${grant.access_request.visit}&level=${grant.access_level}`}
                        className="flex items-center justify-between gap-4 rounded-md px-2 py-2 transition-colors hover:bg-muted"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {grant.patient_name || "Patient"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {grant.patient_date_of_birth
                              ? `DOB ${formatDate(grant.patient_date_of_birth)}`
                              : "DOB —"}{" "}
                            · approved {formatDate(grant.granted_at)} · visit{" "}
                            {grant.visit_status ?? "active"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {accessLevelBadge(grant.access_level)}
                          <Badge variant="outline">Open chart</Badge>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </StaffShell>
    </ProtectedPage>
  );
}
"use client";

/**
 * Patient chart record list for hospital staff.
 *
 * Verify is a DOCTOR-only clinical action (IsDoctor server-side). The
 * button is hidden for non-doctors as a hint; a forced call still gets a
 * 403 from the API — the server is the only enforcement point (Phase 1,
 * complete mediation). Verification of an already-verified entry returns
 * the existing verified record (idempotent, API-side).
 */
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { formatDate } from "@/components/dashboard/MedicalRecordsTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { verifyRecord, type MedicalRecord } from "@/lib/api/staff";

function statusBadge(status: string) {
  if (status === "doctor_verified") {
    return (
      <Badge className="gap-1 bg-green-600 text-white">
        <BadgeCheck className="size-3" />
        Verified
      </Badge>
    );
  }
  return <Badge variant="secondary">Self-reported</Badge>;
}

export function StaffRecordsList({
  records,
  loading,
  error,
  canVerify,
  onRetry,
  onChanged,
}: {
  records: MedicalRecord[] | null;
  loading: boolean;
  error: string | null;
  /** Show/hide the verify action (UI hint — API still enforces IsDoctor). */
  canVerify: boolean;
  onRetry: () => void;
  onChanged: () => void;
}) {
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  async function handleVerify(recordId: string) {
    if (verifyingId) return; // in-flight lock (double-submit guard)
    setVerifyingId(recordId);
    try {
      await verifyRecord(recordId);
      toast.success("Record verified");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not verify this record.");
    } finally {
      setVerifyingId(null);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medical records</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Loading…</CardContent>
      </Card>
    );
  }

  if (error && !records) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medical records</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>{error}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4" />
            Access is limited to active, patient-approved visits.
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const list = records ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical records</CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records on file.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Recorded by</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="font-medium">{record.entry_type}</div>
                    <div className="line-clamp-2 max-w-[28rem] text-xs text-muted-foreground">
                      {record.description}
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(record.verification_status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(record.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {record.created_by_name ?? "Patient self-report"}
                  </TableCell>
                  <TableCell>
                    {canVerify && record.verification_status === "self_reported" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={verifyingId !== null}
                        onClick={() => handleVerify(record.id)}
                      >
                        {verifyingId === record.id ? "Verifying…" : "Verify"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
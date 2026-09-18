"use client";

/**
 * Medical records table (styled after the shadcn dashboard data-table
 * block, but deliberately without drag-drop / drawer editing: this is a
 * read-mostly clinical list, so the only interactions are filter, search
 * and paginate — no ambient write surface).
 */
import { AlertCircle, CircleCheck, Clock, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { MedicalRecord } from "@/lib/api/patient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 8;

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const verified = status === "doctor_verified";
  return (
    <Badge variant="outline" className="px-1.5 text-muted-foreground">
      {verified ? (
        <CircleCheck className="fill-green-500 dark:fill-green-400" />
      ) : (
        <Clock className="text-amber-500" />
      )}
      {verified ? "Verified" : "Self-reported"}
    </Badge>
  );
}

export function MedicalRecordsTable({
  records,
  loading,
  error,
  onRetry,
}: {
  records: MedicalRecord[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "self_reported" | "doctor_verified">("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!records) return [];
    const q = query.trim().toLowerCase();
    const newestFirst = [...records].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return newestFirst.filter((r) => {
      if (status !== "all" && r.verification_status !== status) return false;
      if (!q) return true;
      return (
        r.entry_type.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.hospital_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [records, query, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-3 px-4 lg:px-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-10 text-center lg:px-6">
        <AlertCircle className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  const noRecords = records && records.length === 0;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      {records && records.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Label htmlFor="record-search" className="sr-only">
              Search records
            </Label>
            <Input
              id="record-search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search records…"
              className="pl-8"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v: string) => {
              setStatus(v as typeof status);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="doctor_verified">Verified</SelectItem>
              <SelectItem value="self_reported">Self-reported</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground sm:ml-auto">
            {filtered.length} record{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              <TableHead className="w-40">Entry</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden w-52 md:table-cell">Hospital</TableHead>
              <TableHead className="w-36">Status</TableHead>
              <TableHead className="w-32 text-right">Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {noRecords ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No records yet — your entries will appear here.
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No records match your filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.entry_type}</TableCell>
                  <TableCell className="max-w-md">
                    <span
                      className="line-clamp-2 text-muted-foreground"
                      title={r.description}
                    >
                      {r.description}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span
                      className="line-clamp-1 text-muted-foreground"
                      title={r.hospital_name ?? undefined}
                    >
                      {r.hospital_name ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.verification_status} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(r.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!noRecords && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {safePage + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

/**
 * Medical records page — full list plus a self-report form.
 * The form is allow-listed client-side (trim + max lengths); the API
 * re-validates and is the enforcement point. No record IDs are ever
 * sent by the client, so there is no IDOR surface here.
 */
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/dashboard/AppShell";
import { MedicalRecordsTable } from "@/components/dashboard/MedicalRecordsTable";
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
import { createMyRecord, useMyRecords } from "@/lib/api/patient";

const MUTATION_ERROR =
  "Couldn't add the record. Please check the details and try again.";

export default function RecordsPage() {
  const records = useMyRecords();
  const [entryType, setEntryType] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function resetFields() {
    setEntryType("");
    setDescription("");
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return; // in-flight lock — no double submit
    setFormError(null);
    setSubmitting(true);
    try {
      const record = await createMyRecord({ entry_type: entryType, description });
      toast.success(`${record.entry_type} record added`);
      resetFields();
      records.reload();
    } catch (e) {
      console.error("[records] create failed", e);
      setFormError(e instanceof Error ? e.message : MUTATION_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedPage userTypes={["patient"]}>
      <AppShell title="Medical records">
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add a record</CardTitle>
              <CardDescription>
                Self-reported entries show as &quot;Self-reported&quot; until a
                doctor verifies them during a visit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-2 md:col-span-1">
                    <Label htmlFor="entry-type">Entry type</Label>
                    <Input
                      id="entry-type"
                      value={entryType}
                      onChange={(e) => setEntryType(e.target.value)}
                      placeholder="e.g. Allergy"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What would you like to note on your record?"
                      required
                      rows={2}
                      maxLength={2000}
                      className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
                {formError && (
                  <p
                    role="alert"
                    className="flex items-center gap-2 text-sm text-destructive"
                  >
                    <AlertCircle className="size-4" />
                    {formError}
                  </p>
                )}
                <div>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Adding…
                      </>
                    ) : (
                      "Add record"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <MedicalRecordsTable
          records={records.data}
          loading={records.loading}
          error={records.error}
          onRetry={records.reload}
        />
      </AppShell>
    </ProtectedPage>
  );
}
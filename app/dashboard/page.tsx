"use client";

/**
 * Patient dashboard — overview cards, visits chart, recent records.
 * All values come from live API hooks (lib/api/patient.ts); each widget
 * degrades independently and renders a safe state, never partial data.
 */
import { AppShell } from "@/components/dashboard/AppShell";
import { MedicalRecordsTable, formatDate } from "@/components/dashboard/MedicalRecordsTable";
import { SectionCards } from "@/components/dashboard/SectionCards";
import { VisitsChart } from "@/components/dashboard/VisitsChart";
import { ProtectedPage } from "@/lib/auth/guards";
import { useMyCard, useMyProfile, useMyRecords, useMyVisits } from "@/lib/api/patient";

function valueOrDash(loading: boolean, errored: boolean, value: string): string {
  if (loading) return "…";
  if (errored) return "—";
  return value;
}

export default function DashboardPage() {
  const profile = useMyProfile();
  const card = useMyCard();
  const records = useMyRecords();
  const visits = useMyVisits();

  const recordCount = records.data?.length ?? 0;
  const totalVisits = visits.data?.length ?? 0;
  const activeVisits = visits.data?.filter((v) => v.status === "active").length ?? 0;

  return (
    <ProtectedPage userTypes={["patient"]}>
      <AppShell title="Dashboard">
        <SectionCards
          items={[
            {
              label: "Medical records",
              value: valueOrDash(records.loading, records.error !== null, String(recordCount)),
              hint: records.error
                ? "Unavailable right now"
                : `${recordCount} on file`,
            },
            {
              label: "Patient card",
              value: valueOrDash(
                card.loading,
                card.error !== null,
                card.data?.is_active ? "Active" : "No card",
              ),
              hint: card.data?.card_reference
                ? card.data.is_active
                  ? `Renews ${formatDate(card.data.expires_at)}`
                  : "Card exists but is inactive"
                : card.error
                  ? "Unavailable right now"
                  : "Issue one from My Card",
            },
            {
              label: "Visits",
              value: valueOrDash(visits.loading, visits.error !== null, String(totalVisits)),
              hint: visits.error
                ? "Unavailable right now"
                : activeVisits > 0
                  ? `${activeVisits} active visit${activeVisits === 1 ? "" : "s"}`
                  : "No active visit",
            },
            {
              label: "Blood type",
              value: valueOrDash(
                profile.loading,
                profile.error !== null,
                profile.data?.blood_type ?? "—",
              ),
              hint: profile.data
                ? profile.data.full_name
                : profile.error
                  ? "Unavailable right now"
                  : "Profile",
            },
          ]}
        />

        <div className="px-4 lg:px-6">
          <VisitsChart visits={visits.data} />
        </div>

        <div className="flex flex-col gap-3 px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Medical records</h2>
          </div>
          <MedicalRecordsTable
            records={records.data}
            loading={records.loading}
            error={records.error}
            onRetry={records.reload}
          />
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
"use client";

/**
 * My Card page — patient emergency card lifecycle.
 *
 * Mutations (issue / renew) POST through apiFetch with an in-flight lock:
 * the button is disabled and a second click is ignored until the request
 * settles, closing the double-submit window (Phase 3 TOCTOU row). The
 * server stays the source of truth — we refresh card data after success.
 */
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/dashboard/AppShell";
import { formatDate } from "@/components/dashboard/MedicalRecordsTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedPage } from "@/lib/auth/guards";
import {
  issueMyCard,
  renewMyCard,
  useMyCard,
  type PatientCard,
} from "@/lib/api/patient";

const MUTATION_ERROR = "The card action couldn't be completed. Please try again.";

function cardBadge(card: PatientCard | null): React.ReactNode {
  if (!card) {
    return (
      <Badge variant="outline" className="px-1.5 text-muted-foreground">
        No card
      </Badge>
    );
  }
  if (card.status === "revoked") {
    return (
      <Badge variant="outline" className="px-1.5 text-destructive">
        Revoked
      </Badge>
    );
  }
  if (!card.is_active) {
    return (
      <Badge variant="outline" className="px-1.5 text-amber-600">
        Expired
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="px-1.5 text-green-700">
      Active
    </Badge>
  );
}

export default function CardPage() {
  const card = useMyCard();
  const [busyAction, setBusyAction] = useState<"issue" | "renew" | null>(null);

  function runMutation(action: "issue" | "renew") {
    if (busyAction) return; // in-flight lock
    setBusyAction(action);
    const promise =
      action === "issue" ? issueMyCard() : renewMyCard();
    promise
      .then((updated) => {
        toast.success(
          action === "issue"
            ? `Card issued — ${updated.card_reference}`
            : "Card renewed — validity extended by one year",
        );
        card.reload();
      })
      .catch((e: unknown) => {
        console.error(`[card] ${action} failed`, e);
        toast.error(MUTATION_ERROR);
      })
      .finally(() => setBusyAction(null));
  }

  const cardData = card.data;
  const canRenew = cardData !== null && cardData.status !== "revoked";

  return (
    <ProtectedPage userTypes={["patient"]}>
      <AppShell title="My card">
        <div className="px-4 lg:px-6">
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>OneHealth card</CardTitle>
                {card.loading ? (
                  <Skeleton className="h-5 w-16" />
                ) : card.error ? null : (
                  cardBadge(cardData)
                )}
              </div>
              <CardDescription>
                Your emergency access card for hospitals in the OneHealth
                network.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {card.loading ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-10 w-56" />
                  <Skeleton className="h-4 w-72" />
                  <Skeleton className="h-4 w-64" />
                </div>
              ) : card.error ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-10 text-center">
                  <AlertCircle className="size-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{card.error}</p>
                  <Button variant="outline" size="sm" onClick={card.reload}>
                    Retry
                  </Button>
                </div>
              ) : cardData ? (
                <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Reference</dt>
                    <dd className="font-mono text-base font-medium tracking-tight">
                      {cardData.card_reference}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Issued</dt>
                    <dd>{formatDate(cardData.issued_at)}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Renewed</dt>
                    <dd>{cardData.renewed_at ? formatDate(cardData.renewed_at) : "—"}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Expires</dt>
                    <dd>{formatDate(cardData.expires_at)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have an active card yet. Issue one to get a
                  card reference hospitals can look up in an emergency.
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-end">
              {!card.loading && !card.error && (
                <>
                  {cardData === null ? (
                    <Button
                      onClick={() => runMutation("issue")}
                      disabled={busyAction !== null}
                    >
                      {busyAction === "issue" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      Issue my card
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => runMutation("renew")}
                      disabled={busyAction !== null || !canRenew}
                    >
                      {busyAction === "renew" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      {cardData.is_active ? "Renew card" : "Renew expired card"}
                    </Button>
                  )}
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
"use client";

/**
 * Shared authenticated shell for the hospital-staff workspace. Mirrors the
 * patient AppShell (inset sidebar, header, content column) with the staff
 * sidebar. PHI guidance: nothing on these pages is ever written to
 * localStorage — all data lives in component state and dies with the tab.
 */
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { SiteHeader } from "@/components/dashboard/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export function StaffShell({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <StaffSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={title} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
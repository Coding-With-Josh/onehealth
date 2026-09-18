"use client";

/**
 * Patient portal sidebar.
 *
 * Navigation is role-scoped at render AND at the API: the three live
 * links are /patients/me/* endpoints behind IsPatient, and ProtectedPage
 * (guards.tsx) kicks non-patients out of these routes before they render.
 * "Soon" entries are disabled placeholders — no dead hrefs, no fake pages.
 */
import {
  CalendarHeart,
  CreditCard,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/lib/auth/provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_LIVE = [
  { title: "Dashboard", url: "/dashboard/", icon: LayoutDashboard },
  { title: "Medical Records", url: "/records/", icon: FileText },
  { title: "My Card", url: "/card/", icon: CreditCard },
];

const NAV_SOON = [
  { title: "Visits", icon: CalendarHeart },
  { title: "Access & sharing", icon: ShieldCheck },
];

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function NavUser() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  // profile is the PatientProfile from the session (login or /me bootstrap).
  const fullName =
    typeof profile?.full_name === "string" ? profile.full_name : "";
  const name = fullName || user?.email || "Patient";
  const initials = initialsOf(name);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      // Best-effort server blacklist + unconditional local wipe (session.ts).
      await logout();
    } finally {
      router.replace("/sign-in");
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg bg-green-600 text-white">
                <AvatarFallback className="rounded-lg text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="right"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg bg-green-600 text-white">
                  <AvatarFallback className="rounded-lg text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account/">Account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => {
                if (signingOut) e.preventDefault();
              }}
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <LogOut />
              {signingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/" className="flex items-center gap-2">
                {/* Brand logo (public/logo.png) — static, compiled-in asset */}
                <Image
                  src="/logo.png"
                  alt="OneHealth logo"
                  width={28}
                  height={28}
                  className="size-7 shrink-0 rounded-lg object-contain"
                  priority
                />
                <span className="text-base font-semibold">OneHealth</span>
                <Badge
                  variant="outline"
                  className="ml-auto px-1.5 text-[10px] font-normal text-muted-foreground"
                >
                  Patient
                </Badge>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_LIVE.map((item) => {
              const active = pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={active}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>More</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_SOON.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  aria-disabled
                  disabled
                  className="opacity-60"
                >
                  <item.icon />
                  <span>{item.title}</span>
                  <Badge
                    variant="outline"
                    className="ml-auto px-1.5 text-[10px] font-normal text-muted-foreground"
                  >
                    Soon
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/">
                  <LifeBuoy />
                  <span>Help &amp; home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
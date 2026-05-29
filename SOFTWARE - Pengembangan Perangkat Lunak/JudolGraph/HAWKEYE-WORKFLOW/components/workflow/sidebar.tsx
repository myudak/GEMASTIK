"use client";

import {
  Camera,
  ClipboardText,
  FileText,
  Folder,
  GlobeHemisphereWest,
  Graph,
  House,
  IdentificationCard,
  ShieldCheck,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/workflow/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/cases/new", label: "Kasus", icon: Folder },
  { href: "/crawler", label: "Crawler", icon: GlobeHemisphereWest },
  { href: "/screenshots", label: "Screenshot & OCR", icon: Camera },
  { href: "/evidence-graph", label: "Evidence Graph", icon: Graph },
  { href: "/entities/slot-gacor88", label: "Entitas", icon: IdentificationCard },
  { href: "/review", label: "Review", icon: ClipboardText },
  { href: "/reports", label: "Laporan", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[290px] flex-col border-r border-sidebar-border bg-sidebar/95 px-5 py-9 text-sidebar-foreground backdrop-blur md:flex">
      <Link href="/cases/new" className="mb-12 flex items-center gap-3">
        <Image
          src="/hawkeye_dark_rounded_bg_transparent_512.png"
          alt="HAWKEYE"
          width={70}
          height={70}
          className="hidden size-16 object-contain dark:block"
          priority
        />
        <Image
          src="/hawkeye_light_rounded_bg_transparent_512.png"
          alt="HAWKEYE"
          width={70}
          height={70}
          className="size-16 object-contain dark:hidden"
          priority
        />
        <div>
          <p className="text-[26px] font-black leading-none text-sidebar-foreground">HAWKEYE</p>
          <p className="mt-2 text-[11px] font-bold text-sidebar-primary">
            DIGITAL INVESTIGATION TOOL
          </p>
        </div>
      </Link>

      <nav className="space-y-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "flex h-[60px] items-center gap-4 rounded-lg px-5 text-lg text-sidebar-foreground/72 transition",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_0_38px_color-mix(in_oklch,var(--sidebar-primary)_28%,transparent)]"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon aria-hidden size={30} weight={active ? "duotone" : "regular"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-5">
        <ThemeToggle />
        <div className="flex items-center gap-4 text-sidebar-foreground/62">
          <ShieldCheck aria-hidden size={42} />
          <p className="max-w-[180px] text-base leading-snug">
            Tool untuk investigasi yang etis & legal
          </p>
        </div>
      </div>
    </aside>
  );
}

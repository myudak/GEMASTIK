"use client";

import {
  Camera,
  FileText,
  Folder,
  GlobeHemisphereWest,
  Graph,
  ShieldCheck,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/cases/new", label: "Kasus", icon: Folder },
  { href: "/crawler", label: "Crawler", icon: GlobeHemisphereWest },
  { href: "/screenshots", label: "Screenshot & OCR", icon: Camera },
  { href: "/evidence-graph", label: "Evidence Graph", icon: Graph },
  { href: "/reports", label: "Laporan", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-sidebar fixed inset-y-0 left-0 z-20 hidden w-[290px] flex-col border-r bg-[#031327]/92 px-5 py-9 backdrop-blur md:flex">
      <Link href="/cases/new" className="mb-12 flex items-center gap-3">
        <Image
          src="/hawkeye-logo.png"
          alt="HAWKEYE"
          width={70}
          height={70}
          className="size-16 object-contain"
          priority
        />
        <div>
          <p className="text-[26px] font-black leading-none text-white">HAWKEYE</p>
          <p className="mt-2 text-[11px] font-bold text-blue-300">DIGITAL INVESTIGATION TOOL</p>
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
                "flex h-[60px] items-center gap-4 rounded-[8px] px-5 text-lg text-slate-300 transition",
                active
                  ? "bg-blue-600/82 text-white shadow-[0_0_40px_rgba(37,99,235,0.22)]"
                  : "hover:bg-white/[0.05] hover:text-white",
              )}
            >
              <Icon aria-hidden size={30} weight={active ? "duotone" : "regular"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-4 text-slate-400">
        <ShieldCheck aria-hidden size={42} />
        <p className="max-w-[180px] text-base leading-snug">
          Tool untuk investigasi yang etis & legal
        </p>
      </div>
    </aside>
  );
}

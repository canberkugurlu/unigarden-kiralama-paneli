"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Home,
  Phone,
  Mail,
  CheckSquare,
  UserCog,
  DollarSign,
  ChevronDown,
  Calendar,
  Building2,
} from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const MENU = [
  {
    baslik: null,
    items: [
      { href: "/", label: "Ana Panel", icon: LayoutDashboard },
    ],
  },
  {
    baslik: "VARLIK",
    items: [
      { href: "/konutlar",   label: "Daireler",              icon: Building2 },
    ],
  },
  {
    baslik: "KİRALAMA CRM",
    items: [
      { href: "/leads",      label: "Potansiyel Müşteriler", icon: Users },
      { href: "/turlar",     label: "Daire Gezdirme",        icon: Home },
      { href: "/gorusmeler", label: "Telefon Görüşmeleri",   icon: Phone },
      { href: "/davetler",   label: "E-Posta Davetleri",     icon: Mail },
    ],
  },
  {
    baslik: "ONAY & YÖNETİM",
    items: [
      { href: "/onaylar",  label: "Kiralama Onayları", icon: CheckSquare },
      { href: "/ekip",     label: "Ekip Yönetimi",     icon: UserCog },
      { href: "/hakedis",  label: "Hakediş Raporları", icon: DollarSign },
      { href: "/takvim",   label: "Randevu Takvimi",   icon: Calendar },
    ],
  },
  {
    baslik: "DİĞER PANELLER",
    items: [
      { href: "http://localhost:3000", label: "Kira Yönetim",  icon: LayoutDashboard, harici: true },
    ],
  },
];

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  harici?: boolean;
}

interface MenuGroup {
  baslik: string | null;
  items: MenuItem[];
}

function MenuGrubu({ grup, pathname }: { grup: MenuGroup; pathname: string }) {
  const [acik, setAcik] = useState(true);

  return (
    <div>
      {grup.baslik && (
        <button
          onClick={() => setAcik((a) => !a)}
          className="w-full flex items-center justify-between px-4 py-2 mt-2"
        >
          <span className="text-[10px] font-semibold tracking-widest text-gray-500">
            {grup.baslik}
          </span>
          <ChevronDown
            size={12}
            className={`text-gray-500 transition-transform ${acik ? "" : "-rotate-90"}`}
          />
        </button>
      )}

      {acik && (
        <div className="space-y-0.5">
          {grup.items.map(({ href, label, icon: Icon, harici }) => {
            const active = !harici && pathname === href;
            return harici ? (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                <svg className="w-3 h-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-violet-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-gray-900 text-white flex flex-col">
      <div className="px-5 py-4 border-b border-gray-700/60 shrink-0 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/UNIGARDEN_LOGO_nobg.png" alt="Unigarden Logo" className="w-10 h-10 object-contain shrink-0" />
          <p className="text-xs text-gray-400 leading-tight">Kiralama Paneli</p>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {MENU.map((grup, i) => (
          <MenuGrubu key={i} grup={grup} pathname={pathname} />
        ))}
      </nav>

      <div className="px-5 py-3 border-t border-gray-700/60 text-xs text-gray-500 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px]">v1.0.0 &copy; {new Date().getFullYear()} Unigarden</span>
            <ThemeToggle className="!text-gray-400 hover:!bg-gray-800" />
          </div>
        </div>
    </aside>
  );
}

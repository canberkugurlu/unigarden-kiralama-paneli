"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/":              "Ana Panel",
  "/leads":         "Potansiyel Müşteriler",
  "/leads/yeni":    "Yeni Müşteri",
  "/leads/[id]":    "Müşteri Kartı",
  "/turlar":        "Daire Gezdirme Raporları",
  "/gorusmeler":    "Telefon Görüşmeleri",
  "/davetler":      "E-Posta Davetleri",
  "/onaylar":       "Kiralama Onayları",
  "/ekip":          "Ekip Yönetimi",
  "/hakedis":       "Hakediş Raporları",
  "/takvim":        "Randevu Takvimi",
};

export default function Header() {
  const pathname = usePathname();
  const normalized = pathname
    .replace(/\/leads\/[^/]+$/, "/leads/[id]");
  const title = titles[normalized] ?? titles[pathname] ?? "Kiralama Paneli";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="text-sm text-gray-500">
        {new Date().toLocaleDateString("tr-TR", { dateStyle: "long" })}
      </div>
    </header>
  );
}

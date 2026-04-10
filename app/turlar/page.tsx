"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Search, Calendar, User } from "lucide-react";

interface Tur {
  id: string;
  daireNo: string | null;
  tarih: string;
  sonuc: string;
  notlar: string | null;
  yapanAd: string;
  olusturmaTar: string;
  musteri: { id: string; ad: string; soyad: string; telefon: string };
}

const SONUC_RENK: Record<string, string> = {
  Belirsiz: "bg-gray-100 text-gray-600",
  Olumlu: "bg-green-100 text-green-700",
  Olumsuz: "bg-red-100 text-red-700",
  TeklifBekleniyor: "bg-orange-100 text-orange-700",
};

export default function TurlarPage() {
  const router = useRouter();
  const [turlar, setTurlar] = useState<Tur[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");
  const [sonucFiltre, setSonucFiltre] = useState("Tumu");

  useEffect(() => {
    fetch("/api/turlar")
      .then(r => r.json())
      .then(d => { setTurlar(d); setYukleniyor(false); });
  }, []);

  const filtreli = turlar.filter(t => {
    const metin = `${t.musteri.ad} ${t.musteri.soyad} ${t.daireNo ?? ""} ${t.yapanAd}`.toLowerCase();
    if (arama && !metin.includes(arama.toLowerCase())) return false;
    if (sonucFiltre !== "Tumu" && t.sonuc !== sonucFiltre) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={arama} onChange={e => setArama(e.target.value)} placeholder="Müşteri, daire ara…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
        <select value={sonucFiltre} onChange={e => setSonucFiltre(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="Tumu">Tüm Sonuçlar</option>
          {["Belirsiz", "Olumlu", "Olumsuz", "TeklifBekleniyor"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {yukleniyor ? (
        <div className="text-center py-20 text-gray-400 text-sm">Yükleniyor…</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtreli.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Home size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Tur kaydı bulunamadı</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Müşteri</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Daire No</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tarih</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Sonuç</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Yapan</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Notlar</th>
                </tr>
              </thead>
              <tbody>
                {filtreli.map(t => (
                  <tr key={t.id} onClick={() => router.push(`/leads/${t.musteri.id}`)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{t.musteri.ad} {t.musteri.soyad}</p>
                      <p className="text-xs text-gray-500">{t.musteri.telefon}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.daireNo ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="flex items-center gap-1"><Calendar size={11} />{new Date(t.tarih).toLocaleDateString("tr-TR")}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${SONUC_RENK[t.sonuc] ?? "bg-gray-100 text-gray-600"}`}>{t.sonuc}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="flex items-center gap-1"><User size={11} />{t.yapanAd}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{t.notlar ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

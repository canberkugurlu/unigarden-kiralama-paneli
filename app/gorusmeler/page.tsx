"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Search, Calendar, Clock } from "lucide-react";

interface Gorusme {
  id: string;
  tarih: string;
  sure: number;
  yon: string;
  ozet: string | null;
  sonuc: string;
  arayanAd: string;
  olusturmaTar: string;
  musteri: { id: string; ad: string; soyad: string; telefon: string };
}

const YON_RENK: Record<string, string> = {
  Giden: "bg-gray-100 text-gray-600",
  Gelen: "bg-blue-100 text-blue-700",
};

export default function GorusmelerPage() {
  const router = useRouter();
  const [gorusmeler, setGorusmeler] = useState<Gorusme[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");
  const [yonFiltre, setYonFiltre] = useState("Tumu");

  useEffect(() => {
    fetch("/api/gorusmeler")
      .then(r => r.json())
      .then(d => { setGorusmeler(d); setYukleniyor(false); });
  }, []);

  const filtreli = gorusmeler.filter(g => {
    const metin = `${g.musteri.ad} ${g.musteri.soyad} ${g.arayanAd}`.toLowerCase();
    if (arama && !metin.includes(arama.toLowerCase())) return false;
    if (yonFiltre !== "Tumu" && g.yon !== yonFiltre) return false;
    return true;
  });

  const toplamSure = filtreli.reduce((s, g) => s + g.sure, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={arama} onChange={e => setArama(e.target.value)} placeholder="Müşteri, temsilci ara…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
        <select value={yonFiltre} onChange={e => setYonFiltre(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="Tumu">Giden + Gelen</option>
          <option value="Giden">Yalnız Giden</option>
          <option value="Gelen">Yalnız Gelen</option>
        </select>
        <div className="ml-auto flex items-center gap-1.5 text-sm text-gray-500">
          <Clock size={14} />
          Toplam: <span className="font-semibold text-gray-800">{toplamSure} dk</span>
        </div>
      </div>

      {yukleniyor ? (
        <div className="text-center py-20 text-gray-400 text-sm">Yükleniyor…</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtreli.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Phone size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Görüşme kaydı bulunamadı</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Müşteri</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tarih</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Yön</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Süre</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Sonuç</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Arayan</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Özet</th>
                </tr>
              </thead>
              <tbody>
                {filtreli.map(g => (
                  <tr key={g.id} onClick={() => router.push(`/leads/${g.musteri.id}`)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{g.musteri.ad} {g.musteri.soyad}</p>
                      <p className="text-xs text-gray-500">{g.musteri.telefon}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="flex items-center gap-1 text-xs"><Calendar size={11} />{new Date(g.tarih).toLocaleString("tr-TR")}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${YON_RENK[g.yon] ?? "bg-gray-100 text-gray-600"}`}>{g.yon}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{g.sure > 0 ? `${g.sure} dk` : "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{g.sonuc}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{g.arayanAd}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">{g.ozet ?? "—"}</td>
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

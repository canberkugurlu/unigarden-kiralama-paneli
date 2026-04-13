"use client";

import { useEffect, useState, useMemo } from "react";
import { Building2, Search, Users, CheckCircle2, Circle } from "lucide-react";

interface Ogrenci { id: string; ad: string; soyad: string; telefon: string }
interface Sozlesme { id: string; oda?: string | null; aylikKira: number; baslangicTarihi: string; bitisTarihi: string; ogrenci: Ogrenci | null }
interface DaireSahibi { id: string; ad: string; soyad: string }
interface Konut {
  id: string; blok: string; katNo: number; daireNo: string;
  tip: string; metrekare: number; kiraBedeli: number;
  durum: string; etap: number;
  daireSahibi?: DaireSahibi | null;
  sozlesmeler: Sozlesme[];
}

const ETAP_LABEL: Record<number, string> = { 1: "1. Etap", 2: "2. Etap", 3: "3. Etap" };

export default function Konutlar() {
  const [konutlar, setKonutlar] = useState<Konut[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");
  const [aktifEtap, setAktifEtap] = useState<"tumu" | 1 | 2 | 3>("tumu");
  const [aktifDurum, setAktifDurum] = useState<"tumu" | "bos" | "dolu">("tumu");

  useEffect(() => {
    fetch("/api/konutlar").then(r => r.ok ? r.json() : []).then((d: Konut[]) => {
      setKonutlar(Array.isArray(d) ? d : []);
      setYukleniyor(false);
    });
  }, []);

  // Etap 2 yurt konsepti: 2 oda → "dolu" sözleşme sayısı = 2 ise Dolu, 1 ise %50, 0 ise Boş
  const durumHesapla = (k: Konut): "Dolu" | "Bos" | "Yari" => {
    const aktifSoz = k.sozlesmeler.length;
    if (k.etap === 2 && ["A","B","C","D","E","F"].includes(k.blok.charAt(0).toUpperCase())) {
      if (aktifSoz >= 2) return "Dolu";
      if (aktifSoz === 1) return "Yari";
      return "Bos";
    }
    return aktifSoz > 0 ? "Dolu" : "Bos";
  };

  const filtreli = useMemo(() => {
    return konutlar.filter(k => {
      if (aktifEtap !== "tumu" && k.etap !== aktifEtap) return false;
      const durum = durumHesapla(k);
      if (aktifDurum === "bos"  && durum !== "Bos") return false;
      if (aktifDurum === "dolu" && durum === "Bos") return false;
      if (arama) {
        const q = arama.toLowerCase();
        const match = k.daireNo.toLowerCase().includes(q) ||
                      k.blok.toLowerCase().includes(q) ||
                      k.sozlesmeler.some(s => s.ogrenci && `${s.ogrenci.ad} ${s.ogrenci.soyad}`.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [konutlar, aktifEtap, aktifDurum, arama]);

  // İstatistikler
  const kapsananKonutlar = useMemo(() => {
    return aktifEtap === "tumu" ? konutlar : konutlar.filter(k => k.etap === aktifEtap);
  }, [konutlar, aktifEtap]);

  const stats = useMemo(() => {
    let dolu = 0, bos = 0, yari = 0;
    for (const k of kapsananKonutlar) {
      const d = durumHesapla(k);
      if (d === "Dolu") dolu++;
      else if (d === "Yari") yari++;
      else bos++;
    }
    return { toplam: kapsananKonutlar.length, dolu, bos, yari };
  }, [kapsananKonutlar]);

  // Blok gruplama
  const bloklar = useMemo(() => {
    const map = new Map<string, Konut[]>();
    for (const k of filtreli) {
      const key = `${k.etap}|${k.blok}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(k);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtreli]);

  const etapSayisi = (etap: number) => konutlar.filter(k => k.etap === etap).length;

  if (yukleniyor) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Daireler</h1>
        <p className="text-xs text-gray-500 mt-1">Tüm daireler ve boş/dolu durumları</p>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Toplam" value={stats.toplam} renk="gray" />
        <StatCard label="Dolu"    value={stats.dolu}   renk="red" />
        <StatCard label="Yarı"    value={stats.yari}   renk="yellow" />
        <StatCard label="Boş"     value={stats.bos}    renk="green" />
      </div>

      {/* Etap sekmeler */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { k: "tumu" as const, label: `Tümü (${konutlar.length})` },
          { k: 1 as const, label: `1. Etap (${etapSayisi(1)})` },
          { k: 2 as const, label: `2. Etap (${etapSayisi(2)})` },
          { k: 3 as const, label: `3. Etap (${etapSayisi(3)})` },
        ].map(t => (
          <button key={String(t.k)} onClick={() => setAktifEtap(t.k)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              aktifEtap === t.k ? "border-violet-600 text-violet-700" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Arama + durum filtre */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={arama} onChange={e => setArama(e.target.value)} placeholder="Daire no, blok veya kiracı..."
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { k: "tumu" as const, label: "Tümü" },
            { k: "dolu" as const, label: "Dolu" },
            { k: "bos"  as const, label: "Boş"  },
          ].map(d => (
            <button key={d.k} onClick={() => setAktifDurum(d.k)}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                aktifDurum === d.k ? "bg-white shadow text-violet-700 font-medium" : "text-gray-500"
              }`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bloklar */}
      {bloklar.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>Filtreye uyan daire yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bloklar.map(([key, ds]) => {
            const [etap, blok] = key.split("|");
            const doluDs  = ds.filter(k => durumHesapla(k) !== "Bos").length;
            return (
              <BlokKart key={key}
                etap={Number(etap)} blok={blok} daireler={ds}
                doluSayi={doluDs} durumFn={durumHesapla} />
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, renk }: { label: string; value: number; renk: "gray"|"red"|"yellow"|"green" }) {
  const renkMap = {
    gray:   "text-gray-700",
    red:    "text-red-600",
    yellow: "text-yellow-600",
    green:  "text-green-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${renkMap[renk]}`}>{value}</p>
    </div>
  );
}

function BlokKart({ etap, blok, daireler, doluSayi, durumFn }: {
  etap: number; blok: string; daireler: Konut[]; doluSayi: number;
  durumFn: (k: Konut) => "Dolu" | "Bos" | "Yari";
}) {
  const [acik, setAcik] = useState(false);
  const bosSayi = daireler.length - doluSayi;

  const sorted = [...daireler].sort((a, z) => {
    const parse = (d: string) => {
      const part = d.split("-").pop() ?? d;
      return { num: parseInt(part, 10) || 0, ltr: part.replace(/\d+/, "") };
    };
    const av = parse(a.daireNo), zv = parse(z.daireNo);
    return av.num !== zv.num ? av.num - zv.num : av.ltr.localeCompare(zv.ltr);
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setAcik(a => !a)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-violet-600 text-white text-sm font-bold flex items-center justify-center">{blok}</span>
          <div className="text-left">
            <p className="font-semibold text-gray-800 text-sm">{blok} Blok <span className="text-xs text-gray-400 ml-1.5">· {ETAP_LABEL[etap]}</span></p>
            <p className="text-xs text-gray-400">{daireler.length} daire · <span className="text-red-600">{doluSayi} dolu</span> · <span className="text-green-600">{bosSayi} boş</span></p>
          </div>
        </div>
        <span className="text-gray-400 text-xs">{acik ? "▲" : "▼"}</span>
      </button>

      {acik && (
        <div className="border-t border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2.5 text-left">Daire</th>
                <th className="px-4 py-2.5 text-left">Kat / Tip</th>
                <th className="px-4 py-2.5 text-left">Kira</th>
                <th className="px-4 py-2.5 text-left">Kiracı</th>
                <th className="px-4 py-2.5 text-left">Durum</th>
                <th className="px-4 py-2.5 text-left">Sahip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map(k => {
                const d = durumFn(k);
                const aktifKiracilar = k.sozlesmeler.filter(s => s.ogrenci).map(s => s.ogrenci!);
                return (
                  <tr key={k.id} className="hover:bg-violet-50/30">
                    <td className="px-4 py-2 font-medium text-gray-700">{k.daireNo}</td>
                    <td className="px-4 py-2 text-gray-500">{k.katNo}. Kat · {k.tip} · {k.metrekare}m²</td>
                    <td className="px-4 py-2 text-gray-700">
                      {k.kiraBedeli > 0 ? `₺${k.kiraBedeli.toLocaleString("tr-TR")}` : "—"}
                    </td>
                    <td className="px-4 py-2">
                      {aktifKiracilar.length === 0 ? (
                        <span className="text-xs text-gray-300 italic">—</span>
                      ) : (
                        <div className="space-y-0.5">
                          {aktifKiracilar.map(o => (
                            <div key={o.id} className="text-xs">
                              <span className="text-gray-800 font-medium">{o.ad} {o.soyad}</span>
                              {o.telefon && o.telefon !== "-" && <span className="text-gray-400 ml-1.5">· {o.telefon}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <DurumBadge durum={d} />
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {k.daireSahibi ? `${k.daireSahibi.ad} ${k.daireSahibi.soyad}` : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DurumBadge({ durum }: { durum: "Dolu" | "Bos" | "Yari" }) {
  if (durum === "Dolu") return <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium"><CheckCircle2 size={11} /> Dolu</span>;
  if (durum === "Yari") return <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium"><Users size={11} /> %50</span>;
  return <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium"><Circle size={11} /> Boş</span>;
}

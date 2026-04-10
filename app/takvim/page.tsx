"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Home, Phone } from "lucide-react";

interface Etkinlik {
  id: string;
  tip: "tur" | "gorusme";
  tarih: string;
  baslik: string;
  altBaslik: string;
  renk: string;
}

const GUNLER = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function gunSayisi(yil: number, ay: number) {
  return new Date(yil, ay + 1, 0).getDate();
}

function ilkGunHaftaGunu(yil: number, ay: number) {
  const g = new Date(yil, ay, 1).getDay();
  return g === 0 ? 6 : g - 1; // Monday=0
}

export default function TakvimPage() {
  const simdi = new Date();
  const [yil, setYil] = useState(simdi.getFullYear());
  const [ay, setAy] = useState(simdi.getMonth());
  const [etkinlikler, setEtkinlikler] = useState<Etkinlik[]>([]);
  const [seciliGun, setSeciliGun] = useState<number | null>(null);

  useEffect(() => {
    const baslangic = new Date(yil, ay, 1).toISOString();
    const bitis = new Date(yil, ay + 1, 0, 23, 59, 59).toISOString();

    Promise.all([
      fetch("/api/turlar").then(r => r.json()),
      fetch("/api/gorusmeler").then(r => r.json()),
    ]).then(([turlar, gorusmeler]) => {
      const e: Etkinlik[] = [];

      for (const t of turlar) {
        const d = new Date(t.tarih);
        if (d >= new Date(baslangic) && d <= new Date(bitis)) {
          e.push({
            id: t.id, tip: "tur",
            tarih: t.tarih,
            baslik: `${t.musteri.ad} ${t.musteri.soyad}`,
            altBaslik: t.daireNo ? `Daire ${t.daireNo}` : "Tur",
            renk: "bg-emerald-100 text-emerald-700",
          });
        }
      }

      for (const g of gorusmeler) {
        const d = new Date(g.tarih);
        if (d >= new Date(baslangic) && d <= new Date(bitis)) {
          e.push({
            id: g.id, tip: "gorusme",
            tarih: g.tarih,
            baslik: `${g.musteri.ad} ${g.musteri.soyad}`,
            altBaslik: `${g.yon} · ${g.arayanAd}`,
            renk: "bg-orange-100 text-orange-700",
          });
        }
      }

      setEtkinlikler(e);
    });
  }, [yil, ay]);

  const oncekiAy = () => {
    if (ay === 0) { setAy(11); setYil(y => y - 1); }
    else setAy(a => a - 1);
  };
  const sonrakiAy = () => {
    if (ay === 11) { setAy(0); setYil(y => y + 1); }
    else setAy(a => a + 1);
  };

  const toplamGun = gunSayisi(yil, ay);
  const ilkGun = ilkGunHaftaGunu(yil, ay);
  const hucreler = Array.from({ length: Math.ceil((ilkGun + toplamGun) / 7) * 7 });

  const gunEtkinlikleri = (gun: number) =>
    etkinlikler.filter(e => new Date(e.tarih).getDate() === gun && new Date(e.tarih).getMonth() === ay);

  const seciliEtkinlikler = seciliGun ? gunEtkinlikleri(seciliGun) : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-3">
        <button onClick={oncekiAy} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft size={16} /></button>
        <h2 className="font-semibold text-gray-800">{AYLAR[ay]} {yil}</h2>
        <button onClick={sonrakiAy} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronRight size={16} /></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Takvim */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-7 mb-2">
            {GUNLER.map(g => (
              <div key={g} className="text-center text-xs font-medium text-gray-500 py-2">{g}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {hucreler.map((_, i) => {
              const gun = i - ilkGun + 1;
              const gecerli = gun > 0 && gun <= toplamGun;
              const bugun = gecerli && gun === simdi.getDate() && ay === simdi.getMonth() && yil === simdi.getFullYear();
              const etkinlik = gecerli ? gunEtkinlikleri(gun) : [];

              return (
                <div
                  key={i}
                  onClick={() => gecerli && setSeciliGun(gun)}
                  className={`min-h-[72px] p-1 rounded-lg border transition-colors ${
                    !gecerli ? "opacity-0 pointer-events-none" :
                    seciliGun === gun ? "border-violet-400 bg-violet-50" :
                    bugun ? "border-violet-200 bg-violet-50/50" :
                    "border-transparent hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  {gecerli && (
                    <>
                      <p className={`text-xs text-center mb-1 font-medium ${bugun ? "text-violet-600" : "text-gray-700"}`}>
                        {gun}
                      </p>
                      <div className="space-y-0.5">
                        {etkinlik.slice(0, 2).map(e => (
                          <div key={e.id} className={`text-[10px] px-1 py-0.5 rounded truncate ${e.renk}`}>
                            {e.tip === "tur" ? "🏠" : "📞"} {e.baslik}
                          </div>
                        ))}
                        {etkinlik.length > 2 && (
                          <p className="text-[10px] text-gray-400 text-center">+{etkinlik.length - 2}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Seçili Gün Detayı */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {seciliGun ? `${seciliGun} ${AYLAR[ay]}` : "Bir gün seçin"}
          </h3>
          {seciliGun && seciliEtkinlikler.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-8">Bu gün etkinlik yok</p>
          )}
          <div className="space-y-2">
            {seciliEtkinlikler.map(e => (
              <div key={e.id} className={`flex items-start gap-2 p-2.5 rounded-lg ${e.renk}`}>
                <div className="shrink-0 mt-0.5">
                  {e.tip === "tur" ? <Home size={13} /> : <Phone size={13} />}
                </div>
                <div>
                  <p className="text-xs font-medium">{e.baslik}</p>
                  <p className="text-[11px] opacity-75">{e.altBaslik}</p>
                  <p className="text-[11px] opacity-60">{new Date(e.tarih).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

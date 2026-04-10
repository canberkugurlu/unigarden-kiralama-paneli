"use client";

import { useEffect, useState } from "react";
import { Mail, Search, Plus, X, Copy, Check } from "lucide-react";

interface Davet {
  id: string;
  email: string;
  ad: string;
  soyad: string;
  token: string;
  konutId: string | null;
  onerilenKira: number | null;
  durum: string;
  gonderiTar: string;
  sonlanmaTar: string | null;
  kabulTar: string | null;
  musteri: { id: string; ad: string; soyad: string } | null;
}

const DURUM_RENK: Record<string, string> = {
  Bekliyor: "bg-yellow-100 text-yellow-700",
  Kabul: "bg-green-100 text-green-700",
  Reddedildi: "bg-red-100 text-red-700",
  Süresi_Doldu: "bg-gray-100 text-gray-500",
};

function YeniDavetModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ email: "", ad: "", soyad: "", konutId: "", onerilenKira: "" });
  const [yuk, setYuk] = useState(false);

  const kaydet = async () => {
    if (!form.email || !form.ad || !form.soyad) return;
    setYuk(true);
    await fetch("/api/davetler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        ad: form.ad,
        soyad: form.soyad,
        konutId: form.konutId || null,
        onerilenKira: form.onerilenKira ? parseFloat(form.onerilenKira) : null,
      }),
    });
    setYuk(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Davet Gönder</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ad *</label>
              <input value={form.ad} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Soyad *</label>
              <input value={form.soyad} onChange={e => setForm(f => ({ ...f, soyad: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">E-posta *</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Konut ID (opsiyonel)</label>
              <input value={form.konutId} onChange={e => setForm(f => ({ ...f, konutId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Daire ID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Önerilen Kira (₺)</label>
              <input value={form.onerilenKira} onChange={e => setForm(f => ({ ...f, onerilenKira: e.target.value }))}
                type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            Davet bağlantısı oluşturulacak ve e-posta adresiyle paylaşılabilir.
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">İptal</button>
          <button onClick={kaydet} disabled={yuk || !form.email || !form.ad || !form.soyad}
            className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
            {yuk ? "Oluşturuluyor…" : "Davet Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}

function KopyaButonu({ token }: { token: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);
  const kopyala = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/davet/${token}`;
    navigator.clipboard.writeText(link);
    setKopyalandi(true);
    setTimeout(() => setKopyalandi(false), 2000);
  };
  return (
    <button onClick={kopyala} className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 text-xs text-gray-500 hover:bg-gray-50">
      {kopyalandi ? <><Check size={11} className="text-green-500" /> Kopyalandı</> : <><Copy size={11} /> Link</>}
    </button>
  );
}

export default function DavetlerPage() {
  const [davetler, setDavetler] = useState<Davet[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");
  const [durumFiltre, setDurumFiltre] = useState("Tumu");
  const [modal, setModal] = useState(false);

  const yukle = () => {
    fetch("/api/davetler").then(r => r.json()).then(d => { setDavetler(d); setYukleniyor(false); });
  };

  useEffect(() => { yukle(); }, []);

  const filtreli = davetler.filter(d => {
    const metin = `${d.ad} ${d.soyad} ${d.email}`.toLowerCase();
    if (arama && !metin.includes(arama.toLowerCase())) return false;
    if (durumFiltre !== "Tumu" && d.durum !== durumFiltre) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={arama} onChange={e => setArama(e.target.value)} placeholder="Ad, e-posta ara…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
        <select value={durumFiltre} onChange={e => setDurumFiltre(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="Tumu">Tüm Durumlar</option>
          {["Bekliyor", "Kabul", "Reddedildi"].map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
          <Plus size={14} /> Davet Gönder
        </button>
      </div>

      {yukleniyor ? (
        <div className="text-center py-20 text-gray-400 text-sm">Yükleniyor…</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtreli.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Mail size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Davet bulunamadı</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Ad Soyad</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">E-posta</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Önerilen Kira</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Gönderilme</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Durum</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Link</th>
                </tr>
              </thead>
              <tbody>
                {filtreli.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{d.ad} {d.soyad}</td>
                    <td className="px-4 py-3 text-gray-600">{d.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {d.onerilenKira ? `₺${d.onerilenKira.toLocaleString("tr-TR")}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(d.gonderiTar).toLocaleDateString("tr-TR")}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${DURUM_RENK[d.durum] ?? "bg-gray-100 text-gray-600"}`}>{d.durum}</span>
                    </td>
                    <td className="px-4 py-3">
                      <KopyaButonu token={d.token} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && <YeniDavetModal onClose={() => setModal(false)} onSaved={() => { yukle(); }} />}
    </div>
  );
}

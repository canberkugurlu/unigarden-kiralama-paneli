"use client";

import { useEffect, useState } from "react";
import { CheckSquare, Search, Plus, X, Check, AlertTriangle } from "lucide-react";

interface Onay {
  id: string;
  kiraciAd: string;
  kiraciEmail: string | null;
  konutId: string | null;
  konutNo: string | null;
  kiraTutar: number;
  aidat: number;
  komisyon: number;
  durum: string;
  muhasebeNot: string | null;
  idareNot: string | null;
  gonderenId: string | null;
  olusturmaTar: string;
}

const DURUM_LABEL: Record<string, string> = {
  BekleyenOnay: "Bekleyen Onay",
  MuhasebeOnayladi: "Muhasebe Onayladı",
  IdareOnayladi: "İdare Onayladı",
  Onaylandi: "Onaylandı",
  Reddedildi: "Reddedildi",
};

const DURUM_RENK: Record<string, string> = {
  BekleyenOnay: "bg-yellow-100 text-yellow-700",
  MuhasebeOnayladi: "bg-blue-100 text-blue-700",
  IdareOnayladi: "bg-indigo-100 text-indigo-700",
  Onaylandi: "bg-green-100 text-green-700",
  Reddedildi: "bg-red-100 text-red-700",
};

function YeniOnayModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    kiraciAd: "", kiraciEmail: "", konutNo: "", kiraTutar: "", aidat: "0", komisyon: "0",
  });
  const [yuk, setYuk] = useState(false);

  const kaydet = async () => {
    if (!form.kiraciAd || !form.kiraTutar) return;
    setYuk(true);
    await fetch("/api/onaylar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kiraciAd: form.kiraciAd,
        kiraciEmail: form.kiraciEmail || null,
        konutNo: form.konutNo || null,
        kiraTutar: parseFloat(form.kiraTutar),
        aidat: parseFloat(form.aidat) || 0,
        komisyon: parseFloat(form.komisyon) || 0,
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
          <h2 className="text-base font-semibold text-gray-800">Yeni Kiralama Talebi</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kiracı Adı *</label>
              <input value={form.kiraciAd} onChange={e => setForm(f => ({ ...f, kiraciAd: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-posta</label>
              <input value={form.kiraciEmail} onChange={e => setForm(f => ({ ...f, kiraciEmail: e.target.value }))}
                type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Konut No</label>
            <input value={form.konutNo} onChange={e => setForm(f => ({ ...f, konutNo: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Örn: A-101" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kira (₺) *</label>
              <input value={form.kiraTutar} onChange={e => setForm(f => ({ ...f, kiraTutar: e.target.value }))}
                type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Aidat (₺)</label>
              <input value={form.aidat} onChange={e => setForm(f => ({ ...f, aidat: e.target.value }))}
                type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Komisyon (₺)</label>
              <input value={form.komisyon} onChange={e => setForm(f => ({ ...f, komisyon: e.target.value }))}
                type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">İptal</button>
          <button onClick={kaydet} disabled={yuk || !form.kiraciAd || !form.kiraTutar}
            className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
            {yuk ? "Gönderiliyor…" : "Onaya Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OnaylarPage() {
  const [onaylar, setOnaylar] = useState<Onay[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [durumFiltre, setDurumFiltre] = useState("Tumu");
  const [modal, setModal] = useState(false);

  const yukle = () => {
    const params = durumFiltre !== "Tumu" ? `?durum=${durumFiltre}` : "";
    fetch(`/api/onaylar${params}`).then(r => r.json()).then(d => { setOnaylar(d); setYukleniyor(false); });
  };

  useEffect(() => { yukle(); }, [durumFiltre]);

  const durumGuncelle = async (id: string, durum: string) => {
    await fetch(`/api/onaylar/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum }),
    });
    yukle();
  };

  const bekleyenSayisi = onaylar.filter(o => o.durum === "BekleyenOnay").length;

  return (
    <div className="space-y-4">
      {bekleyenSayisi > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="shrink-0" />
          <span><strong>{bekleyenSayisi}</strong> kiralama talebi onay bekliyor.</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {["Tumu", ...Object.keys(DURUM_LABEL)].map(d => (
            <button key={d} onClick={() => setDurumFiltre(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                durumFiltre === d ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {d === "Tumu" ? "Tümü" : DURUM_LABEL[d]}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
            <Plus size={14} /> Yeni Talep
          </button>
        </div>
      </div>

      {yukleniyor ? (
        <div className="text-center py-20 text-gray-400 text-sm">Yükleniyor…</div>
      ) : (
        <div className="space-y-3">
          {onaylar.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
              <CheckSquare size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Onay talebi bulunamadı</p>
            </div>
          ) : (
            onaylar.map(o => (
              <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{o.kiraciAd}</h3>
                      {o.konutNo && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Daire {o.konutNo}</span>}
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${DURUM_RENK[o.durum] ?? "bg-gray-100 text-gray-600"}`}>
                        {DURUM_LABEL[o.durum] ?? o.durum}
                      </span>
                    </div>
                    {o.kiraciEmail && <p className="text-xs text-gray-500 mt-0.5">{o.kiraciEmail}</p>}
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-gray-600">Kira: <strong className="text-gray-800">₺{o.kiraTutar.toLocaleString("tr-TR")}</strong></span>
                      {o.aidat > 0 && <span className="text-gray-600">Aidat: <strong className="text-gray-800">₺{o.aidat.toLocaleString("tr-TR")}</strong></span>}
                      {o.komisyon > 0 && <span className="text-gray-600">Komisyon: <strong className="text-gray-800">₺{o.komisyon.toLocaleString("tr-TR")}</strong></span>}
                    </div>
                    {o.muhasebeNot && <p className="mt-1 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">Muhasebe: {o.muhasebeNot}</p>}
                    {o.idareNot && <p className="mt-1 text-xs text-indigo-600 bg-indigo-50 rounded px-2 py-1">İdare: {o.idareNot}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(o.olusturmaTar).toLocaleDateString("tr-TR")}</p>
                  </div>

                  {o.durum === "BekleyenOnay" && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => durumGuncelle(o.id, "Onaylandi")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
                        <Check size={12} /> Onayla
                      </button>
                      <button onClick={() => durumGuncelle(o.id, "Reddedildi")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">
                        <X size={12} /> Reddet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {modal && <YeniOnayModal onClose={() => setModal(false)} onSaved={yukle} />}
    </div>
  );
}

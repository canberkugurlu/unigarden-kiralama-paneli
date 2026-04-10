"use client";

import { useEffect, useState } from "react";
import { DollarSign, Plus, X, Check } from "lucide-react";

interface Temsilci {
  id: string;
  ad: string;
  soyad: string;
}

interface Hakedis {
  id: string;
  ay: number;
  yil: number;
  sozlesmeNo: string | null;
  kiraciAd: string | null;
  kiraTutar: number;
  komisyon: number;
  bonus: number;
  toplam: number;
  odendi: boolean;
  aciklama: string | null;
  olusturmaTar: string;
  temsilci: { id: string; ad: string; soyad: string };
}

const AYLAR = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function YeniHakedisModal({ temsilciler, onClose, onSaved }: { temsilciler: Temsilci[]; onClose: () => void; onSaved: () => void }) {
  const simdi = new Date();
  const [form, setForm] = useState({
    temsilciId: temsilciler[0]?.id ?? "",
    ay: String(simdi.getMonth() + 1),
    yil: String(simdi.getFullYear()),
    sozlesmeNo: "", kiraciAd: "", kiraTutar: "0", komisyon: "0", bonus: "0", aciklama: "",
  });
  const [yuk, setYuk] = useState(false);

  const kaydet = async () => {
    if (!form.temsilciId) return;
    const kiraTutar = parseFloat(form.kiraTutar) || 0;
    const komisyon = parseFloat(form.komisyon) || 0;
    const bonus = parseFloat(form.bonus) || 0;
    setYuk(true);
    await fetch("/api/hakedis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        temsilciId: form.temsilciId,
        ay: parseInt(form.ay),
        yil: parseInt(form.yil),
        sozlesmeNo: form.sozlesmeNo || null,
        kiraciAd: form.kiraciAd || null,
        kiraTutar,
        komisyon,
        bonus,
        toplam: komisyon + bonus,
        aciklama: form.aciklama || null,
      }),
    });
    setYuk(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Hakediş Kaydı</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Temsilci *</label>
            <select value={form.temsilciId} onChange={e => setForm(f => ({ ...f, temsilciId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              {temsilciler.map(t => <option key={t.id} value={t.id}>{t.ad} {t.soyad}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ay</label>
              <select value={form.ay} onChange={e => setForm(f => ({ ...f, ay: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                {AYLAR.slice(1).map((a, i) => <option key={i + 1} value={String(i + 1)}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Yıl</label>
              <input value={form.yil} onChange={e => setForm(f => ({ ...f, yil: e.target.value }))}
                type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sözleşme No</label>
              <input value={form.sozlesmeNo} onChange={e => setForm(f => ({ ...f, sozlesmeNo: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kiracı Adı</label>
              <input value={form.kiraciAd} onChange={e => setForm(f => ({ ...f, kiraciAd: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kira Tutarı (₺)</label>
              <input value={form.kiraTutar} onChange={e => setForm(f => ({ ...f, kiraTutar: e.target.value }))}
                type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Komisyon (₺)</label>
              <input value={form.komisyon} onChange={e => setForm(f => ({ ...f, komisyon: e.target.value }))}
                type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bonus (₺)</label>
              <input value={form.bonus} onChange={e => setForm(f => ({ ...f, bonus: e.target.value }))}
                type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-700">
            Toplam Hakediş: <strong>₺{((parseFloat(form.komisyon) || 0) + (parseFloat(form.bonus) || 0)).toLocaleString("tr-TR")}</strong>
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">İptal</button>
          <button onClick={kaydet} disabled={yuk || !form.temsilciId}
            className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
            {yuk ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HakedisPage() {
  const [hakedisler, setHakedisler] = useState<Hakedis[]>([]);
  const [temsilciler, setTemsilciler] = useState<Temsilci[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [temsilciFiltre, setTemsilciFiltre] = useState("Tumu");
  const [modal, setModal] = useState(false);

  const yukle = () => {
    const params = temsilciFiltre !== "Tumu" ? `?temsilciId=${temsilciFiltre}` : "";
    Promise.all([
      fetch(`/api/hakedis${params}`).then(r => r.json()),
      fetch("/api/ekip").then(r => r.json()),
    ]).then(([h, e]) => { setHakedisler(h); setTemsilciler(e); setYukleniyor(false); });
  };

  useEffect(() => { yukle(); }, [temsilciFiltre]);

  const odemeyiToggle = async (id: string, odendi: boolean) => {
    await fetch(`/api/hakedis/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ odendi: !odendi }),
    });
    yukle();
  };

  const toplam = hakedisler.reduce((s, h) => s + h.toplam, 0);
  const odenmeyen = hakedisler.filter(h => !h.odendi).reduce((s, h) => s + h.toplam, 0);

  const tr = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Toplam Hakediş", value: tr.format(toplam), renk: "text-gray-800" },
          { label: "Ödenen", value: tr.format(toplam - odenmeyen), renk: "text-green-700" },
          { label: "Bekleyen", value: tr.format(odenmeyen), renk: "text-orange-600" },
        ].map(({ label, value, renk }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-xl font-bold ${renk}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={temsilciFiltre} onChange={e => setTemsilciFiltre(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="Tumu">Tüm Temsilciler</option>
          {temsilciler.map(t => <option key={t.id} value={t.id}>{t.ad} {t.soyad}</option>)}
        </select>
        <div className="ml-auto">
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
            <Plus size={14} /> Hakediş Ekle
          </button>
        </div>
      </div>

      {yukleniyor ? (
        <div className="text-center py-20 text-gray-400 text-sm">Yükleniyor…</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {hakedisler.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <DollarSign size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Hakediş kaydı bulunamadı</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Temsilci</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Dönem</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Kiracı / Sözleşme</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Kira</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Komisyon</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Bonus</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Toplam</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Durum</th>
                </tr>
              </thead>
              <tbody>
                {hakedisler.map(h => (
                  <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{h.temsilci.ad} {h.temsilci.soyad}</td>
                    <td className="px-4 py-3 text-gray-600">{AYLAR[h.ay]} {h.yil}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {h.kiraciAd && <p className="text-xs">{h.kiraciAd}</p>}
                      {h.sozlesmeNo && <p className="text-xs text-gray-400">{h.sozlesmeNo}</p>}
                      {!h.kiraciAd && !h.sozlesmeNo && "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{tr.format(h.kiraTutar)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{tr.format(h.komisyon)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{tr.format(h.bonus)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{tr.format(h.toplam)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => odemeyiToggle(h.id, h.odendi)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          h.odendi ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}>
                        {h.odendi ? <><Check size={10} /> Ödendi</> : "Bekliyor"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && <YeniHakedisModal temsilciler={temsilciler} onClose={() => setModal(false)} onSaved={yukle} />}
    </div>
  );
}

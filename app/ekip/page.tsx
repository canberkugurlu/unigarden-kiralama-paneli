"use client";

import { useEffect, useState } from "react";
import { UserCog, Plus, X, Pencil, Check, Mail, Phone } from "lucide-react";

interface Temsilci {
  id: string;
  ad: string;
  soyad: string;
  telefon: string;
  email: string;
  rol: string;
  aktif: boolean;
  hedef: number;
  komisyonOran: number;
  notlar: string | null;
  olusturmaTar: string;
  _count: { hakedisler: number };
}

const BOŞ_FORM = { ad: "", soyad: "", telefon: "", email: "", rol: "Temsilci", hedef: "0", komisyonOran: "0", notlar: "" };

function TemsilciModal({
  mevcut, onClose, onSaved,
}: { mevcut?: Temsilci; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(
    mevcut
      ? { ad: mevcut.ad, soyad: mevcut.soyad, telefon: mevcut.telefon, email: mevcut.email,
          rol: mevcut.rol, hedef: String(mevcut.hedef), komisyonOran: String(mevcut.komisyonOran), notlar: mevcut.notlar ?? "" }
      : BOŞ_FORM
  );
  const [yuk, setYuk] = useState(false);

  const kaydet = async () => {
    if (!form.ad || !form.soyad || !form.email) return;
    setYuk(true);
    const data = { ...form, hedef: parseInt(form.hedef) || 0, komisyonOran: parseFloat(form.komisyonOran) || 0, notlar: form.notlar || null };
    if (mevcut) {
      await fetch(`/api/ekip/${mevcut.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } else {
      await fetch("/api/ekip", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    }
    setYuk(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">{mevcut ? "Temsilci Düzenle" : "Yeni Temsilci"}</h2>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-posta *</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
              <input value={form.telefon} onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
              <select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                {["Temsilci", "Kıdemli Temsilci", "Müdür"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Aylık Hedef (adet)</label>
              <input value={form.hedef} onChange={e => setForm(f => ({ ...f, hedef: e.target.value }))}
                type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Komisyon Oranı (%)</label>
              <input value={form.komisyonOran} onChange={e => setForm(f => ({ ...f, komisyonOran: e.target.value }))}
                type="number" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notlar</label>
            <textarea value={form.notlar} onChange={e => setForm(f => ({ ...f, notlar: e.target.value }))}
              rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">İptal</button>
          <button onClick={kaydet} disabled={yuk || !form.ad || !form.soyad || !form.email}
            className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
            {yuk ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EkipPage() {
  const [ekip, setEkip] = useState<Temsilci[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modal, setModal] = useState<boolean | Temsilci>(false);

  const yukle = () => {
    fetch("/api/ekip").then(r => r.json()).then(d => { setEkip(d); setYukleniyor(false); });
  };

  useEffect(() => { yukle(); }, []);

  const durumToggle = async (t: Temsilci) => {
    await fetch(`/api/ekip/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktif: !t.aktif }),
    });
    yukle();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
          <Plus size={14} /> Yeni Temsilci
        </button>
      </div>

      {yukleniyor ? (
        <div className="text-center py-20 text-gray-400 text-sm">Yükleniyor…</div>
      ) : ekip.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
          <UserCog size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Henüz temsilci eklenmemiş</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ekip.map(t => (
            <div key={t.id} className={`bg-white rounded-xl border ${t.aktif ? "border-gray-200" : "border-gray-100 opacity-60"} p-5`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center font-bold text-violet-700 text-sm">
                    {t.ad[0]}{t.soyad[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{t.ad} {t.soyad}</p>
                    <span className="text-xs text-gray-500">{t.rol}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(t)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil size={13} /></button>
                  <button onClick={() => durumToggle(t)}
                    className={`p-1.5 rounded ${t.aktif ? "hover:bg-red-50 text-gray-400 hover:text-red-500" : "hover:bg-green-50 text-gray-400 hover:text-green-500"}`}>
                    {t.aktif ? <X size={13} /> : <Check size={13} />}
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-500"><Mail size={11} />{t.email}</div>
                {t.telefon && <div className="flex items-center gap-1.5 text-xs text-gray-500"><Phone size={11} />{t.telefon}</div>}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-base font-bold text-gray-800">{t.hedef}</p>
                  <p className="text-xs text-gray-500">Hedef</p>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-800">{t.komisyonOran}%</p>
                  <p className="text-xs text-gray-500">Komisyon</p>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-800">{t._count.hakedisler}</p>
                  <p className="text-xs text-gray-500">Hakediş</p>
                </div>
              </div>

              {!t.aktif && (
                <div className="mt-2 text-center text-xs text-gray-400 bg-gray-50 rounded-lg py-1">Pasif</div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal !== false && (
        <TemsilciModal
          mevcut={typeof modal === "object" ? modal : undefined}
          onClose={() => setModal(false)}
          onSaved={yukle}
        />
      )}
    </div>
  );
}

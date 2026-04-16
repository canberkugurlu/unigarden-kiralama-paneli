"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Users, Phone, Home, Mail, ChevronRight,
  Trash2, X, Building2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OgrenciSozlesme {
  id: string;
  durum: string;
  konut: { daireNo: string; blok: string; etap: number };
}

interface Lead {
  id: string;
  ad: string;
  soyad: string;
  telefon: string;
  email: string | null;
  kaynak: string;
  durum: string;
  ilgiTip: string | null;
  butce: number | null;
  notlar: string | null;
  atananAd: string | null;
  olusturmaTar: string;
  guncellemeTar: string;
  ogrenciId: string | null;
  ogrenci: { id: string; rol: string; sozlesmeler: OgrenciSozlesme[] } | null;
  _count: { turlar: number; gorusmeler: number; davetler: number };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DURUMLAR = [
  "Yeni", "Iletisimde", "TurPlanlandı", "TurYapildi",
  "TeklifVerildi", "SozlesmeAsamasi", "PasifKiraci", "AktifKiraci", "Reddedildi", "Ilgisiz",
];

const DURUM_LABEL: Record<string, string> = {
  Yeni: "Yeni",
  Iletisimde: "İletişimde",
  TurPlanlandı: "Tur Planlandı",
  TurYapildi: "Tur Yapıldı",
  TeklifVerildi: "Teklif Verildi",
  SozlesmeAsamasi: "Sözleşme Aşaması",
  PasifKiraci: "Pasif Kiracı",
  AktifKiraci: "Aktif Kiracı",
  Reddedildi: "Reddedildi",
  Ilgisiz: "İlgisiz",
};

const DURUM_RENK: Record<string, string> = {
  Yeni: "bg-blue-100 text-blue-700",
  Iletisimde: "bg-yellow-100 text-yellow-700",
  TurPlanlandı: "bg-indigo-100 text-indigo-700",
  TurYapildi: "bg-purple-100 text-purple-700",
  TeklifVerildi: "bg-orange-100 text-orange-700",
  SozlesmeAsamasi: "bg-emerald-100 text-emerald-700",
  PasifKiraci: "bg-amber-100 text-amber-700",
  AktifKiraci: "bg-green-100 text-green-700",
  Reddedildi: "bg-red-100 text-red-700",
  Ilgisiz: "bg-gray-100 text-gray-600",
};

const KAYNAKLAR = ["Manuel", "Website", "Referans", "Instagram", "Telefon", "Fuar", "KiraciPortal", "Diğer"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function effectiveDurum(lead: Lead): string {
  if (!lead.ogrenci) return lead.durum;
  const { rol, sozlesmeler } = lead.ogrenci;
  if (rol === "Aktif") return "AktifKiraci";
  if (sozlesmeler.length > 0) {
    const s = sozlesmeler[0];
    if (s.durum === "OnaylandiAktifBekliyor") return "PasifKiraci";
    if (s.durum === "ImzalandiOnayBekliyor" || s.durum === "BekleniyorImza") return "SozlesmeAsamasi";
  }
  if (rol === "Pasif") return "PasifKiraci";
  return lead.durum;
}

function atananDaire(lead: Lead): string | null {
  if (!lead.ogrenci || lead.ogrenci.sozlesmeler.length === 0) return null;
  const s = lead.ogrenci.sozlesmeler[0];
  return `${s.konut.daireNo}`;
}

// ─── YeniLeadModal ────────────────────────────────────────────────────────────

function YeniLeadModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    ad: "", soyad: "", telefon: "", email: "", kaynak: "Manuel",
    ilgiTip: "", butce: "", notlar: "", atananAd: "",
  });
  const [yukleniyor, setYukleniyor] = useState(false);

  const kaydet = async () => {
    if (!form.ad || !form.soyad || !form.telefon) return;
    setYukleniyor(true);
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        butce: form.butce ? parseFloat(form.butce) : null,
        email: form.email || null,
        ilgiTip: form.ilgiTip || null,
        atananAd: form.atananAd || null,
      }),
    });
    setYukleniyor(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Yeni Potansiyel Müşteri</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ad *</label>
              <input value={form.ad} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Ad" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Soyad *</label>
              <input value={form.soyad} onChange={e => setForm(f => ({ ...f, soyad: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Soyad" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Telefon *</label>
              <input value={form.telefon} onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="05xx xxx xx xx" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-posta</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="ornek@mail.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kaynak</label>
              <select value={form.kaynak} onChange={e => setForm(f => ({ ...f, kaynak: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                {KAYNAKLAR.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bütçe (₺)</label>
              <input value={form.butce} onChange={e => setForm(f => ({ ...f, butce: e.target.value }))}
                type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">İlgi Tipi</label>
              <input value={form.ilgiTip} onChange={e => setForm(f => ({ ...f, ilgiTip: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Örn: 1+1, Stüdyo" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Atanan Temsilci</label>
              <input value={form.atananAd} onChange={e => setForm(f => ({ ...f, atananAd: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Temsilci adı" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notlar</label>
            <textarea value={form.notlar} onChange={e => setForm(f => ({ ...f, notlar: e.target.value }))}
              rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">İptal</button>
          <button onClick={kaydet} disabled={yukleniyor || !form.ad || !form.soyad || !form.telefon}
            className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
            {yukleniyor ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const router = useRouter();
  const [leadler, setLeadler] = useState<Lead[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");
  const [durumFiltre, setDurumFiltre] = useState("Tumu");
  const [modal, setModal] = useState(false);
  const [silOnay, setSilOnay] = useState<string | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    const params = new URLSearchParams();
    if (durumFiltre !== "Tumu") params.set("durum", durumFiltre);
    if (arama) params.set("q", arama);
    const r = await fetch(`/api/leads?${params}`);
    const d = await r.json();
    setLeadler(d);
    setYukleniyor(false);
  }, [arama, durumFiltre]);

  useEffect(() => { yukle(); }, [yukle]);

  const sil = async (id: string) => {
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    setSilOnay(null);
    yukle();
  };

  return (
    <div className="space-y-4">
      {/* Üst Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={arama}
            onChange={e => setArama(e.target.value)}
            placeholder="Ad, soyad, telefon ara…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <select
          value={durumFiltre}
          onChange={e => setDurumFiltre(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="Tumu">Tüm Durumlar</option>
          {DURUMLAR.map(d => <option key={d} value={d}>{DURUM_LABEL[d]}</option>)}
        </select>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
        >
          <Plus size={14} /> Yeni Müşteri
        </button>
      </div>

      {yukleniyor ? (
        <div className="text-center py-20 text-gray-400 text-sm">Yükleniyor…</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {leadler.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Potansiyel müşteri bulunamadı</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Ad Soyad</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Telefon</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Durum</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Kaynak</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">İlgi Tipi</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Bütçe</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Atanan</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Daire</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Aktivite</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {leadler.map((l) => {
                  const durum = effectiveDurum(l);
                  const daire = atananDaire(l);
                  return (
                    <tr key={l.id} onClick={() => router.push(`/leads/${l.id}`)}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        <span>{l.ad} {l.soyad}</span>
                        {l.kaynak === "KiraciPortal" && (
                          <span className="ml-1.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Portal</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{l.telefon}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${DURUM_RENK[durum] ?? "bg-gray-100 text-gray-600"}`}>
                          {DURUM_LABEL[durum] ?? durum}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {l.kaynak === "KiraciPortal" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Portal</span>
                        ) : l.kaynak}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{l.ilgiTip ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {l.butce ? `₺${l.butce.toLocaleString("tr-TR")}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{l.atananAd ?? "—"}</td>
                      <td className="px-4 py-3">
                        {daire ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-violet-50 text-violet-700 px-2 py-0.5 rounded">
                            <Building2 size={10} />{daire}
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Home size={10} />{l._count.turlar}</span>
                          <span className="flex items-center gap-1"><Phone size={10} />{l._count.gorusmeler}</span>
                          <span className="flex items-center gap-1"><Mail size={10} />{l._count.davetler}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => router.push(`/leads/${l.id}`)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                            <ChevronRight size={14} />
                          </button>
                          <button onClick={() => setSilOnay(l.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && <YeniLeadModal onClose={() => setModal(false)} onSaved={yukle} />}

      {silOnay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <p className="text-sm font-medium text-gray-800 mb-1">Müşteriyi sil?</p>
            <p className="text-xs text-gray-500 mb-5">Tüm tur ve görüşme kayıtları da silinir. Bu işlem geri alınamaz.</p>
            <div className="flex gap-2">
              <button onClick={() => setSilOnay(null)} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">İptal</button>
              <button onClick={() => sil(silOnay)} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 flex items-center justify-center gap-1">
                <Trash2 size={13} /> Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

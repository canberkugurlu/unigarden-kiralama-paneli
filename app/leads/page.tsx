"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Users, Phone, Home, Mail, ChevronRight,
  LayoutGrid, List, Pencil, Trash2, X, Check
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  _count: { turlar: number; gorusmeler: number; davetler: number };
  turlar: { tarih: string; sonuc: string }[];
  gorusmeler: { tarih: string }[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DURUMLAR = [
  "Yeni", "Iletisimde", "TurPlanlandı", "TurYapildi",
  "TeklifVerildi", "SozlesmeAsamasi", "AktifKiraci", "Reddedildi", "Ilgisiz",
];

const DURUM_LABEL: Record<string, string> = {
  Yeni: "Yeni",
  Iletisimde: "İletişimde",
  TurPlanlandı: "Tur Planlandı",
  TurYapildi: "Tur Yapıldı",
  TeklifVerildi: "Teklif Verildi",
  SozlesmeAsamasi: "Sözleşme Aşaması",
  AktifKiraci: "Aktif Kiracı",
  Reddedildi: "Reddedildi",
  Ilgisiz: "İlgisiz",
};

const DURUM_RENK: Record<string, string> = {
  Yeni: "bg-blue-100 text-blue-700 border-blue-200",
  Iletisimde: "bg-yellow-100 text-yellow-700 border-yellow-200",
  TurPlanlandı: "bg-indigo-100 text-indigo-700 border-indigo-200",
  TurYapildi: "bg-purple-100 text-purple-700 border-purple-200",
  TeklifVerildi: "bg-orange-100 text-orange-700 border-orange-200",
  SozlesmeAsamasi: "bg-emerald-100 text-emerald-700 border-emerald-200",
  AktifKiraci: "bg-green-100 text-green-700 border-green-200",
  Reddedildi: "bg-red-100 text-red-700 border-red-200",
  Ilgisiz: "bg-gray-100 text-gray-600 border-gray-200",
};

const KAYNAKLAR = ["Manuel", "Website", "Referans", "Instagram", "Telefon", "Fuar", "Diğer"];

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

// ─── LeadKart (kanban card) ───────────────────────────────────────────────────

function LeadKart({ lead, onKlikk, onSil }: { lead: Lead; onKlikk: () => void; onSil: () => void }) {
  return (
    <div
      onClick={onKlikk}
      className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{lead.ad} {lead.soyad}</p>
          <p className="text-xs text-gray-500 mt-0.5">{lead.telefon}</p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onSil(); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {lead.ilgiTip && (
        <span className="mt-2 inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{lead.ilgiTip}</span>
      )}

      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
        {lead._count.turlar > 0 && (
          <span className="flex items-center gap-1"><Home size={10} />{lead._count.turlar} tur</span>
        )}
        {lead._count.gorusmeler > 0 && (
          <span className="flex items-center gap-1"><Phone size={10} />{lead._count.gorusmeler} görüşme</span>
        )}
      </div>

      {lead.butce && (
        <p className="mt-2 text-xs font-medium text-emerald-600">
          ₺{lead.butce.toLocaleString("tr-TR")}
        </p>
      )}

      {lead.atananAd && (
        <p className="mt-1 text-xs text-gray-400 truncate">→ {lead.atananAd}</p>
      )}
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
  const [gorunum, setGorunum] = useState<"kanban" | "liste">("kanban");
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

  // Kanban columns
  const kolonlar = gorunum === "kanban"
    ? DURUMLAR.map(d => ({ durum: d, leadler: leadler.filter(l => l.durum === d) }))
    : [];

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
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setGorunum("kanban")}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 ${gorunum === "kanban" ? "bg-violet-50 text-violet-700" : "text-gray-500 hover:bg-gray-50"}`}>
            <LayoutGrid size={14} /> Kanban
          </button>
          <button onClick={() => setGorunum("liste")}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 border-l border-gray-200 ${gorunum === "liste" ? "bg-violet-50 text-violet-700" : "text-gray-500 hover:bg-gray-50"}`}>
            <List size={14} /> Liste
          </button>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
        >
          <Plus size={14} /> Yeni Müşteri
        </button>
      </div>

      {yukleniyor ? (
        <div className="text-center py-20 text-gray-400 text-sm">Yükleniyor…</div>
      ) : gorunum === "kanban" ? (
        /* Kanban */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kolonlar.map(({ durum, leadler: kLeadler }) => (
            <div key={durum} className="flex-shrink-0 w-64">
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg mb-2 border ${DURUM_RENK[durum]}`}>
                <span className="text-xs font-semibold">{DURUM_LABEL[durum]}</span>
                <span className="text-xs font-bold">{kLeadler.length}</span>
              </div>
              <div className="space-y-2">
                {kLeadler.map(l => (
                  <LeadKart
                    key={l.id}
                    lead={l}
                    onKlikk={() => router.push(`/leads/${l.id}`)}
                    onSil={() => setSilOnay(l.id)}
                  />
                ))}
                {kLeadler.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">
                    Boş
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Liste */
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Aktivite</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {leadler.map((l) => (
                  <tr key={l.id} onClick={() => router.push(`/leads/${l.id}`)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 font-medium text-gray-800">{l.ad} {l.soyad}</td>
                    <td className="px-4 py-3 text-gray-600">{l.telefon}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${DURUM_RENK[l.durum] ?? "bg-gray-100 text-gray-600"}`}>
                        {DURUM_LABEL[l.durum] ?? l.durum}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{l.kaynak}</td>
                    <td className="px-4 py-3 text-gray-500">{l.ilgiTip ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {l.butce ? `₺${l.butce.toLocaleString("tr-TR")}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{l.atananAd ?? "—"}</td>
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modals */}
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

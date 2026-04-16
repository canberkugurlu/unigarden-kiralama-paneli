"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Phone, Home, Mail, Pencil, Plus, X, Check,
  User, Calendar, DollarSign, Tag, MessageSquare, Clock, FileText
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Tur {
  id: string;
  daireNo: string | null;
  konutId: string | null;
  tarih: string;
  sonuc: string;
  notlar: string | null;
  yapanAd: string;
  olusturmaTar: string;
}

interface Gorusme {
  id: string;
  tarih: string;
  sure: number;
  yon: string;
  ozet: string | null;
  sonuc: string;
  arayanAd: string;
  olusturmaTar: string;
}

interface Davet {
  id: string;
  email: string;
  konutId: string | null;
  onerilenKira: number | null;
  durum: string;
  gonderiTar: string;
  kabulTar: string | null;
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
  turlar: Tur[];
  gorusmeler: Gorusme[];
  davetler: Davet[];
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
  Yeni: "bg-blue-100 text-blue-700",
  Iletisimde: "bg-yellow-100 text-yellow-700",
  TurPlanlandı: "bg-indigo-100 text-indigo-700",
  TurYapildi: "bg-purple-100 text-purple-700",
  TeklifVerildi: "bg-orange-100 text-orange-700",
  SozlesmeAsamasi: "bg-emerald-100 text-emerald-700",
  AktifKiraci: "bg-green-100 text-green-700",
  Reddedildi: "bg-red-100 text-red-700",
  Ilgisiz: "bg-gray-100 text-gray-600",
};

// ─── YeniTurModal ─────────────────────────────────────────────────────────────

function YeniTurModal({ musteriId, onClose, onSaved }: { musteriId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ daireNo: "", tarih: "", sonuc: "Belirsiz", notlar: "", yapanAd: "" });
  const [yuk, setYuk] = useState(false);

  const kaydet = async () => {
    if (!form.tarih || !form.yapanAd) return;
    setYuk(true);
    await fetch("/api/turlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, musteriId, tarih: new Date(form.tarih).toISOString() }),
    });
    setYuk(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Daire Gezdirme Ekle</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Daire No</label>
              <input value={form.daireNo} onChange={e => setForm(f => ({ ...f, daireNo: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="A-101" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tarih *</label>
              <input value={form.tarih} onChange={e => setForm(f => ({ ...f, tarih: e.target.value }))}
                type="datetime-local" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sonuç</label>
              <select value={form.sonuc} onChange={e => setForm(f => ({ ...f, sonuc: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                {["Belirsiz", "Olumlu", "Olumsuz", "TeklifBekleniyor"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Yapan *</label>
              <input value={form.yapanAd} onChange={e => setForm(f => ({ ...f, yapanAd: e.target.value }))}
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
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">İptal</button>
          <button onClick={kaydet} disabled={yuk || !form.tarih || !form.yapanAd}
            className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
            {yuk ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── YeniGorusmeModal ─────────────────────────────────────────────────────────

function YeniGorusmeModal({ musteriId, onClose, onSaved }: { musteriId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ tarih: "", sure: "0", yon: "Giden", ozet: "", sonuc: "Belirsiz", arayanAd: "" });
  const [yuk, setYuk] = useState(false);

  const kaydet = async () => {
    if (!form.tarih || !form.arayanAd) return;
    setYuk(true);
    await fetch("/api/gorusmeler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        musteriId,
        sure: parseInt(form.sure) || 0,
        tarih: new Date(form.tarih).toISOString(),
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
          <h2 className="text-base font-semibold text-gray-800">Telefon Görüşmesi Ekle</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tarih *</label>
              <input value={form.tarih} onChange={e => setForm(f => ({ ...f, tarih: e.target.value }))}
                type="datetime-local" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Süre (dk)</label>
              <input value={form.sure} onChange={e => setForm(f => ({ ...f, sure: e.target.value }))}
                type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Yön</label>
              <select value={form.yon} onChange={e => setForm(f => ({ ...f, yon: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="Giden">Giden</option>
                <option value="Gelen">Gelen</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sonuç</label>
              <select value={form.sonuc} onChange={e => setForm(f => ({ ...f, sonuc: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                {["Belirsiz", "UlastiCevapVerdi", "UlastiCevapVermedi", "UlasilamadiBiraktiMesaj", "Reddedildi"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Arayan *</label>
            <input value={form.arayanAd} onChange={e => setForm(f => ({ ...f, arayanAd: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Temsilci adı" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Özet / Notlar</label>
            <textarea value={form.ozet} onChange={e => setForm(f => ({ ...f, ozet: e.target.value }))}
              rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">İptal</button>
          <button onClick={kaydet} disabled={yuk || !form.tarih || !form.arayanAd}
            className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
            {yuk ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SozlesmeAtaModal ─────────────────────────────────────────────────────────

interface Konut { id: string; daireNo: string; blok: string; tip: string; kiraBedeli: number; durum: string; }

function SozlesmeAtaModal({ musteriId, onClose, onSaved }: { musteriId: string; onClose: () => void; onSaved: () => void }) {
  const [konutlar, setKonutlar] = useState<Konut[]>([]);
  const [form, setForm] = useState({
    konutId: "", baslangicTarihi: "", bitisTarihi: "", aylikKira: "",
    depozito: "", kiraOdemGunu: "1", ozelSartlar: "", oda: "",
  });
  const [yuk, setYuk] = useState(false);
  const [hata, setHata] = useState("");

  useEffect(() => {
    fetch("/api/konutlar")
      .then(r => r.json())
      .then((d: Konut[]) => setKonutlar(d.filter(k => k.durum === "Bos" || k.durum === "Müsait")));
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const konutSecildi = (id: string) => {
    const k = konutlar.find(k => k.id === id);
    setForm(f => ({ ...f, konutId: id, aylikKira: k ? String(k.kiraBedeli) : f.aylikKira }));
  };

  const kaydet = async () => {
    if (!form.konutId || !form.baslangicTarihi || !form.bitisTarihi || !form.aylikKira || !form.depozito) {
      setHata("Zorunlu alanları doldurunuz."); return;
    }
    setYuk(true); setHata("");
    const res = await fetch(`/api/leads/${musteriId}/sozlesme-ata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json();
    if (!res.ok) { setHata(j.error ?? "Hata oluştu."); setYuk(false); return; }
    setYuk(false);
    onSaved();
    onClose();
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={16} className="text-violet-600" /> Sözleşme Ata
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Daire *</label>
            <select value={form.konutId} onChange={e => konutSecildi(e.target.value)} className={inp}>
              <option value="">Daire seçin...</option>
              {konutlar.map(k => (
                <option key={k.id} value={k.id}>
                  {k.daireNo} — {k.blok} Blok, {k.tip} — ₺{k.kiraBedeli.toLocaleString("tr-TR")}
                </option>
              ))}
            </select>
            {konutlar.length === 0 && <p className="text-xs text-amber-600 mt-1">Boş daire bulunamadı.</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Başlangıç *</label>
              <input type="date" value={form.baslangicTarihi} onChange={set("baslangicTarihi")} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bitiş *</label>
              <input type="date" value={form.bitisTarihi} onChange={set("bitisTarihi")} className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Aylık Kira (₺) *</label>
              <input type="number" value={form.aylikKira} onChange={set("aylikKira")} className={inp} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Depozito (₺) *</label>
              <input type="number" value={form.depozito} onChange={set("depozito")} className={inp} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ödeme Günü</label>
              <input type="number" min="1" max="28" value={form.kiraOdemGunu} onChange={set("kiraOdemGunu")} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Oda</label>
              <input value={form.oda} onChange={set("oda")} className={inp} placeholder="1+1, 2+1..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Özel Şartlar</label>
            <textarea value={form.ozelSartlar} onChange={set("ozelSartlar")} rows={2} className={inp + " resize-none"} />
          </div>
          {hata && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{hata}</p>}
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">İptal</button>
          <button onClick={kaydet} disabled={yuk}
            className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
            {yuk ? "Kaydediliyor…" : "Sözleşme Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeadDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifTab, setAktifTab] = useState<"genel" | "turlar" | "gorusmeler" | "davetler">("genel");
  const [turModal, setTurModal] = useState(false);
  const [gorusmeModal, setGorusmeModal] = useState(false);
  const [sozlesmeModal, setSozlesmeModal] = useState(false);
  const [durumDuzenle, setDurumDuzenle] = useState(false);
  const [yeniDurum, setYeniDurum] = useState("");

  const yukle = async () => {
    setYukleniyor(true);
    const r = await fetch(`/api/leads/${id}`);
    if (r.ok) {
      const d = await r.json();
      setLead(d);
      setYeniDurum(d.durum);
    }
    setYukleniyor(false);
  };

  useEffect(() => { yukle(); }, [id]);

  const durumGuncelle = async () => {
    await fetch(`/api/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum: yeniDurum }),
    });
    setDurumDuzenle(false);
    yukle();
  };

  if (yukleniyor) return <div className="text-center py-20 text-gray-400 text-sm">Yükleniyor…</div>;
  if (!lead) return <div className="text-center py-20 text-red-500 text-sm">Müşteri bulunamadı</div>;

  const TABS = [
    { id: "genel", label: "Genel Bilgiler" },
    { id: "turlar", label: `Turlar (${lead.turlar.length})` },
    { id: "gorusmeler", label: `Görüşmeler (${lead.gorusmeler.length})` },
    { id: "davetler", label: `Davetler (${lead.davetler.length})` },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Back + Hero */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={15} /> Geri
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-violet-600">
              {lead.ad[0]}{lead.soyad[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{lead.ad} {lead.soyad}</h1>
              {durumDuzenle ? (
                <div className="flex items-center gap-2">
                  <select value={yeniDurum} onChange={e => setYeniDurum(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                    {DURUMLAR.map(d => <option key={d} value={d}>{DURUM_LABEL[d]}</option>)}
                  </select>
                  <button onClick={durumGuncelle} className="p-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700"><Check size={13} /></button>
                  <button onClick={() => setDurumDuzenle(false)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"><X size={13} /></button>
                </div>
              ) : (
                <button onClick={() => setDurumDuzenle(true)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${DURUM_RENK[lead.durum] ?? "bg-gray-100 text-gray-600"} hover:opacity-80`}>
                  {DURUM_LABEL[lead.durum] ?? lead.durum}
                  <Pencil size={9} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-sm text-gray-600"><Phone size={13} />{lead.telefon}</span>
              {lead.email && <span className="flex items-center gap-1.5 text-sm text-gray-600"><Mail size={13} />{lead.email}</span>}
              {lead.ilgiTip && <span className="flex items-center gap-1.5 text-sm text-gray-600"><Tag size={13} />{lead.ilgiTip}</span>}
              {lead.butce && <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"><DollarSign size={13} />₺{lead.butce.toLocaleString("tr-TR")}</span>}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 shrink-0 flex-wrap">
            <button onClick={() => setSozlesmeModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
              <FileText size={13} /> Sözleşme Ata
            </button>
            <button onClick={() => setTurModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700">
              <Home size={13} /> Tur Ekle
            </button>
            <button onClick={() => setGorusmeModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50">
              <Phone size={13} /> Görüşme Ekle
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: "Tur Sayısı", value: lead.turlar.length, icon: Home },
            { label: "Görüşme Sayısı", value: lead.gorusmeler.length, icon: Phone },
            { label: "Davet Sayısı", value: lead.davetler.length, icon: Mail },
            { label: "Kaynak", value: lead.kaynak, icon: User },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-1"><Icon size={14} className="text-gray-400" /></div>
              <p className="text-lg font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setAktifTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              aktifTab === t.id ? "border-violet-600 text-violet-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {aktifTab === "genel" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">İletişim Bilgileri</h3>
            {[
              { label: "Ad Soyad", value: `${lead.ad} ${lead.soyad}` },
              { label: "Telefon", value: lead.telefon },
              { label: "E-posta", value: lead.email ?? "—" },
              { label: "Kaynak", value: lead.kaynak },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Kiralama Tercihleri</h3>
            {[
              { label: "İlgi Tipi", value: lead.ilgiTip ?? "—" },
              { label: "Bütçe", value: lead.butce ? `₺${lead.butce.toLocaleString("tr-TR")}` : "—" },
              { label: "Atanan Temsilci", value: lead.atananAd ?? "—" },
              { label: "Kayıt Tarihi", value: new Date(lead.olusturmaTar).toLocaleDateString("tr-TR") },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>
          {lead.notlar && (
            <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><MessageSquare size={14} />Notlar</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{lead.notlar}</p>
            </div>
          )}
        </div>
      )}

      {aktifTab === "turlar" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setTurModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
              <Plus size={14} /> Tur Ekle
            </button>
          </div>
          {lead.turlar.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Home size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Henüz daire gezdirme kaydı yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lead.turlar.map(t => (
                <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {t.daireNo ? `Daire ${t.daireNo}` : "Daire belirtilmedi"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <Calendar size={10} className="inline mr-1" />
                        {new Date(t.tarih).toLocaleString("tr-TR")} · {t.yapanAd}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      t.sonuc === "Olumlu" ? "bg-green-100 text-green-700" :
                      t.sonuc === "Olumsuz" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{t.sonuc}</span>
                  </div>
                  {t.notlar && <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{t.notlar}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {aktifTab === "gorusmeler" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setGorusmeModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
              <Plus size={14} /> Görüşme Ekle
            </button>
          </div>
          {lead.gorusmeler.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Phone size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Henüz görüşme kaydı yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lead.gorusmeler.map(g => (
                <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{g.arayanAd}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <Calendar size={10} className="inline mr-1" />
                        {new Date(g.tarih).toLocaleString("tr-TR")}
                        {g.sure > 0 && <><Clock size={10} className="inline mx-1" />{g.sure} dk</>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${g.yon === "Gelen" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{g.yon}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${g.sonuc.includes("Ulasti") ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{g.sonuc}</span>
                    </div>
                  </div>
                  {g.ozet && <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{g.ozet}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {aktifTab === "davetler" && (
        <div className="space-y-3">
          {lead.davetler.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Mail size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Henüz davet gönderilmemiş</p>
              <button onClick={() => router.push("/davetler")}
                className="mt-3 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700">
                Davet Gönder →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {lead.davetler.map(d => (
                <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{d.email}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Gönderildi: {new Date(d.gonderiTar).toLocaleDateString("tr-TR")}
                        {d.kabulTar && ` · Kabul: ${new Date(d.kabulTar).toLocaleDateString("tr-TR")}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      d.durum === "Kabul" ? "bg-green-100 text-green-700" :
                      d.durum === "Reddedildi" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{d.durum}</span>
                  </div>
                  {d.onerilenKira && (
                    <p className="mt-1 text-xs text-emerald-600">Önerilen Kira: ₺{d.onerilenKira.toLocaleString("tr-TR")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {turModal && <YeniTurModal musteriId={id} onClose={() => setTurModal(false)} onSaved={yukle} />}
      {gorusmeModal && <YeniGorusmeModal musteriId={id} onClose={() => setGorusmeModal(false)} onSaved={yukle} />}
      {sozlesmeModal && <SozlesmeAtaModal musteriId={id} onClose={() => setSozlesmeModal(false)} onSaved={yukle} />}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Users, Home, Phone, CheckSquare, TrendingUp, Clock, UserCheck, DollarSign } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const simdi = new Date();
  const buAyBaslangic = new Date(simdi.getFullYear(), simdi.getMonth(), 1);

  const [
    toplamLead,
    yeniLead,
    aktifLead,
    buAyTur,
    buAyGorusme,
    bekleyenOnay,
    toplamEkip,
    buAyHakedis,
    leadDurumDagilimi,
    sonTurlar,
    sonGorusmeler,
    sonLeadler,
  ] = await Promise.all([
    prisma.potansiyelMusteri.count(),
    prisma.potansiyelMusteri.count({ where: { durum: "Yeni" } }),
    prisma.potansiyelMusteri.count({
      where: {
        durum: {
          in: ["Iletisimde", "TurPlanlandı", "TurYapildi", "TeklifVerildi", "SozlesmeAsamasi"],
        },
      },
    }),
    prisma.daireTuru.count({ where: { tarih: { gte: buAyBaslangic } } }),
    prisma.telefonGorusmesi.count({ where: { tarih: { gte: buAyBaslangic } } }),
    prisma.kiralamaTalepOnay.count({ where: { durum: "BekleyenOnay" } }),
    prisma.kiralamaTemsilci.count({ where: { aktif: true } }),
    prisma.hakedis.aggregate({
      where: {
        ay: simdi.getMonth() + 1,
        yil: simdi.getFullYear(),
      },
      _sum: { toplam: true },
    }),
    prisma.potansiyelMusteri.groupBy({
      by: ["durum"],
      _count: true,
      orderBy: { _count: { durum: "desc" } },
    }),
    prisma.daireTuru.findMany({
      take: 5,
      orderBy: { tarih: "desc" },
      include: { musteri: { select: { ad: true, soyad: true } } },
    }),
    prisma.telefonGorusmesi.findMany({
      take: 5,
      orderBy: { tarih: "desc" },
      include: { musteri: { select: { ad: true, soyad: true } } },
    }),
    prisma.potansiyelMusteri.findMany({
      take: 5,
      orderBy: { olusturmaTar: "desc" },
      include: {
        ogrenci: { select: { rol: true, sozlesmeler: { where: { durum: { not: "Iptal" } }, select: { durum: true }, orderBy: { olusturmaTar: "desc" }, take: 1 } } },
      },
    }),
  ]);

  return {
    toplamLead,
    yeniLead,
    aktifLead,
    buAyTur,
    buAyGorusme,
    bekleyenOnay,
    toplamEkip,
    buAyHakedis: buAyHakedis._sum.toplam ?? 0,
    leadDurumDagilimi,
    sonTurlar,
    sonGorusmeler,
    sonLeadler,
  };
}

const DURUM_RENK: Record<string, string> = {
  Yeni: "bg-gray-100 text-gray-600",
  Iletisimde: "bg-gray-100 text-gray-600",
  TurPlanlandı: "bg-gray-100 text-gray-600",
  TurYapildi: "bg-gray-100 text-gray-600",
  TeklifVerildi: "bg-gray-100 text-gray-600",
  SozlesmeAsamasi: "bg-blue-100 text-blue-700",
  PasifKiraci: "bg-yellow-100 text-yellow-700",
  AktifKiraci: "bg-green-100 text-green-700",
  Reddedildi: "bg-red-100 text-red-700",
  Ilgisiz: "bg-gray-100 text-gray-500",
};

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

function effectiveDurum(l: { durum: string; ogrenci?: { rol: string; sozlesmeler: { durum: string }[] } | null }): string {
  if (!l.ogrenci) return l.durum;
  const { rol, sozlesmeler } = l.ogrenci;
  if (rol === "Aktif") return "AktifKiraci";
  if (sozlesmeler.length > 0) {
    const s = sozlesmeler[0];
    if (s.durum === "OnaylandiAktifBekliyor") return "PasifKiraci";
    if (s.durum === "ImzalandiOnayBekliyor" || s.durum === "BekleniyorImza") return "SozlesmeAsamasi";
  }
  if (rol === "Pasif") return "PasifKiraci";
  return l.durum;
}

function StatKart({
  title,
  value,
  icon: Icon,
  renk,
  href,
  alt,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  renk: string;
  href?: string;
  alt?: string;
}) {
  const card = (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 ${href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${renk}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {alt && <p className="text-xs text-gray-400 mt-0.5">{alt}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

export default async function Dashboard() {
  const s = await getStats();

  const tr = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatKart title="Toplam Lead" value={s.toplamLead} icon={Users} renk="bg-violet-100 text-violet-600" href="/leads" />
        <StatKart title="Aktif Pipeline" value={s.aktifLead} icon={TrendingUp} renk="bg-blue-100 text-blue-600" href="/leads" alt={`${s.yeniLead} yeni`} />
        <StatKart title="Bu Ay Tur" value={s.buAyTur} icon={Home} renk="bg-emerald-100 text-emerald-600" href="/turlar" />
        <StatKart title="Bu Ay Görüşme" value={s.buAyGorusme} icon={Phone} renk="bg-orange-100 text-orange-600" href="/gorusmeler" />
        <StatKart title="Bekleyen Onay" value={s.bekleyenOnay} icon={CheckSquare} renk={s.bekleyenOnay > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"} href="/onaylar" />
        <StatKart title="Aktif Temsilci" value={s.toplamEkip} icon={UserCheck} renk="bg-teal-100 text-teal-600" href="/ekip" />
        <StatKart title="Bu Ay Hakediş" value={tr.format(s.buAyHakedis)} icon={DollarSign} renk="bg-yellow-100 text-yellow-600" href="/hakedis" />
        <StatKart title="Ortalama Yanıt" value="< 2 saat" icon={Clock} renk="bg-pink-100 text-pink-600" />
      </div>

      {/* Pipeline + Son Aktiviteler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Dağılımı */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Pipeline Durumu</h3>
          <div className="space-y-2">
            {s.leadDurumDagilimi.map((d) => (
              <div key={d.durum} className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${DURUM_RENK[d.durum] ?? "bg-gray-100 text-gray-600"}`}>
                  {DURUM_LABEL[d.durum] ?? d.durum}
                </span>
                <span className="text-sm font-semibold text-gray-800">{d._count}</span>
              </div>
            ))}
            {s.leadDurumDagilimi.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Henüz lead yok</p>
            )}
          </div>
          <Link href="/leads" className="mt-4 block text-center text-xs text-violet-600 hover:underline">
            Tüm Leadler →
          </Link>
        </div>

        {/* Son Turlar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Son Daire Gezdirilmeleri</h3>
          <div className="space-y-3">
            {s.sonTurlar.map((t) => (
              <div key={t.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Home size={14} className="text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {t.musteri.ad} {t.musteri.soyad}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t.daireNo ?? "Daire belirtilmedi"} · {new Date(t.tarih).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${t.sonuc === "Olumlu" ? "bg-green-100 text-green-700" : t.sonuc === "Olumsuz" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                  {t.sonuc}
                </span>
              </div>
            ))}
            {s.sonTurlar.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Tur kaydı yok</p>
            )}
          </div>
          <Link href="/turlar" className="mt-4 block text-center text-xs text-violet-600 hover:underline">
            Tüm Turlar →
          </Link>
        </div>

        {/* Son Görüşmeler */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Son Telefon Görüşmeleri</h3>
          <div className="space-y-3">
            {s.sonGorusmeler.map((g) => (
              <div key={g.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {g.musteri.ad} {g.musteri.soyad}
                  </p>
                  <p className="text-xs text-gray-500">
                    {g.sure > 0 ? `${g.sure} dk` : "—"} · {new Date(g.tarih).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${g.yon === "Gelen" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                  {g.yon}
                </span>
              </div>
            ))}
            {s.sonGorusmeler.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Görüşme kaydı yok</p>
            )}
          </div>
          <Link href="/gorusmeler" className="mt-4 block text-center text-xs text-violet-600 hover:underline">
            Tüm Görüşmeler →
          </Link>
        </div>
      </div>

      {/* Son Eklenen Leadler */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Son Eklenen Potansiyel Müşteriler</h3>
          <Link href="/leads" className="text-xs text-violet-600 hover:underline">Tümünü Gör →</Link>
        </div>
        {s.sonLeadler.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Henüz potansiyel müşteri eklenmemiş</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500">Ad Soyad</th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500">Telefon</th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500">Kaynak</th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500">Durum</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {s.sonLeadler.map((l) => (
                  <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 pr-4">
                      <Link href={`/leads/${l.id}`} className="font-medium text-gray-800 hover:text-violet-600">
                        {l.ad} {l.soyad}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600">{l.telefon}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{l.kaynak}</td>
                    <td className="py-2.5 pr-4">
                      {(() => { const d = effectiveDurum(l); return (
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${DURUM_RENK[d] ?? "bg-gray-100 text-gray-600"}`}>
                          {DURUM_LABEL[d] ?? d}
                        </span>
                      ); })()}
                    </td>
                    <td className="py-2.5 text-gray-500 text-xs">{new Date(l.olusturmaTar).toLocaleDateString("tr-TR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

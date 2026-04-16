import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });

  const { konutId, baslangicTarihi, bitisTarihi, aylikKira, depozito, kiraOdemGunu, ozelSartlar, oda } = body;

  if (!konutId || !baslangicTarihi || !bitisTarihi || !aylikKira || !depozito) {
    return NextResponse.json({ error: "Zorunlu alanları doldurunuz." }, { status: 400 });
  }

  const musteri = await prisma.potansiyelMusteri.findUnique({ where: { id } });
  if (!musteri) return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });

  // Müşterinin ogrenciId'si var mı? (KiraciPortal'dan kayıt olmuş mu?)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const musteriAny = musteri as any;
  let ogrenciId: string | null = musteriAny.ogrenciId ?? null;

  // Ogrenci yok ama email varsa email ile ara
  if (!ogrenciId && musteri.email) {
    const ogrenci = await prisma.ogrenci.findUnique({ where: { email: musteri.email } });
    if (ogrenci) {
      ogrenciId = ogrenci.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma.potansiyelMusteri as any).update({
        where: { id },
        data: { ogrenciId: ogrenci.id },
      });
    }
  }

  if (!ogrenciId) {
    return NextResponse.json({ error: "Bu müşterinin kiracı portalında hesabı yok. Önce kayıt olması gerekiyor." }, { status: 422 });
  }

  // Daha önce aktif sözleşme var mı?
  const mevcutSozlesme = await prisma.sozlesme.findFirst({
    where: { ogrenciId, durum: { in: ["BekleniyorImza", "ImzalandiOnayBekliyor", "OnaylandiAktifBekliyor", "Aktif"] } },
  });
  if (mevcutSozlesme) {
    return NextResponse.json({ error: "Bu kiracının zaten aktif/bekleyen bir sözleşmesi var." }, { status: 409 });
  }

  const sozlesmeNo = `SZ-${Date.now()}`;

  const sozlesme = await prisma.sozlesme.create({
    data: {
      sozlesmeNo,
      konutId,
      ogrenciId,
      baslangicTarihi: new Date(baslangicTarihi),
      bitisTarihi: new Date(bitisTarihi),
      aylikKira: Number(aylikKira),
      depozito: Number(depozito),
      kiraOdemGunu: Number(kiraOdemGunu ?? 1),
      ozelSartlar: ozelSartlar || null,
      oda: oda || null,
      durum: "BekleniyorImza",
      imzaTarihi: new Date(),
    },
  });

  // Kiracı rolünü Pasif yap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma.ogrenci as any).update({
    where: { id: ogrenciId },
    data: { rol: "Pasif" },
  });

  // Potansiyel müşteri durumunu güncelle
  await prisma.potansiyelMusteri.update({
    where: { id },
    data: { durum: "SozlesmeAsamasi" },
  });

  // Konut durumunu güncelle
  await prisma.konut.update({
    where: { id: konutId },
    data: { durum: "Dolu" },
  });

  return NextResponse.json({ ok: true, sozlesmeId: sozlesme.id }, { status: 201 });
}

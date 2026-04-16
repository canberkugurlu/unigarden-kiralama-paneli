import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Onay bekleyen sözleşmeleri listele
export async function GET() {
  const sozlesmeler = await prisma.sozlesme.findMany({
    where: { durum: { in: ["ImzalandiOnayBekliyor", "OnaylandiAktifBekliyor"] } },
    include: {
      konut: true,
      ogrenci: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onaylar: true as any,
    },
    orderBy: { olusturmaTar: "desc" },
  });
  return NextResponse.json(sozlesmeler);
}

// Kiralama Sorumlusu onayı ekle
export async function POST(req: Request) {
  const { sozlesmeId, onaylayanId, onaylayanAd } = await req.json();
  if (!sozlesmeId || !onaylayanAd) return NextResponse.json({ error: "Eksik alan." }, { status: 400 });

  const sozlesme = await prisma.sozlesme.findUnique({ where: { id: sozlesmeId } });
  if (!sozlesme) return NextResponse.json({ error: "Sözleşme bulunamadı." }, { status: 404 });
  if (!["ImzalandiOnayBekliyor"].includes(sozlesme.durum)) {
    return NextResponse.json({ error: "Bu sözleşme onay aşamasında değil." }, { status: 409 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mevcutOnay = await (prisma.sozlesmeOnay as any).findUnique({
    where: { sozlesmeId_onaylayan: { sozlesmeId, onaylayan: "KiralamaSorumlusu" } },
  });
  if (mevcutOnay) return NextResponse.json({ error: "Zaten onaylandı." }, { status: 409 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma.sozlesmeOnay as any).create({
    data: { sozlesmeId, onaylayan: "KiralamaSorumlusu", onaylayanId: onaylayanId ?? "kiralama", onaylayanAd },
  });

  await kontrolVeTamOnay(sozlesmeId);

  return NextResponse.json({ ok: true });
}

async function kontrolVeTamOnay(sozlesmeId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onaylar = await (prisma.sozlesmeOnay as any).findMany({ where: { sozlesmeId } });
  const onaylayanlar = onaylar.map((o: { onaylayan: string }) => o.onaylayan);
  if (
    onaylayanlar.includes("KiralamaSorumlusu") &&
    onaylayanlar.includes("Muhasebeci") &&
    onaylayanlar.includes("Admin")
  ) {
    await prisma.sozlesme.update({
      where: { id: sozlesmeId },
      data: { durum: "OnaylandiAktifBekliyor" },
    });
  }
}

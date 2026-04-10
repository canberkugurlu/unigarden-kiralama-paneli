import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const musteriId = searchParams.get("musteriId");

  const where: Record<string, unknown> = {};
  if (musteriId) where.musteriId = musteriId;

  const turlar = await prisma.daireTuru.findMany({
    where,
    include: { musteri: { select: { id: true, ad: true, soyad: true, telefon: true } } },
    orderBy: { tarih: "desc" },
  });
  return NextResponse.json(turlar);
}

export async function POST(req: Request) {
  const body = await req.json();
  const tur = await prisma.daireTuru.create({
    data: body,
    include: { musteri: { select: { id: true, ad: true, soyad: true } } },
  });
  return NextResponse.json(tur, { status: 201 });
}

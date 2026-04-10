import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const temsilciId = searchParams.get("temsilciId");
  const ay = searchParams.get("ay");
  const yil = searchParams.get("yil");

  const where: Record<string, unknown> = {};
  if (temsilciId) where.temsilciId = temsilciId;
  if (ay) where.ay = parseInt(ay);
  if (yil) where.yil = parseInt(yil);

  const hakedisler = await prisma.hakedis.findMany({
    where,
    include: { temsilci: { select: { id: true, ad: true, soyad: true } } },
    orderBy: [{ yil: "desc" }, { ay: "desc" }],
  });
  return NextResponse.json(hakedisler);
}

export async function POST(req: Request) {
  const body = await req.json();
  const hakedis = await prisma.hakedis.create({
    data: body,
    include: { temsilci: { select: { id: true, ad: true, soyad: true } } },
  });
  return NextResponse.json(hakedis, { status: 201 });
}

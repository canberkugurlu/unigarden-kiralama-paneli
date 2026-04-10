import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const durum = searchParams.get("durum");

  const where: Record<string, unknown> = {};
  if (durum && durum !== "Tumu") where.durum = durum;

  const onaylar = await prisma.kiralamaTalepOnay.findMany({
    where,
    orderBy: { olusturmaTar: "desc" },
  });
  return NextResponse.json(onaylar);
}

export async function POST(req: Request) {
  const body = await req.json();
  const onay = await prisma.kiralamaTalepOnay.create({ data: body });
  return NextResponse.json(onay, { status: 201 });
}

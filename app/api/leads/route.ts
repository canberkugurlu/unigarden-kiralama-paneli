import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const durum = searchParams.get("durum");
  const q = searchParams.get("q") ?? "";

  const where: Record<string, unknown> = {};
  if (durum && durum !== "Tumu") where.durum = durum;
  if (q) {
    where.OR = [
      { ad: { contains: q } },
      { soyad: { contains: q } },
      { telefon: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const leads = await prisma.potansiyelMusteri.findMany({
    where,
    include: {
      turlar: { orderBy: { tarih: "desc" }, take: 1 },
      gorusmeler: { orderBy: { tarih: "desc" }, take: 1 },
      _count: { select: { turlar: true, gorusmeler: true, davetler: true } },
    },
    orderBy: { guncellemeTar: "desc" },
  });

  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  const body = await req.json();
  const lead = await prisma.potansiyelMusteri.create({ data: body });
  return NextResponse.json(lead, { status: 201 });
}

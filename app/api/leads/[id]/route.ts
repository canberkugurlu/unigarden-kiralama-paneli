import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.potansiyelMusteri.findUnique({
    where: { id },
    include: {
      turlar: { orderBy: { tarih: "desc" } },
      gorusmeler: { orderBy: { tarih: "desc" } },
      davetler: { orderBy: { gonderiTar: "desc" } },
    },
  });
  if (!lead) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const lead = await prisma.potansiyelMusteri.update({ where: { id }, data: body });
  return NextResponse.json(lead);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.potansiyelMusteri.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

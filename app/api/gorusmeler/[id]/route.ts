import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const gorusme = await prisma.telefonGorusmesi.update({ where: { id }, data: body });
  return NextResponse.json(gorusme);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.telefonGorusmesi.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

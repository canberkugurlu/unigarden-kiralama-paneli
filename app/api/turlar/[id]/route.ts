import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const tur = await prisma.daireTuru.update({ where: { id }, data: body });
  return NextResponse.json(tur);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.daireTuru.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

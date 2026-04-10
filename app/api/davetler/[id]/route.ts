import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const davet = await prisma.davetLinki.update({ where: { id }, data: body });
  return NextResponse.json(davet);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.davetLinki.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

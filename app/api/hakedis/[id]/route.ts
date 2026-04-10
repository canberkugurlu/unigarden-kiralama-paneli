import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const hakedis = await prisma.hakedis.update({ where: { id }, data: body });
  return NextResponse.json(hakedis);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.hakedis.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

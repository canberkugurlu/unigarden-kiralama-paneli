import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ekip = await prisma.kiralamaTemsilci.findMany({
    include: {
      _count: { select: { hakedisler: true } },
    },
    orderBy: { olusturmaTar: "asc" },
  });
  return NextResponse.json(ekip);
}

export async function POST(req: Request) {
  const body = await req.json();
  const uye = await prisma.kiralamaTemsilci.create({ data: body });
  return NextResponse.json(uye, { status: 201 });
}

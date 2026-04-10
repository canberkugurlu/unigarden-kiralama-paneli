import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function GET() {
  const davetler = await prisma.davetLinki.findMany({
    include: { musteri: { select: { id: true, ad: true, soyad: true } } },
    orderBy: { gonderiTar: "desc" },
  });
  return NextResponse.json(davetler);
}

export async function POST(req: Request) {
  const body = await req.json();
  const token = randomBytes(32).toString("hex");
  const davet = await prisma.davetLinki.create({
    data: { ...body, token },
    include: { musteri: { select: { id: true, ad: true, soyad: true } } },
  });
  return NextResponse.json(davet, { status: 201 });
}

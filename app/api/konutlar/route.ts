import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const konutlar = await prisma.konut.findMany({
    include: {
      daireSahibi: { select: { id: true, ad: true, soyad: true } },
      sozlesmeler: {
        where: { durum: "Aktif" },
        select: { id: true, oda: true, aylikKira: true, baslangicTarihi: true, bitisTarihi: true,
                  ogrenci: { select: { id: true, ad: true, soyad: true, telefon: true } } },
      },
    },
    orderBy: [{ etap: "asc" }, { blok: "asc" }, { daireNo: "asc" }],
  });
  return NextResponse.json(konutlar);
}

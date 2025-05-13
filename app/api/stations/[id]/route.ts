import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT update station
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, id, securityCode } = await request.json();

    const updatedStation = await prisma.station.update({
      where: { id: params.id },
      data: {
        name,
        id,
        securityCode,
      },
    });

    return NextResponse.json(updatedStation);
  } catch  {
    return NextResponse.json(
      { error: "Failed to update station" },
      { status: 500 }
    );
  }
}

// DELETE station
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.station.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch  {
    return NextResponse.json(
      { error: "Failed to delete station" },
      { status: 500 }
    );
  }
}

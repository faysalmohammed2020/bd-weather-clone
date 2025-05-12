import { NextResponse } from "next/server";
import { getSecondCardData } from "@/data/second-card-data";

export async function GET() {
  try {
    // Get the meteorological data
    const data = getSecondCardData();

    // Return the data as JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching second card data:", error);
    return NextResponse.json(
      { error: "Failed to fetch second card data" },
      { status: 500 }
    );
  }
}

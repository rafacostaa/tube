import { NextRequest, NextResponse } from "next/server";
import { downloadStore } from "../../../../lib/downloadStore";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Download ID is required" },
        { status: 400 }
      );
    }

    // Get download status from store
    const downloadData = downloadStore.get(id);

    if (!downloadData) {
      return NextResponse.json(
        { error: "Download not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(downloadData);
  } catch (error: any) {
    console.error("Status check error:", error);
    return NextResponse.json(
      {
        error: "Failed to get download status",
      },
      { status: 500 }
    );
  }
}

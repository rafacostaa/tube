import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url, type, quality } = await request.json();

    return NextResponse.json({
      success: true,
      message: "Simple test endpoint working",
      data: { url, type, quality },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

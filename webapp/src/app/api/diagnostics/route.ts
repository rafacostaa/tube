import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "OK",
    message: "Diagnostics endpoint is working",
    timestamp: new Date().toISOString(),
    server: "Next.js",
    port: process.env.PORT || "3001",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    return NextResponse.json({
      status: "OK",
      message: "POST endpoint is working",
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Failed to parse JSON",
        error: error.message,
      },
      { status: 400 }
    );
  }
}

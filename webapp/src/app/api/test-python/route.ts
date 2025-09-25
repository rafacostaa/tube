import { exec } from "child_process";
import { NextRequest, NextResponse } from "next/server";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // Simple test - just try to run python version
    const result = await execAsync("python --version", { timeout: 5000 });

    return NextResponse.json({
      success: true,
      pythonVersion: result.stdout,
      url: url,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}

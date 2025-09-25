import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  try {
    const cwd = process.cwd();
    const parentDir = path.join(cwd, "..");
    const dictionaryPath = path.join(parentDir, "dictionary.py");

    const exists = fs.existsSync(dictionaryPath);

    return NextResponse.json({
      cwd,
      parentDir,
      dictionaryPath,
      dictionaryExists: exists,
      timestamp: new Date().toISOString(),
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

import { exec } from "child_process";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate YouTube URL
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Get the path to dictionary.py in the parent directory
    const dictionaryPath = path.join(process.cwd(), "..", "dictionary.py");

    // Use dictionary.py to get video info without downloading
    const command = `python "${dictionaryPath}" "${url}" --info-only`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
    });

    if (stderr && !stdout) {
      console.error("Error getting video info:", stderr);
      return NextResponse.json(
        {
          error: "Failed to get video information",
        },
        { status: 500 }
      );
    }

    try {
      // Parse the JSON output from dictionary.py
      const videoInfo = JSON.parse(stdout.trim());
      return NextResponse.json(videoInfo);
    } catch (parseError) {
      console.error("Error parsing video info:", parseError);
      return NextResponse.json(
        {
          error: "Failed to parse video information",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Video info error:", error);

    if (error.code === "ENOENT") {
      return NextResponse.json(
        {
          error:
            "Python not found. Please ensure Python is installed and in PATH.",
        },
        { status: 500 }
      );
    }

    if (error.signal === "SIGTERM") {
      return NextResponse.json(
        {
          error: "Request timeout. The video might be too long or unavailable.",
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

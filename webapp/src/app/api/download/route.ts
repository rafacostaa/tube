import { spawn } from "child_process";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { downloadStore } from "../../../lib/downloadStore";
import { generateId } from "../../../lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { url, type, quality } = await request.json();

    console.log("DEBUG - Received parameters:", { url, type, quality });

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!type || !["audio", "video"].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "audio" or "video"' },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Generate unique download ID
    const downloadId = generateId();

    // Store initial download state
    downloadStore.set(downloadId, {
      id: downloadId,
      url,
      type: type as "audio" | "video",
      quality: quality || "best",
      status: "started",
      progress: 0,
      filename: null,
      title: null,
      error: null,
      createdAt: new Date().toISOString(),
    });

    // Start the download in the background
    setTimeout(() => {
      startDownload(downloadId, url, type, quality || "best").catch((error) => {
        console.error(`Background download error for ${downloadId}:`, error);
        const failedData = downloadStore.get(downloadId);
        if (failedData) {
          failedData.status = "failed";
          failedData.error = error.message;
          downloadStore.set(downloadId, failedData);
        }
      });
    }, 100);

    return NextResponse.json({
      downloadId,
      status: "started",
      message: "Download initiated successfully",
    });
  } catch (error: any) {
    console.error("Download initiation error:", error);
    return NextResponse.json(
      {
        error: "Failed to initiate download",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

async function startDownload(
  downloadId: string,
  url: string,
  type: string,
  quality: string
) {
  try {
    console.log(`Starting download for ${downloadId}: ${url}`);

    // Update status to downloading
    const downloadData = downloadStore.get(downloadId);
    if (downloadData) {
      downloadData.status = "downloading";
      downloadStore.set(downloadId, downloadData);
    }

    // Get the path to dictionary.py in the parent directory
    const dictionaryPath = path.join(process.cwd(), "..", "dictionary.py");

    // Build command arguments
    const args = [dictionaryPath, url, "--download-type", type];

    // Always pass quality parameter to avoid user input prompts
    const qualityParam = quality || "best";
    args.push("--quality", qualityParam);

    console.log(`DEBUG - Final args:`, args);
    console.log(`DEBUG - Quality param: ${qualityParam}`);

    console.log(`Spawning python with args:`, args);
    console.log(`Working directory: ${path.join(process.cwd(), "..")}`);

    // Use spawn for better Windows compatibility and real-time output
    const pythonProcess = spawn("python", args, {
      cwd: path.join(process.cwd(), ".."),
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    let outputBuffer = "";

    pythonProcess.stdout.on("data", (data: Buffer) => {
      const output = data.toString();
      outputBuffer += output;
      console.log(`Python stdout [${downloadId}]: ${output.trim()}`);

      // Try to extract progress information from output
      const progressMatch = output.match(/(\d+\.?\d*)%/);
      if (progressMatch) {
        const progress = parseFloat(progressMatch[1]);
        const currentData = downloadStore.get(downloadId);
        if (currentData) {
          currentData.progress = Math.min(progress, 99);
          downloadStore.set(downloadId, currentData);
        }
      }
    });

    pythonProcess.stderr.on("data", (data: Buffer) => {
      const error = data.toString();
      console.error(`Python stderr [${downloadId}]: ${error.trim()}`);
      outputBuffer += error;
    });

    pythonProcess.on("close", (code: number) => {
      console.log(`Python process closed with code: ${code} for ${downloadId}`);

      const updatedData = downloadStore.get(downloadId);
      if (!updatedData) return;

      if (code === 0) {
        // Extract the title from output
        const titleMatch = outputBuffer.match(/Title: (.+)/);
        const videoTitle = titleMatch ? titleMatch[1].trim() : null;

        // Success - parse filename from output
        const audioMatch = outputBuffer.match(
          /\[SUCCESS\] Download completed! Audio converted to MP3: (.+\.mp3)/
        );
        const videoMatch = outputBuffer.match(
          /\[SUCCESS\] Download completed! Video saved to: (.+\.mp4)/
        );
        const audioOriginalMatch = outputBuffer.match(
          /\[SUCCESS\] Download completed! Audio already in MP3 format: (.+\.mp3)/
        );

        if (audioMatch || videoMatch || audioOriginalMatch) {
          const filenamePart =
            audioMatch?.[1] || videoMatch?.[1] || audioOriginalMatch?.[1];

          if (filenamePart) {
            // Use the original filename from the download
            const originalFilename = path.basename(filenamePart);

            // If we have the video title, use it as a more descriptive filename
            // but keep the file extension from the actual downloaded file
            if (videoTitle) {
              const fileExtension = path.extname(originalFilename);

              // Try to parse artist and song information from common formats
              let displayTitle = videoTitle;
              let parsedInfo = null;

              // Common YouTube music title patterns
              const patterns = [
                /^(.+?)\s*-\s*(.+)$/, // "Artist - Song"
                /^(.+?)\s*:\s*(.+)$/, // "Artist: Song"
                /^(.+?)\s+by\s+(.+)$/i, // "Song by Artist"
                /^(.+?)\s*\|\s*(.+)$/, // "Artist | Song"
                /^(.+?)\s*–\s*(.+)$/, // "Artist – Song" (em dash)
              ];

              for (const pattern of patterns) {
                const match = videoTitle.match(pattern);
                if (match) {
                  const [, part1, part2] = match;
                  // For "Song by Artist" format, swap the parts
                  if (videoTitle.toLowerCase().includes(" by ")) {
                    parsedInfo = { artist: part2.trim(), song: part1.trim() };
                  } else {
                    parsedInfo = { artist: part1.trim(), song: part2.trim() };
                  }
                  break;
                }
              }

              // If we successfully parsed artist and song, format nicely
              if (parsedInfo) {
                displayTitle = `${parsedInfo.artist} - ${parsedInfo.song}`;
              }

              // Clean the title for use as filename (remove invalid characters)
              const cleanTitle = displayTitle
                .replace(/[<>:"/\\|?*]/g, "") // Remove invalid filename characters
                .replace(/\s+/g, " ") // Normalize whitespace
                .trim();

              updatedData.filename = `${cleanTitle}${fileExtension}`;
              updatedData.title = videoTitle; // Store original title
            } else {
              updatedData.filename = originalFilename;
            }
          }
        }

        updatedData.status = "completed";
        updatedData.progress = 100;
        console.log(
          `Download completed for ${downloadId}: ${updatedData.filename}`
        );
      } else {
        // Error
        updatedData.status = "failed";
        updatedData.error =
          outputBuffer || "Download failed with unknown error";
        console.error(`Download failed for ${downloadId}:`, updatedData.error);
      }

      downloadStore.set(downloadId, updatedData);
    });

    pythonProcess.on("error", (error: Error) => {
      console.error(`Python process error for ${downloadId}:`, error.message);

      const failedData = downloadStore.get(downloadId);
      if (failedData) {
        failedData.status = "failed";
        failedData.error = `Process error: ${error.message}`;
        downloadStore.set(downloadId, failedData);
      }
    });
  } catch (error: any) {
    console.error(`Download error for ${downloadId}:`, error);
    const failedData = downloadStore.get(downloadId);
    if (failedData) {
      failedData.status = "failed";
      failedData.error = error.message;
      downloadStore.set(downloadId, failedData);
    }
  }
}

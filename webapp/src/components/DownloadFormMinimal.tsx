"use client";

import { AlertCircle, CheckCircle, Download, Loader } from "lucide-react";
import { useEffect, useState } from "react";

interface DownloadData {
  id: string;
  url: string;
  type: "audio" | "video";
  quality: string;
  status: "started" | "downloading" | "completed" | "failed";
  progress: number;
  filename: string | null;
  title: string | null;
  error: string | null;
  createdAt: string;
}

export default function DownloadFormMinimal() {
  const [url, setUrl] = useState("");
  const [downloadType, setDownloadType] = useState<"audio" | "video">("audio");
  const [quality, setQuality] = useState("best");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState("");
  const [downloadData, setDownloadData] = useState<DownloadData | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Poll for download status
  useEffect(() => {
    if (!isPolling || !downloadData?.id) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/download/${downloadData.id}`);
        if (res.ok) {
          const data = await res.json();
          setDownloadData(data);

          // Stop polling if completed or failed
          if (data.status === "completed" || data.status === "failed") {
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [isPolling, downloadData?.id]);

  const testDiagnostics = async () => {
    setError("");
    setResponse(null);

    try {
      console.log("Testing diagnostics endpoint...");
      const res = await fetch("/api/diagnostics", {
        method: "GET",
      });
      console.log("Diagnostics response status:", res.status);
      const data = await res.json();
      console.log("Diagnostics data:", data);
      setResponse(data);
    } catch (error: any) {
      console.error("Diagnostics error:", error);
      setError(`Diagnostics failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResponse(null);
    setDownloadData(null);
    setIsPolling(false);

    try {
      console.log("Sending request to download API...");
      const res = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          type: downloadType,
          quality,
        }),
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setResponse(data);

      // Start polling for status if we got a download ID
      if (data.downloadId) {
        setDownloadData({
          id: data.downloadId,
          url: url.trim(),
          type: downloadType,
          quality,
          status: "started",
          progress: 0,
          filename: null,
          title: null,
          error: null,
          createdAt: new Date().toISOString(),
        });
        setIsPolling(true);
      }
    } catch (error: any) {
      console.error("Download error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-black mb-8">
        YouTube Downloader - Test Mode
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            YouTube URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            required
          />
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Download Type
          </label>
          <select
            id="type"
            value={downloadType}
            onChange={(e) =>
              setDownloadType(e.target.value as "audio" | "video")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="audio">Audio (MP3)</option>
            <option value="video">Video (MP4)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="quality"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Quality
          </label>
          <select
            id="quality"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="best">Best</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
            <option value="360p">360p</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || isPolling}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {loading || isPolling ? (
            <>
              <Loader className="animate-spin h-4 w-4 mr-2" />
              {isPolling ? "Processing..." : "Starting..."}
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download
            </>
          )}
        </button>

        <button
          type="button"
          onClick={testDiagnostics}
          disabled={loading || isPolling}
          className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
        >
          Test Diagnostics
        </button>
      </form>

      {/* Download Progress */}
      {downloadData && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium text-gray-900 mb-3">Download Progress</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <div className="flex items-center">
                {downloadData.status === "completed" && (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                )}
                {downloadData.status === "failed" && (
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                )}
                {(downloadData.status === "started" ||
                  downloadData.status === "downloading") && (
                  <Loader className="animate-spin h-4 w-4 text-blue-500 mr-1" />
                )}
                <span
                  className={`font-medium ${
                    downloadData.status === "completed"
                      ? "text-green-600"
                      : downloadData.status === "failed"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {downloadData.status.charAt(0).toUpperCase() +
                    downloadData.status.slice(1)}
                </span>
              </div>
            </div>

            {downloadData.status === "downloading" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Progress:</span>
                  <span>{downloadData.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadData.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {downloadData.title && (
              <div className="text-sm">
                <span className="text-gray-600">Title:</span>
                <span className="ml-2 text-black font-medium">
                  {downloadData.title}
                </span>
              </div>
            )}

            {downloadData.filename && (
              <div className="text-sm">
                <span className="text-gray-600">File:</span>
                <span className="ml-2 font-mono text-black">
                  {downloadData.filename}
                </span>
              </div>
            )}

            {downloadData.error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                <strong>Error:</strong> {downloadData.error}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">Error: {error}</p>
        </div>
      )}

      {response && !downloadData && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm font-medium">API Response:</p>
          <pre className="text-green-700 text-xs mt-2 overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

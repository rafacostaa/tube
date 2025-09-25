"use client";

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Loader,
  Music,
  Play,
  User,
  Video,
} from "lucide-react";
import { useState } from "react";
import {
  apiService,
  DownloadRequest,
  DownloadStatus,
  VideoInfo,
} from "../lib/api";

export default function DownloadForm() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadType, setDownloadType] = useState<"audio" | "video">("audio");
  const [quality, setQuality] = useState("best");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloads, setDownloads] = useState<Record<string, DownloadStatus>>(
    {}
  );

  const handleGetVideoInfo = async () => {
    if (!url.trim()) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setLoading(true);
    setError("");
    setVideoInfo(null);

    try {
      const info = await apiService.getVideoInfo(url);
      setVideoInfo(info);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to fetch video information"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) {
      setError("Please get video information first");
      return;
    }

    const downloadRequest: DownloadRequest = {
      url,
      type: downloadType,
      quality,
    };

    try {
      setLoading(true);
      const response = await apiService.startDownload(downloadRequest);

      // Add to downloads list
      const newDownload: DownloadStatus = {
        id: response.downloadId,
        url: url,
        type: downloadType,
        quality: quality,
        status: "started",
        progress: 0,
        filename: null,
        error: null,
        createdAt: new Date().toISOString(),
      };

      setDownloads((prev) => ({
        ...prev,
        [response.downloadId]: newDownload,
      }));

      // Start polling for progress
      pollDownloadStatus(response.downloadId);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start download");
    } finally {
      setLoading(false);
    }
  };

  const pollDownloadStatus = (downloadId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await apiService.getDownloadStatus(downloadId);

        setDownloads((prev) => ({
          ...prev,
          [downloadId]: status,
        }));

        if (status.status === "completed" || status.status === "failed") {
          clearInterval(interval);
        }
      } catch (err) {
        clearInterval(interval);
        console.error("Failed to get download status:", err);
      }
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎬 YouTube Downloader
          </h1>
          <p className="text-gray-600">
            Download YouTube videos and audio with ease
          </p>
        </div>

        {/* URL Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
            />
            <button
              onClick={handleGetVideoInfo}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Get Info
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Video Information */}
        {videoInfo && (
          <div className="mb-6 p-6 bg-gray-50 rounded-lg">
            <div className="flex gap-4 mb-4">
              <img
                src={videoInfo.thumbnail_url}
                alt={videoInfo.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  {videoInfo.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {videoInfo.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {formatViews(videoInfo.views)} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(videoInfo.length)}
                  </div>
                </div>
              </div>
            </div>

            {/* Download Options */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Download Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Download Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDownloadType("audio")}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                      downloadType === "audio"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <Music className="w-4 h-4" />
                    Audio (MP3)
                  </button>
                  <button
                    onClick={() => setDownloadType("video")}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                      downloadType === "video"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Video (MP4)
                  </button>
                </div>
              </div>

              {/* Quality Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                >
                  <option value="best">Best Available</option>
                  {downloadType === "audio"
                    ? videoInfo.audio_qualities.map((q) => (
                        <option key={q.quality} value={q.quality}>
                          {q.quality}kbps (
                          {q.filesize
                            ? (q.filesize / 1024 / 1024).toFixed(1) + "MB"
                            : "Unknown size"}
                          )
                        </option>
                      ))
                    : videoInfo.video_qualities.map((q) => (
                        <option key={q.quality} value={q.quality}>
                          {q.quality}p (
                          {q.filesize
                            ? (q.filesize / 1024 / 1024).toFixed(1) + "MB"
                            : "Unknown size"}
                          )
                        </option>
                      ))}
                </select>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={loading}
              className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              Download {downloadType === "audio" ? "Audio" : "Video"}
            </button>
          </div>
        )}

        {/* Downloads List */}
        {Object.keys(downloads).length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Downloads
            </h3>
            <div className="space-y-4">
              {Object.values(downloads).map((download) => (
                <div
                  key={download.id}
                  className="download-card p-4 bg-white border rounded-lg shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {download.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : download.status === "failed" ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Loader className="w-5 h-5 animate-spin text-blue-500" />
                      )}
                      <span className="font-medium">{download.filename}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {download.progress}%
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="progress-bar bg-blue-600 h-2 rounded-full"
                        style={{ width: `${download.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`${
                        download.status === "failed"
                          ? "text-red-600"
                          : download.status === "completed"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      {download.error ||
                        (download.status === "started"
                          ? "Starting download..."
                          : download.status === "downloading"
                          ? "Downloading..."
                          : download.status === "completed"
                          ? `Downloaded: ${download.filename}`
                          : download.status === "failed"
                          ? download.error || "Download failed"
                          : "Processing...")}
                    </span>
                    <span className="text-gray-500 capitalize">
                      {download.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

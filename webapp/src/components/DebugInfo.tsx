"use client";

import { useEffect, useState } from "react";

export default function DebugInfo() {
  const [apiStatus, setApiStatus] = useState("checking...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/health");
        if (response.ok) {
          const data = await response.json();
          setApiStatus(`✅ API Online: ${data.message}`);
        } else {
          setApiStatus(`❌ API Error: ${response.status}`);
        }
      } catch (err: any) {
        setApiStatus("❌ API Offline");
        setError(err.message);
      }
    };

    checkAPI();
    const interval = setInterval(checkAPI, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border max-w-sm">
      <h3 className="font-bold text-sm mb-2">🔧 Debug Info</h3>
      <div className="text-xs space-y-1">
        <div>
          <strong>Frontend:</strong> ✅ Running
        </div>
        <div>
          <strong>API Status:</strong> {apiStatus}
        </div>
        {error && (
          <div className="text-red-600">
            <strong>Error:</strong> {error}
          </div>
        )}
        <div>
          <strong>API URL:</strong> http://localhost:5000
        </div>
        <div>
          <strong>Frontend URL:</strong> {window.location.href}
        </div>
      </div>
    </div>
  );
}

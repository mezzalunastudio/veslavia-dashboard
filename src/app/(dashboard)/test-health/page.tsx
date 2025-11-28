"use client";


import { Button } from "@/components/ui/button";
import { getHealthStatus, HealthStatus } from "@/utils/apihelper";
import React, { useEffect, useState } from "react";
//test-health
export default function HealthPage() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    const result = await getHealthStatus();
    setStatus(result);
    setLoading(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
                <h1
                    className={`text-5xl font-semibold mb-10 border-none`}
                  >
                    Heatlh Check
                  </h1>

      {loading ? (
        <p className="text-yellow-400">Checking connection...</p>
      ) : status?.ok ? (
        <div className={`p-6 rounded-xl shadow-lg w-[320px] text-center border border-green-600`}>
          <p className="text-green-400 font-semibold mb-2">✅ Connected</p>
          <div className="text-sm space-y-1">
            <p>Database: {status.database}</p>
            <p>Latency: {status.latency}</p>
            <p>Uptime: {status.uptime}</p>
            <p>Env: {status.environment}</p>
            <p>Checked: {new Date(status.timestamp || "").toLocaleTimeString()}</p>
          </div>
        </div>
      ) : (
        <div className={`p-6 rounded-xl shadow-lg w-[320px] text-center border border-red-600`}>
          <p className="text-red-400 font-semibold mb-2">❌ Disconnected</p>
          <div className="text-sm space-y-1">
            <p>{status?.message}</p>
            <p>Status code: {status?.code}</p>
          </div>
        </div>
      )}
      <Button onClick={checkHealth} className={`gap-2 mt-10`}>
             Refresh Now
            </Button>
    </div>
  );
}

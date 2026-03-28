"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loader2, ShieldAlert, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface Log {
  id: string;
  studentName: string;
  eventType: string;
  createdAt: string;
}

interface Flagged {
  studentId: string;
  name: string;
  counts: Record<string, number>;
  level: "yellow" | "red";
}

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [flagged, setFlagged] = useState<Flagged[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/security-logs")
      .then((r) => r.json())
      .then((d) => { setLogs(d.logs || []); setFlagged(d.flagged || []); })
      .catch(() => toast.error("Xatolik"))
      .finally(() => setLoading(false));
  }, []);

  const eventLabel = (type: string) => {
    const map: Record<string, string> = {
      TAB_SWITCH: "Tab almashdi",
      FULLSCREEN_EXIT: "Fullscreen chiqdi",
      COPY_ATTEMPT: "Nusxa olish",
      DEVTOOLS_OPEN: "DevTools ochdi",
      RIGHT_CLICK: "O'ng klik",
      KEYBOARD_SHORTCUT: "Klaviatura",
      WINDOW_BLUR: "Oyna yo'qoldi",
      MULTIPLE_DEVICE: "Ko'p qurilma",
    };
    return map[type] || type;
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gold-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-gold-gradient">Xavfsizlik loglari</h1>

      {/* Flagged students */}
      {flagged.length > 0 && (
        <Card variant="glass" className="border-red-500/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-semibold text-red-400">Shubhali o&apos;quvchilar</h2>
          </div>
          <div className="space-y-2">
            {flagged.map((f) => (
              <div key={f.studentId} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <Badge variant={f.level === "red" ? "error" : "warning"}>
                  {f.level === "red" ? "QIZIL" : "SARIQ"}
                </Badge>
                <span className="font-medium text-white">{f.name}</span>
                <div className="flex gap-2 ml-auto">
                  {Object.entries(f.counts).map(([type, count]) => (
                    <span key={type} className="text-xs text-white/40">
                      {eventLabel(type)}: <span className="text-white/70 font-mono">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent logs */}
      <Card variant="glass">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-gold-400" />
          <h2 className="text-lg font-semibold">Oxirgi hodisalar</h2>
        </div>
        {logs.length === 0 ? (
          <p className="text-white/50 text-center py-8">Hodisalar yo&apos;q</p>
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.slice(0, 50).map((l) => (
              <div key={l.id} className="flex items-center gap-3 py-2 px-3 rounded hover:bg-white/5 text-sm">
                <span className="text-white/30 font-mono text-xs w-36 shrink-0">
                  {new Date(l.createdAt).toLocaleString("uz-UZ")}
                </span>
                <span className="text-white/70 w-32 shrink-0">{l.studentName}</span>
                <Badge variant={
                  ["DEVTOOLS_OPEN", "MULTIPLE_DEVICE"].includes(l.eventType) ? "error" :
                  ["TAB_SWITCH", "FULLSCREEN_EXIT"].includes(l.eventType) ? "warning" : "default"
                }>
                  {eventLabel(l.eventType)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/admin/PageHeader";
import { Loader2 } from "lucide-react";
import { ShieldIcon, WarningIcon } from "@/components/ui/Icon3D";
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
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Xavfsizlik loglari" subtitle={`${logs.length} ta hodisa`} />

      {/* Flagged students */}
      {flagged.length > 0 && (
        <Card variant="light" className="rounded-xl border-l-4 border-l-red-400 overflow-hidden">
          <div className="flex items-center gap-2 p-5 pb-0">
            <WarningIcon className="w-5 h-5" />
            <h2 className="text-base font-semibold text-red-600">Shubhali o&apos;quvchilar</h2>
            <Badge variant="error" size="sm">{flagged.length}</Badge>
          </div>
          <div className="p-5 pt-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wide text-slate-400">Daraja</th>
                    <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wide text-slate-400">Ism</th>
                    <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wide text-slate-400">Hodisalar</th>
                  </tr>
                </thead>
                <tbody>
                  {flagged.map((f) => (
                    <tr key={f.studentId} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="py-2.5 px-3">
                        <Badge variant={f.level === "red" ? "error" : "warning"} size="sm">
                          {f.level === "red" ? "QIZIL" : "SARIQ"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{f.name}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex gap-3 flex-wrap">
                          {Object.entries(f.counts).map(([type, count]) => (
                            <span key={type} className="text-xs text-slate-500">
                              {eventLabel(type)}: <span className="font-mono font-semibold text-slate-700">{count}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Recent logs */}
      <Card variant="light" className="rounded-xl">
        <div className="flex items-center gap-2 p-5 pb-0">
          <ShieldIcon className="w-5 h-5" />
          <h2 className="text-base font-semibold text-slate-800">Oxirgi hodisalar</h2>
        </div>
        <div className="p-5 pt-3">
          {logs.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">Hodisalar yo&apos;q</p>
          ) : (
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wide text-slate-400">Vaqt</th>
                    <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wide text-slate-400">O&apos;quvchi</th>
                    <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wide text-slate-400">Hodisa</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 50).map((l, i) => (
                    <tr key={l.id} className={`border-b border-slate-50 hover:bg-slate-50/60 ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                      <td className="py-2 px-3 text-slate-400 font-mono text-xs whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString("uz-UZ")}
                      </td>
                      <td className="py-2 px-3 text-slate-700 font-medium">{l.studentName}</td>
                      <td className="py-2 px-3">
                        <Badge variant={
                          ["DEVTOOLS_OPEN", "MULTIPLE_DEVICE"].includes(l.eventType) ? "error" :
                          ["TAB_SWITCH", "FULLSCREEN_EXIT"].includes(l.eventType) ? "warning" : "default"
                        } size="sm">
                          {eventLabel(l.eventType)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

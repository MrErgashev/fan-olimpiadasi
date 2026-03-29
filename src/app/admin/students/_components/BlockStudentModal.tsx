"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { ShieldBan, ShieldCheck, Clock, History } from "lucide-react";
import toast from "react-hot-toast";

interface BlockHistoryItem {
  id: string;
  action: string;
  reason: string | null;
  duration: string | null;
  createdAt: string;
}

interface BlockStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
  student: { id: string; firstName: string; lastName: string; isBlocked: boolean } | null;
}

const REASON_PRESETS = [
  "Qoidabuzarlik",
  "Test paytida noto'g'ri xatti-harakat",
  "Boshqa shaxs nomidan kirish",
  "Texnik sabab",
];

const DURATION_OPTIONS = [
  { value: "permanent", label: "Doimiy" },
  { value: "1d", label: "1 kun" },
  { value: "3d", label: "3 kun" },
  { value: "1w", label: "1 hafta" },
  { value: "1m", label: "1 oy" },
];

function formatDuration(d: string | null): string {
  if (!d || d === "permanent") return "Doimiy";
  const map: Record<string, string> = { "1d": "1 kun", "3d": "3 kun", "1w": "1 hafta", "1m": "1 oy" };
  return map[d] || d;
}

export function BlockStudentModal({ isOpen, onClose, onDone, student }: BlockStudentModalProps) {
  const [reason, setReason] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [duration, setDuration] = useState("permanent");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<BlockHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      setReason("");
      setSelectedPreset("");
      setDuration("permanent");
      setShowHistory(false);
      // Load block history
      fetch(`/api/admin/students/${student.id}/block-history`)
        .then((r) => r.json())
        .then((d) => setHistory(d.history || []))
        .catch(() => {});
    }
  }, [isOpen, student]);

  if (!student) return null;

  const isBlocking = !student.isBlocked;

  const handlePresetSelect = (preset: string) => {
    if (selectedPreset === preset) {
      setSelectedPreset("");
      setReason("");
    } else {
      setSelectedPreset(preset);
      setReason(preset);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBlocked: isBlocking,
          reason: isBlocking ? reason : undefined,
          duration: isBlocking ? duration : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
        return;
      }
      toast.success(isBlocking ? "O'quvchi bloklandi" : "O'quvchi blokdan chiqarildi");
      onDone();
      onClose();
    } catch {
      toast.error("Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isBlocking ? "O'quvchini bloklash" : "Blokdan chiqarish"} size="md" theme="light">
      <div className="space-y-4">
        <p className="text-slate-600">
          <span className="font-semibold text-slate-800">{student.firstName} {student.lastName}</span>
          {isBlocking
            ? " — bu o'quvchini bloklashni xohlaysizmi? Bloklangan o'quvchi tizimga kira olmaydi."
            : " — bu o'quvchini blokdan chiqarmoqchimisiz?"
          }
        </p>

        {isBlocking && (
          <>
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Clock className="w-4 h-4 inline mr-1" />
                Bloklash muddati
              </label>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDuration(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      duration === opt.value
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason presets */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sabab</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {REASON_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                      selectedPreset === preset
                        ? "bg-slate-100 border-slate-400 text-slate-800"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <textarea
                value={reason}
                onChange={(e) => { setReason(e.target.value); setSelectedPreset(""); }}
                placeholder="Bloklash sababini yozing..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 resize-none"
                rows={2}
              />
            </div>
          </>
        )}

        {/* Block History */}
        {history.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <History className="w-4 h-4" />
              Bloklash tarixi ({history.length})
            </button>
            {showHistory && (
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {history.map((h) => (
                  <div key={h.id} className="flex items-start gap-2 text-sm p-2 bg-slate-50 rounded-lg">
                    <Badge variant={h.action === "block" ? "error" : "success"} size="sm">
                      {h.action === "block" ? "Bloklandi" : "Ochildi"}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      {h.reason && <p className="text-slate-600 text-xs">{h.reason}</p>}
                      <div className="flex gap-2 text-xs text-slate-400">
                        {h.duration && <span>{formatDuration(h.duration)}</span>}
                        <span>{new Date(h.createdAt).toLocaleDateString("uz-UZ")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Bekor qilish
          </Button>
          <Button
            variant={isBlocking ? "danger" : "blue"}
            onClick={handleSubmit}
            loading={loading}
            icon={isBlocking ? <ShieldBan className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            className="flex-1"
          >
            {isBlocking ? "Bloklash" : "Blokdan chiqarish"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Trash2, ShieldBan, ShieldCheck, AlertTriangle, Archive, ArchiveRestore } from "lucide-react";
import toast from "react-hot-toast";

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
  action: "block" | "unblock" | "delete" | "archive" | "unarchive";
  count: number;
  studentIds: string[];
}

export function BulkActionModal({ isOpen, onClose, onDone, action, count, studentIds }: BulkActionModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const labels = {
    block: { title: "Ommaviy bloklash", btn: "Bloklash", icon: <ShieldBan className="w-4 h-4" /> },
    unblock: { title: "Ommaviy blokdan chiqarish", btn: "Blokdan chiqarish", icon: <ShieldCheck className="w-4 h-4" /> },
    delete: { title: "Ommaviy o'chirish", btn: "O'chirish", icon: <Trash2 className="w-4 h-4" /> },
    archive: { title: "Ommaviy arxivlash", btn: "Arxivlash", icon: <Archive className="w-4 h-4" /> },
    unarchive: { title: "Ommaviy arxivdan chiqarish", btn: "Arxivdan chiqarish", icon: <ArchiveRestore className="w-4 h-4" /> },
  };

  const label = labels[action];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/students/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          studentIds,
          reason: action === "block" ? reason : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
        return;
      }
      toast.success(`${count} ta o'quvchi uchun amal bajarildi`);
      setReason("");
      onDone();
      onClose();
    } catch {
      toast.error("Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={label.title} size="sm" theme="light">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="info">{count} ta o&apos;quvchi</Badge>
          <span className="text-slate-600">tanlangan</span>
        </div>

        {action === "delete" && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              Barcha tanlangan o&apos;quvchilar va ularning test natijalari butunlay o&apos;chiriladi. Bu amalni qaytarib bo&apos;lmaydi!
            </p>
          </div>
        )}

        {action === "archive" && (
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <Archive className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Tanlangan o&apos;quvchilar arxivlanadi. Ma&apos;lumotlar saqlanadi, lekin ro&apos;yxatdan yashiriladi.
            </p>
          </div>
        )}

        {action === "block" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Sabab <span className="text-slate-400">(ixtiyoriy)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Bloklash sababini yozing..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 resize-none"
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Bekor qilish
          </Button>
          <Button
            variant={action === "delete" || action === "block" ? "danger" : "blue"}
            onClick={handleSubmit}
            loading={loading}
            icon={label.icon}
            className="flex-1"
          >
            {label.btn}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

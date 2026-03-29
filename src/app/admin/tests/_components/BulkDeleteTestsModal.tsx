"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

interface BulkDeleteTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
  count: number;
  totalAttempts: number;
  testIds: string[];
}

export function BulkDeleteTestsModal({
  isOpen,
  onClose,
  onDone,
  count,
  totalAttempts,
  testIds,
}: BulkDeleteTestsModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tests/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          testIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Xatolik");
        return;
      }

      const deletedTests = Number(data.deletedTests || 0);
      const deletedAttempts = Number(data.deletedAttempts || 0);

      toast.success(
        deletedAttempts > 0
          ? `${deletedTests} ta test va ${deletedAttempts} ta urinish o'chirildi`
          : `${deletedTests} ta test o'chirildi`
      );
      onDone();
      onClose();
    } catch {
      toast.error("Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tanlangan testlarni o'chirish"
      size="sm"
      theme="light"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="info">{count} ta test</Badge>
          <span className="text-sm text-slate-600">tanlangan</span>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div className="space-y-2 text-sm text-red-700">
            <p>Tanlangan testlar va ularga bog&apos;liq barcha natijalar butunlay o&apos;chiriladi.</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="warning">{count} ta test</Badge>
              <Badge variant="warning">
                <Users className="mr-1 inline h-3.5 w-3.5" />
                {totalAttempts} ta urinish
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Bekor qilish
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={loading}
            icon={<Trash2 className="h-4 w-4" />}
            className="flex-1"
          >
            O&apos;chirish
          </Button>
        </div>
      </div>
    </Modal>
  );
}

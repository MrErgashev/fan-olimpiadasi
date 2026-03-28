"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Save, Loader2, Settings } from "lucide-react";
import toast from "react-hot-toast";

const MAX_SUBJECT_OPTIONS = [
  { value: "1", label: "1 ta fan" },
  { value: "2", label: "2 ta fan" },
  { value: "3", label: "3 ta fan" },
  { value: "5", label: "5 ta fan" },
  { value: "7", label: "7 ta fan (barcha fanlar)" },
  { value: "0", label: "Cheksiz (istalgancha)" },
];

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maxSubjects, setMaxSubjects] = useState("1");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.maxSubjectsPerStudent) {
          setMaxSubjects(data.settings.maxSubjectsPerStudent);
        }
      })
      .catch(() => toast.error("Sozlamalarni yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxSubjectsPerStudent: parseInt(maxSubjects) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Sozlama saqlandi!");
      } else {
        toast.error(data.error || "Xatolik yuz berdi");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
            <Settings className="w-5 h-5 text-green-900" />
          </div>
          Sozlamalar
        </h1>
        <p className="text-white/50 mt-1">
          Platformaning asosiy sozlamalarini boshqarish
        </p>
      </div>

      {/* Ro'yxatdan o'tish sozlamalari */}
      <Card variant="glass" className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Ro&apos;yxatdan o&apos;tish sozlamalari
        </h2>

        <div className="space-y-4 max-w-md">
          <div>
            <Select
              label="Maksimal fan soni"
              value={maxSubjects}
              onChange={(e) => setMaxSubjects(e.target.value)}
              options={MAX_SUBJECT_OPTIONS}
            />
            <p className="text-xs text-white/40 mt-2">
              Har bir o&apos;quvchi ro&apos;yxatdan o&apos;tishda va profilida nechta fan tanlashi mumkinligini belgilaydi.
              &quot;Cheksiz&quot; tanlansa — o&apos;quvchi istalgancha fan tanlashi mumkin.
            </p>
          </div>

          <Button
            onClick={handleSave}
            loading={saving}
            variant="primary"
            icon={<Save className="w-4 h-4" />}
          >
            Saqlash
          </Button>
        </div>
      </Card>
    </div>
  );
}

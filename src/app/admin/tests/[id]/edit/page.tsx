"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Loader2, Save, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface TestData {
  id: string;
  name: string;
  subjectId: string;
  totalQuestions: number;
  durationMinutes: number;
  totalScore: number;
  isRandomOrder: boolean;
  isShuffleOptions: boolean;
  startsAt: string | null;
  endsAt: string | null;
  accessPin: string | null;
  status: string;
  subject: { id: string; name: string; emoji: string };
  _count: { testAttempts: number };
}

function toLocalDatetime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function EditTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    totalQuestions: "",
    durationMinutes: "",
    totalScore: "",
    isRandomOrder: true,
    isShuffleOptions: true,
    startsAt: "",
    endsAt: "",
    accessPin: "",
    status: "draft",
  });

  useEffect(() => {
    fetch(`/api/admin/tests/${testId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.test) {
          const t = d.test;
          setTestData(t);
          setForm({
            name: t.name,
            totalQuestions: String(t.totalQuestions),
            durationMinutes: String(t.durationMinutes),
            totalScore: String(t.totalScore),
            isRandomOrder: t.isRandomOrder,
            isShuffleOptions: t.isShuffleOptions,
            startsAt: toLocalDatetime(t.startsAt),
            endsAt: toLocalDatetime(t.endsAt),
            accessPin: t.accessPin || "",
            status: t.status,
          });
        }
      })
      .catch(() => toast.error("Testni yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, [testId]);

  const hasAttempts = (testData?._count.testAttempts || 0) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.durationMinutes) {
      toast.error("Kerakli maydonlarni to'ldiring");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tests/${testId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          totalQuestions: parseInt(form.totalQuestions),
          durationMinutes: parseInt(form.durationMinutes),
          totalScore: parseInt(form.totalScore),
        }),
      });
      if (res.ok) {
        toast.success("Test yangilandi!");
        router.push("/admin/tests");
      } else {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Testni o'chirishga ishonchingiz komilmi?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/tests/${testId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Test o'chirildi!");
        router.push("/admin/tests");
      } else {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setDeleting(false);
    }
  };

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="text-center py-20 text-slate-500">Test topilmadi</div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/tests">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-800">
              Testni tahrirlash
            </h1>
            <p className="text-sm text-slate-400">
              {testData.subject.emoji} {testData.subject.name}
            </p>
          </div>
        </div>
        {!hasAttempts && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" /> O&apos;chirish
          </Button>
        )}
      </div>

      {hasAttempts && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Bu testda {testData._count.testAttempts} ta urinish mavjud
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Savollar soni, fan va umumiy ball o&apos;zgartirib bo&apos;lmaydi. Faqat vaqt, status va PIN o&apos;zgartirish mumkin.
            </p>
          </div>
        </div>
      )}

      <Card variant="light" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Test nomi"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Savollar soni"
              type="number"
              value={form.totalQuestions}
              onChange={(e) => set("totalQuestions", e.target.value)}
              disabled={hasAttempts}
            />
            <Input
              label="Vaqt (daqiqa)"
              type="number"
              value={form.durationMinutes}
              onChange={(e) => set("durationMinutes", e.target.value)}
            />
            <Input
              label="Umumiy ball"
              type="number"
              value={form.totalScore}
              onChange={(e) => set("totalScore", e.target.value)}
              disabled={hasAttempts}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-button border border-slate-200 bg-white cursor-pointer hover:border-slate-300">
              <input
                type="checkbox"
                checked={form.isRandomOrder}
                onChange={(e) => set("isRandomOrder", e.target.checked)}
                className="w-4 h-4 rounded"
                disabled={hasAttempts}
              />
              <span className="text-sm text-slate-600">Random tartib</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-button border border-slate-200 bg-white cursor-pointer hover:border-slate-300">
              <input
                type="checkbox"
                checked={form.isShuffleOptions}
                onChange={(e) => set("isShuffleOptions", e.target.checked)}
                className="w-4 h-4 rounded"
                disabled={hasAttempts}
              />
              <span className="text-sm text-slate-600">Variantlar shuffle</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ochilish vaqti"
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
            />
            <div>
              <Input
                label="Oxirgi boshlash vaqti"
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => set("endsAt", e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">
                Bu vaqtdan keyin yangi o&apos;quvchilar testni boshlay olmaydi
              </p>
            </div>
          </div>

          <div>
            <Input
              label="Kirish kodi (PIN)"
              value={form.accessPin}
              onChange={(e) => set("accessPin", e.target.value)}
              placeholder="Masalan: 1234"
              maxLength={6}
            />
            <p className="text-xs text-slate-400 mt-1">
              Bo&apos;sh qoldirilsa, PIN so&apos;ralmaydi.
            </p>
          </div>

          <Select
            label="Holat"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            options={[
              { value: "draft", label: "Qoralama" },
              { value: "active", label: "Faol" },
              { value: "closed", label: "Yopilgan" },
            ]}
          />

          {/* Joriy ma'lumotlar */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Ishtirokchilar:</span>
            <Badge variant="info">{testData._count.testAttempts}</Badge>
          </div>

          <Button type="submit" disabled={saving} className="w-full" size="lg">
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Saqlash
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}

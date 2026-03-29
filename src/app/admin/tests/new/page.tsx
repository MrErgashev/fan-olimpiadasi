"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { toTashkentISO } from "@/lib/utils";

interface Subject { id: string; name: string; }

export default function NewTestPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subjectId: "",
    name: "",
    totalQuestions: "30",
    durationMinutes: "90",
    totalScore: "100",
    isRandomOrder: true,
    isShuffleOptions: true,
    startsAt: "",
    endsAt: "",
    accessPin: "",
    status: "draft",
  });

  useEffect(() => {
    fetch("/api/subjects").then((r) => r.json()).then((d) => setSubjects(d.subjects || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId || !form.name || !form.totalQuestions || !form.durationMinutes) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          totalQuestions: parseInt(form.totalQuestions),
          durationMinutes: parseInt(form.durationMinutes),
          totalScore: parseInt(form.totalScore),
          startsAt: toTashkentISO(form.startsAt),
          endsAt: toTashkentISO(form.endsAt),
        }),
      });
      if (res.ok) {
        toast.success("Test yaratildi!");
        router.push("/admin/tests");
      } else {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
      }
    } catch { toast.error("Tarmoq xatosi"); }
    finally { setLoading(false); }
  };

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/tests"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <h1 className="font-display text-2xl font-bold text-slate-800">Yangi test</h1>
      </div>
      <Card variant="light" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Fan" value={form.subjectId} onChange={(e) => set("subjectId", e.target.value)} placeholder="Fanni tanlang" options={subjects.map((s) => ({ value: s.id, label: s.name }))} />
          <Input label="Test nomi" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder='Masalan: "Matematika — I tur"' />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Savollar soni" type="number" value={form.totalQuestions} onChange={(e) => set("totalQuestions", e.target.value)} />
            <Input label="Vaqt (daqiqa)" type="number" value={form.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} />
            <Input label="Umumiy ball" type="number" value={form.totalScore} onChange={(e) => set("totalScore", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-button border border-slate-200 bg-white cursor-pointer hover:border-slate-300">
              <input type="checkbox" checked={form.isRandomOrder} onChange={(e) => set("isRandomOrder", e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm text-slate-600">Random tartib</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-button border border-slate-200 bg-white cursor-pointer hover:border-slate-300">
              <input type="checkbox" checked={form.isShuffleOptions} onChange={(e) => set("isShuffleOptions", e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm text-slate-600">Variantlar shuffle</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ochilish vaqti" type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
            <div>
              <Input label="Oxirgi boshlash vaqti" type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
              <p className="text-xs text-slate-400 mt-1">Bu vaqtdan keyin yangi o&apos;quvchilar testni boshlay olmaydi, lekin boshlagan o&apos;quvchilar davom etadi</p>
            </div>
          </div>
          <div>
            <Input label="Kirish kodi (PIN)" value={form.accessPin} onChange={(e) => set("accessPin", e.target.value)} placeholder="Masalan: 1234" maxLength={6} />
            <p className="text-xs text-slate-400 mt-1">O&apos;quvchilar testni boshlashdan oldin shu kodni kiritishi kerak. Bo&apos;sh qoldirilsa, PIN so&apos;ralmaydi.</p>
          </div>
          <Select label="Holat" value={form.status} onChange={(e) => set("status", e.target.value)} options={[{ value: "draft", label: "Qoralama" }, { value: "active", label: "Faol" }, { value: "closed", label: "Yopilgan" }]} />
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Yaratish</>}
          </Button>
        </form>
      </Card>
    </div>
  );
}

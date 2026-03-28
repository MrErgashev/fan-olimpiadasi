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

interface Subject {
  id: string;
  name: string;
}

export default function NewQuestionPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subjectId: "",
    difficulty: "medium",
    questionText: "",
    questionImageUrl: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
  });

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId || !form.questionText || !form.optionA || !form.optionB || !form.optionC || !form.optionD) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Savol yaratildi!");
        router.push("/admin/questions");
      } else {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/questions">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="font-display text-2xl font-bold text-blue-gradient">Yangi savol</h1>
      </div>

      <Card variant="glass-blue">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Fan"
              value={form.subjectId}
              onChange={(e) => set("subjectId", e.target.value)}
              placeholder="Fanni tanlang"
              options={subjects.map((s) => ({ value: s.id, label: s.name }))}
            />
            <Select
              label="Qiyinlik"
              value={form.difficulty}
              onChange={(e) => set("difficulty", e.target.value)}
              options={[
                { value: "easy", label: "Oson" },
                { value: "medium", label: "O'rta" },
                { value: "hard", label: "Qiyin" },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-200">Savol matni</label>
            <textarea
              value={form.questionText}
              onChange={(e) => set("questionText", e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-button text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-y"
              placeholder="Savol matnini yozing..."
            />
          </div>

          <Input
            label="Savol rasmi (URL, ixtiyoriy)"
            value={form.questionImageUrl}
            onChange={(e) => set("questionImageUrl", e.target.value)}
            placeholder="https://..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="A variant" value={form.optionA} onChange={(e) => set("optionA", e.target.value)} placeholder="A variant matni" />
            <Input label="B variant" value={form.optionB} onChange={(e) => set("optionB", e.target.value)} placeholder="B variant matni" />
            <Input label="C variant" value={form.optionC} onChange={(e) => set("optionC", e.target.value)} placeholder="C variant matni" />
            <Input label="D variant" value={form.optionD} onChange={(e) => set("optionD", e.target.value)} placeholder="D variant matni" />
          </div>

          <Select
            label="To'g'ri javob"
            value={form.correctAnswer}
            onChange={(e) => set("correctAnswer", e.target.value)}
            options={[
              { value: "A", label: "A" },
              { value: "B", label: "B" },
              { value: "C", label: "C" },
              { value: "D", label: "D" },
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-200">Izoh (ixtiyoriy)</label>
            <textarea
              value={form.explanation}
              onChange={(e) => set("explanation", e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-button text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-y"
              placeholder="To'g'ri javob uchun tushuntirish..."
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Saqlash</>}
          </Button>
        </form>
      </Card>
    </div>
  );
}

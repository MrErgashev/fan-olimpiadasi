"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Loader2, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Subject {
  id: string;
  name: string;
}

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [usedInTest, setUsedInTest] = useState(false);
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
    Promise.all([
      fetch("/api/subjects").then((r) => r.json()),
      fetch(`/api/admin/questions/${questionId}`).then((r) => r.json()),
    ]).then(([subjectsData, questionData]) => {
      setSubjects(subjectsData.subjects || []);
      if (questionData.question) {
        const q = questionData.question;
        setForm({
          subjectId: q.subjectId || "",
          difficulty: q.difficulty || "medium",
          questionText: q.questionText || "",
          questionImageUrl: q.questionImageUrl || "",
          optionA: q.optionA || "",
          optionB: q.optionB || "",
          optionC: q.optionC || "",
          optionD: q.optionD || "",
          correctAnswer: q.correctAnswer || "A",
          explanation: q.explanation || "",
        });
      } else {
        toast.error("Savol topilmadi");
        router.push("/admin/questions");
      }
      setFetching(false);
    }).catch(() => {
      toast.error("Ma'lumotlarni yuklashda xatolik");
      setFetching(false);
    });
  }, [questionId, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId || !form.questionText || !form.optionA || !form.optionB || !form.optionC || !form.optionD) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Savol yangilandi!");
        router.push("/admin/questions");
      } else {
        const data = await res.json();
        if (data.error?.includes("testda ishlatilgan")) {
          setUsedInTest(true);
        }
        toast.error(data.error || "Xatolik");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/questions">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="font-display text-2xl font-bold text-slate-800">Savolni tahrirlash</h1>
      </div>

      {usedInTest && (
        <Card variant="light" className="p-4 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">
              Bu savol testda ishlatilgan. To&apos;g&apos;ri javobni o&apos;zgartirish mumkin emas.
            </span>
          </div>
        </Card>
      )}

      <Card variant="light" className="p-6">
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
            <label className="block text-sm font-medium text-slate-700">Savol matni</label>
            <textarea
              value={form.questionText}
              onChange={(e) => set("questionText", e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-button text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 hover:border-slate-300 resize-y"
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

          <div>
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
            {usedInTest && (
              <Badge variant="warning" className="mt-1">Testda ishlatilgan — o&apos;zgartirish mumkin emas</Badge>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Izoh (ixtiyoriy)</label>
            <textarea
              value={form.explanation}
              onChange={(e) => set("explanation", e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-button text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 hover:border-slate-300 resize-y"
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

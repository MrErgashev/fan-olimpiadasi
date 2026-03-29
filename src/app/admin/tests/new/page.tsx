"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ArrowLeft, Loader2, Save, Plus, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Subject { id: string; name: string; }
interface ScoreRange { from: string; to: string; scorePerQuestion: string; label: string; }

export default function NewTestPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [scoringMode, setScoringMode] = useState<"equal" | "custom">("equal");
  const [scoreRanges, setScoreRanges] = useState<ScoreRange[]>([
    { from: "1", to: "10", scorePerQuestion: "1.8", label: "Oson" },
    { from: "11", to: "20", scorePerQuestion: "3.4", label: "O'rta" },
    { from: "21", to: "30", scorePerQuestion: "4.8", label: "Qiyin" },
  ]);
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

  // Jami ball hisoblash
  const calculatedTotal = scoreRanges.reduce((sum, r) => {
    const count = Math.max(0, (parseInt(r.to) || 0) - (parseInt(r.from) || 0) + 1);
    return sum + count * (parseFloat(r.scorePerQuestion) || 0);
  }, 0);
  const totalScoreNum = parseInt(form.totalScore) || 100;
  const scoreMismatch = scoringMode === "custom" && Math.abs(Math.round(calculatedTotal * 10) / 10 - totalScoreNum) > 0.1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId || !form.name || !form.totalQuestions || !form.durationMinutes) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    if (scoreMismatch) {
      toast.error(`Jami ball ${calculatedTotal.toFixed(1)}, kerak ${form.totalScore}`);
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        totalQuestions: parseInt(form.totalQuestions),
        durationMinutes: parseInt(form.durationMinutes),
        totalScore: parseInt(form.totalScore),
        scoringMode,
      };
      if (scoringMode === "custom") {
        payload.scoreRanges = scoreRanges.map((r) => ({
          from: parseInt(r.from),
          to: parseInt(r.to),
          scorePerQuestion: parseFloat(r.scorePerQuestion),
          label: r.label,
        }));
      }
      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const updateRange = (index: number, key: keyof ScoreRange, value: string) => {
    setScoreRanges((prev) => prev.map((r, i) => i === index ? { ...r, [key]: value } : r));
  };

  const addRange = () => {
    const last = scoreRanges[scoreRanges.length - 1];
    const nextFrom = last ? String((parseInt(last.to) || 0) + 1) : "1";
    setScoreRanges([...scoreRanges, { from: nextFrom, to: "", scorePerQuestion: "", label: "" }]);
  };

  const removeRange = (index: number) => {
    if (scoreRanges.length <= 1) return;
    setScoreRanges((prev) => prev.filter((_, i) => i !== index));
  };

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

          {/* Baholash turi */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Baholash turi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScoringMode("equal")}
                className={`p-3 rounded-xl border text-sm text-left transition-all ${
                  scoringMode === "equal"
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                <p className="font-medium">Teng taqsimlash</p>
                <p className="text-xs mt-1 opacity-70">Barcha savollar teng ball</p>
              </button>
              <button
                type="button"
                onClick={() => setScoringMode("custom")}
                className={`p-3 rounded-xl border text-sm text-left transition-all ${
                  scoringMode === "custom"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                <p className="font-medium">Moslashuvchan</p>
                <p className="text-xs mt-1 opacity-70">Diapazon bo&apos;yicha turli ball</p>
              </button>
            </div>
          </div>

          {/* Moslashuvchan baholash diapazonlari */}
          {scoringMode === "custom" && (
            <div className="space-y-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm font-medium text-amber-800">Ball diapazonlari</p>
              {scoreRanges.map((range, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1.5fr_auto] gap-2 items-end">
                  <Input
                    label={i === 0 ? "Dan" : undefined}
                    type="number"
                    value={range.from}
                    onChange={(e) => updateRange(i, "from", e.target.value)}
                    placeholder="1"
                  />
                  <Input
                    label={i === 0 ? "Gacha" : undefined}
                    type="number"
                    value={range.to}
                    onChange={(e) => updateRange(i, "to", e.target.value)}
                    placeholder="10"
                  />
                  <Input
                    label={i === 0 ? "Ball" : undefined}
                    type="number"
                    value={range.scorePerQuestion}
                    onChange={(e) => updateRange(i, "scorePerQuestion", e.target.value)}
                    placeholder="1.8"
                  />
                  <Input
                    label={i === 0 ? "Nomi" : undefined}
                    value={range.label}
                    onChange={(e) => updateRange(i, "label", e.target.value)}
                    placeholder="Oson"
                  />
                  <button
                    type="button"
                    onClick={() => removeRange(i)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={addRange}>
                <Plus className="w-4 h-4 mr-1" /> Diapazon qo&apos;shish
              </Button>

              {/* Jami ball ko'rsatish */}
              <div className={`flex items-center gap-2 p-2 rounded-lg text-sm ${scoreMismatch ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {scoreMismatch && <AlertTriangle className="w-4 h-4" />}
                <span>Jami: <strong>{calculatedTotal.toFixed(1)}</strong> / {form.totalScore} ball</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-button border border-slate-200 bg-white cursor-pointer hover:border-slate-300">
              <input type="checkbox" checked={form.isRandomOrder} onChange={(e) => set("isRandomOrder", e.target.checked)} className="w-4 h-4 rounded" disabled={scoringMode === "custom"} />
              <div>
                <span className="text-sm text-slate-600">Random tartib</span>
                {scoringMode === "custom" && <p className="text-xs text-amber-500">Moslashuvchan rejimda qiyinchilik tartibida</p>}
              </div>
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
          <Button type="submit" disabled={loading || (scoringMode === "custom" && scoreMismatch)} className="w-full" size="lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Yaratish</>}
          </Button>
        </form>
      </Card>
    </div>
  );
}

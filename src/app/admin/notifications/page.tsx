"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Loader2, Send, Bell, Users, User, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

interface Subject {
  id: string;
  name: string;
  emoji?: string;
}

export default function NotificationsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    target: "all",
    studentId: "",
    subjectId: "",
  });

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Sarlavha va xabarni to'ldiring");
      return;
    }
    if (form.target === "student" && !form.studentId.trim()) {
      toast.error("O'quvchi ID sini kiriting");
      return;
    }
    if (form.target === "subject" && !form.subjectId) {
      toast.error("Fanni tanlang");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setForm({ title: "", message: "", target: "all", studentId: "", subjectId: "" });
      } else {
        toast.error(data.error || "Xatolik");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setSending(false);
    }
  };

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800">Bildirishnomalar</h1>
        <p className="text-sm text-slate-400 mt-1">O&apos;quvchilarga xabar yuborish</p>
      </div>

      <Card variant="light" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target tanlash */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Kimga yuborish</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { value: "all", label: "Barcha o'quvchilar", icon: Users },
                { value: "subject", label: "Fan bo'yicha", icon: BookOpen },
                { value: "student", label: "Bitta o'quvchi", icon: User },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("target", opt.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-all ${
                    form.target === opt.value
                      ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fan tanlash (subject target) */}
          {form.target === "subject" && (
            <Select
              label="Fan"
              value={form.subjectId}
              onChange={(e) => set("subjectId", e.target.value)}
              placeholder="Fanni tanlang"
              options={subjects.map((s) => ({
                value: s.id,
                label: `${s.emoji || ""} ${s.name}`.trim(),
              }))}
            />
          )}

          {/* Student ID (student target) */}
          {form.target === "student" && (
            <Input
              label="O'quvchi ID"
              value={form.studentId}
              onChange={(e) => set("studentId", e.target.value)}
              placeholder="O'quvchi ID sini kiriting..."
            />
          )}

          <Input
            label="Sarlavha"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Masalan: Yangi test qo'shildi"
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Xabar matni</label>
            <textarea
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-button text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 hover:border-slate-300 resize-y"
              placeholder="Xabar matnini yozing..."
            />
          </div>

          <Button type="submit" disabled={sending} className="w-full" size="lg">
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Yuborish
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Tayyor shablonlar */}
      <Card variant="light" className="p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4" /> Tayyor shablonlar
        </h3>
        <div className="space-y-2">
          {[
            { title: "Yangi test qo'shildi", message: "Hurmatli o'quvchi, yangi test qo'shildi. Dashboard sahifasida ko'rishingiz mumkin." },
            { title: "Natijalar e'lon qilindi", message: "Test natijalari e'lon qilindi. Natijalarim bo'limida ko'rishingiz mumkin." },
            { title: "Muhim xabar", message: "Diqqat! Olimpiada muddati uzaytirildi. Batafsil ma'lumot uchun platformani kuzatib boring." },
          ].map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setForm((p) => ({ ...p, title: tpl.title, message: tpl.message }))}
              className="w-full text-left px-4 py-3 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all"
            >
              <p className="text-sm font-medium text-slate-700">{tpl.title}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{tpl.message}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

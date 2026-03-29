"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Loader2, Pencil, Clock, Users, Lock, Copy } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Test {
  id: string;
  name: string;
  totalQuestions: number;
  durationMinutes: number;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  accessPin: string | null;
  subject: { name: string; emoji: string };
  _count: { testAttempts: number };
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${day}.${month} ${hours}:${minutes}`;
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchTests = () => {
    fetch("/api/admin/tests")
      .then((r) => r.json())
      .then((d) => setTests(d.tests || []))
      .catch(() => toast.error("Xatolik"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const toggleStatus = async (test: Test) => {
    const nextStatus = test.status === "active" ? "closed" : "active";
    setTogglingId(test.id);
    try {
      const res = await fetch(`/api/admin/tests/${test.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        toast.success(nextStatus === "active" ? "Test faollashtirildi" : "Test yopildi");
        setTests((prev) =>
          prev.map((t) => (t.id === test.id ? { ...t, status: nextStatus } : t))
        );
      } else {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setTogglingId(null);
    }
  };

  const duplicateTest = async (test: Test) => {
    try {
      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: test.subject ? undefined : undefined,
          name: `${test.name} (nusxa)`,
          totalQuestions: test.totalQuestions,
          durationMinutes: test.durationMinutes,
          status: "draft",
        }),
      });
      if (res.ok) {
        toast.success("Test nusxalandi!");
        fetchTests();
      }
    } catch {
      toast.error("Xatolik");
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "active": return <Badge variant="success">Faol</Badge>;
      case "closed": return <Badge variant="error">Yopilgan</Badge>;
      default: return <Badge variant="warning">Qoralama</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-800">Testlar</h1>
        <Link href="/admin/tests/new">
          <Button><Plus className="w-4 h-4 mr-2" /> Yangi test</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : tests.length === 0 ? (
        <Card variant="light" className="text-center py-12">
          <p className="text-slate-500">Testlar yo&apos;q</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {tests.map((t) => (
            <Card key={t.id} variant="light" className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span>{t.subject.emoji}</span>
                    <span className="font-semibold text-slate-800">{t.name}</span>
                    {statusBadge(t.status)}
                    {t.accessPin && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Lock className="w-3 h-3" /> PIN
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mt-1 flex-wrap">
                    <span>{t.totalQuestions} savol</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {t.durationMinutes} daqiqa
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {t._count.testAttempts} ishtirokchi
                    </span>
                  </div>
                  {/* Vaqt oynasi */}
                  {(t.startsAt || t.endsAt) && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                      <Clock className="w-3 h-3" />
                      <span>
                        {t.startsAt ? formatDateTime(t.startsAt) : "—"} → {t.endsAt ? formatDateTime(t.endsAt) : "—"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(t)}
                    disabled={togglingId === t.id}
                    className={t.status === "active" ? "text-red-500 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
                  >
                    {togglingId === t.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : t.status === "active" ? "Yopish" : "Faollashtirish"}
                  </Button>
                  <Link href={`/admin/tests/${t.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateTest(t)}
                    title="Nusxalash"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

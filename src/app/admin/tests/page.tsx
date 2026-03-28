"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
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
  subject: { name: string; emoji: string };
  _count: { testAttempts: number };
  activeQuestionCount: number;
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/tests")
      .then((r) => r.json())
      .then((d) => setTests(d.tests || []))
      .catch(() => toast.error("Xatolik"))
      .finally(() => setLoading(false));
  }, []);

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
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
      ) : tests.length === 0 ? (
        <Card variant="light" className="text-center py-12"><p className="text-slate-500">Testlar yo&apos;q</p></Card>
      ) : (
        <div className="space-y-3">
          {tests.map((t) => {
            const notEnough = t.activeQuestionCount < t.totalQuestions;
            return (
              <Card key={t.id} variant="light" className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{t.subject.emoji}</span>
                      <span className="font-semibold text-slate-800">{t.name}</span>
                      {statusBadge(t.status)}
                    </div>
                    <p className="text-sm text-slate-400">
                      {t.totalQuestions} savol &middot; {t.durationMinutes} daqiqa &middot; {t._count.testAttempts} ishtirokchi
                    </p>
                    {notEnough && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>
                          Bazada faqat {t.activeQuestionCount} ta aktiv savol bor, {t.totalQuestions} ta kerak!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

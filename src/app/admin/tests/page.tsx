"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  Plus,
  Loader2,
  Pencil,
  Clock,
  Users,
  Lock,
  Copy,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { DeleteTestModal } from "./_components/DeleteTestModal";
import { BulkDeleteTestsModal } from "./_components/BulkDeleteTestsModal";

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
  const { data: session } = useSession();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTest, setDeleteTest] = useState<Test | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const canManage = ["admin", "superadmin"].includes(session?.user?.role || "");

  const fetchTests = () => {
    setLoading(true);
    fetch("/api/admin/tests")
      .then((r) => r.json())
      .then((d) => setTests(d.tests || []))
      .catch(() => toast.error("Xatolik"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const refresh = () => {
    setSelectedIds(new Set());
    fetchTests();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === tests.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(tests.map((test) => test.id)));
  };

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
        refresh();
      }
    } catch {
      toast.error("Xatolik");
    }
  };

  const selectedTests = tests.filter((test) => selectedIds.has(test.id));
  const selectedAttempts = selectedTests.reduce(
    (sum, test) => sum + test._count.testAttempts,
    0
  );

  const statusBadge = (s: string) => {
    switch (s) {
      case "active": return <Badge variant="success" size="sm">Faol</Badge>;
      case "closed": return <Badge variant="error" size="sm">Yopilgan</Badge>;
      default: return <Badge variant="warning" size="sm">Qoralama</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Testlar" subtitle={`Jami: ${tests.length} ta`}>
        <Link href="/admin/tests/new">
          <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Yangi test</Button>
        </Link>
      </PageHeader>

      {canManage && selectedIds.size > 0 && (
        <Card variant="light" className="rounded-xl flex flex-wrap items-center gap-3 p-3 border-primary-200 bg-primary-50/30">
          <Badge variant="info" size="sm">{selectedIds.size} ta test tanlandi</Badge>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowBulkDelete(true)}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Tanlanganlarni o&apos;chirish
          </Button>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : tests.length === 0 ? (
        <Card variant="light" className="rounded-xl text-center py-16">
          <p className="text-slate-400 text-sm">Testlar yo&apos;q</p>
          <p className="text-slate-300 text-xs mt-1">Yangi test yarating</p>
        </Card>
      ) : (
        <Card variant="light" className="rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  {canManage && (
                    <th className="text-left py-3 px-4 w-10">
                      <button
                        onClick={toggleSelectAll}
                        className="text-slate-400 transition-colors hover:text-primary-600"
                        aria-label="Barchasini tanlash"
                      >
                        {selectedIds.size === tests.length ? (
                          <CheckSquare className="h-4 w-4 text-primary-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                  )}
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Test nomi</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Holat</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Savollar</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Davomiylik</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Ishtirokchilar</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Vaqt oynasi</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t, i) => (
                  <tr key={t.id} className={`border-b border-slate-100 transition-colors hover:bg-slate-50/60 ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                    {canManage && (
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleSelect(t.id)}
                          className="text-slate-400 transition-colors hover:text-primary-600"
                          aria-label={`${t.name} ni tanlash`}
                        >
                          {selectedIds.has(t.id) ? (
                            <CheckSquare className="h-4 w-4 text-primary-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{t.subject.emoji}</span>
                        <div>
                          <span className="font-medium text-slate-800">{t.name}</span>
                          {t.accessPin && (
                            <span className="ml-2 inline-flex items-center gap-0.5 text-[11px] text-slate-400">
                              <Lock className="w-3 h-3" /> PIN
                            </span>
                          )}
                          <p className="text-xs text-slate-400">{t.subject.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{statusBadge(t.status)}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600 hidden sm:table-cell">{t.totalQuestions}</td>
                    <td className="py-3 px-4 text-center text-slate-500 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t.durationMinutes} daq
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Users className="w-3 h-3" />
                        {t._count.testAttempts}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-slate-400 hidden lg:table-cell">
                      {(t.startsAt || t.endsAt)
                        ? `${formatDateTime(t.startsAt)} → ${formatDateTime(t.endsAt)}`
                        : "—"
                      }
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(t)}
                          disabled={togglingId === t.id}
                          className={t.status === "active" ? "text-red-500 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
                        >
                          {togglingId === t.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : t.status === "active" ? "Yopish" : "Faol"}
                        </Button>
                        <Link href={`/admin/tests/${t.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateTest(t)}
                          title="Nusxalash"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTest(t)}
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <DeleteTestModal
        isOpen={!!deleteTest}
        onClose={() => setDeleteTest(null)}
        onDone={refresh}
        test={deleteTest}
      />
      <BulkDeleteTestsModal
        isOpen={showBulkDelete}
        onClose={() => setShowBulkDelete(false)}
        onDone={() => {
          setShowBulkDelete(false);
          refresh();
        }}
        count={selectedIds.size}
        totalAttempts={selectedAttempts}
        testIds={Array.from(selectedIds)}
      />
    </div>
  );
}

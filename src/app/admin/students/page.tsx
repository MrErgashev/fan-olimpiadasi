"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  schoolName: string;
  isBlocked: boolean;
  region: { name: string } | null;
  subjects: { subject: { name: string; emoji: string } }[];
  _count: { testAttempts: number };
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async (s?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (s) params.set("search", s);
      const res = await fetch(`/api/admin/students?${params}`);
      const data = await res.json();
      setStudents(data.students || []);
      setTotal(data.total || 0);
    } catch { toast.error("Xatolik"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gold-gradient">O&apos;quvchilar</h1>
        <p className="text-sm text-white/40 mt-1">Jami: {total} ta</p>
      </div>

      <div className="flex gap-2">
        <Input placeholder="Ism, familiya yoki telefon..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchStudents(search)} className="flex-1" />
        <Button variant="secondary" onClick={() => fetchStudents(search)}><Search className="w-4 h-4" /></Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold-400" /></div>
      ) : (
        <div className="space-y-3">
          {students.map((s) => (
            <Card key={s.id} variant="glass">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{s.firstName} {s.lastName}</span>
                    {s.isBlocked && <Badge variant="error">Bloklangan</Badge>}
                  </div>
                  <p className="text-sm text-white/40">
                    {s.phone} &middot; {s.region?.name || ""} &middot; {s.schoolName}
                  </p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {s.subjects.map((sub) => (
                      <Badge key={sub.subject.name} variant="default">{sub.subject.emoji} {sub.subject.name}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-white/40">
                  {s._count.testAttempts} test
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

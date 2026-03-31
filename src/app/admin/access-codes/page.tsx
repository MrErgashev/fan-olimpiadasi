"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/admin/PageHeader";
import { Plus, Loader2, Copy } from "lucide-react";
import { KeyIcon } from "@/components/ui/Icon3D";
import toast from "react-hot-toast";

interface Code {
  id: string;
  code: string;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  expiresAt: string | null;
  _count: { students: number };
}

export default function AccessCodesPage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState("5");
  const [maxUses, setMaxUses] = useState("1");

  useEffect(() => { fetchCodes(); }, []);

  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/admin/codes");
      const data = await res.json();
      setCodes(data.codes || []);
    } catch { toast.error("Xatolik"); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: parseInt(count), maxUses: parseInt(maxUses) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${data.count} ta kod yaratildi!`);
        fetchCodes();
      }
    } catch { toast.error("Xatolik"); }
    finally { setGenerating(false); }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Nusxa olindi!");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Access kodlar" subtitle={`Jami: ${codes.length} ta kod`} />

      {/* Generate */}
      <Card variant="light" className="rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Yangi kod generatsiya qilish</h3>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <Input label="Nechta kod" type="number" value={count} onChange={(e) => setCount(e.target.value)} className="w-32" />
          <Input label="Max ishlatish" type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className="w-32" />
          <Button onClick={handleGenerate} disabled={generating} size="sm">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Generatsiya</>}
          </Button>
        </div>
      </Card>

      {/* Codes table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
      ) : codes.length === 0 ? (
        <Card variant="light" className="rounded-xl text-center py-16">
          <KeyIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-slate-400 text-sm">Kodlar topilmadi</p>
        </Card>
      ) : (
        <Card variant="light" className="rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Kod</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Holat</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Ishlatilgan</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c, i) => (
                  <tr key={c.id} className={`border-b border-slate-100 transition-colors hover:bg-slate-50/60 ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-primary-600">{c.code}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={c.isActive ? "success" : "error"} size="sm">
                        {c.isActive ? "Faol" : "O'chiq"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-xs text-slate-600">{c.currentUses}/{c.maxUses}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => copyCode(c.code)} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors">
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

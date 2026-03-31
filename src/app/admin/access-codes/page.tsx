"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
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
      <h1 className="font-display text-2xl font-bold text-slate-800">Access kodlar</h1>

      {/* Generate */}
      <Card variant="light" className="p-5">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <Input label="Nechta kod" type="number" value={count} onChange={(e) => setCount(e.target.value)} className="w-32" />
          <Input label="Max ishlatish" type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className="w-32" />
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Generatsiya</>}
          </Button>
        </div>
      </Card>

      {/* Codes list */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {codes.map((c) => (
            <Card key={c.id} variant="light" className="flex items-center gap-3 p-4">
              <KeyIcon className="w-4 h-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-primary-600 truncate">{c.code}</p>
                <p className="text-xs text-slate-400">{c.currentUses}/{c.maxUses} ishlatilgan</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={c.isActive ? "success" : "error"}>
                  {c.isActive ? "Faol" : "O'chiq"}
                </Badge>
                <button onClick={() => copyCode(c.code)} className="p-1 hover:bg-slate-100 rounded">
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

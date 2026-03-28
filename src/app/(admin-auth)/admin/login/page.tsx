"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/shared/Logo";
import { Loader2, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("admin-login", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email yoki parol noto'g'ri");
      } else {
        toast.success("Muvaffaqiyatli kirdingiz!");
        router.push("/admin/dashboard");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" className="justify-center" />
          <div className="mt-4 flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-gold-400" />
            <h1 className="font-display text-xl font-bold text-gold-gradient">
              Admin Panel
            </h1>
          </div>
        </div>

        <Card variant="gold">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@oriental.uz"
            />
            <Input
              label="Parol"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Parolingiz"
            />
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirish"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

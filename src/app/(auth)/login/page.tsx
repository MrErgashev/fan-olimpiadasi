"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/shared/Logo";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ phone: "+998", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!/^\+998\d{9}$/.test(form.phone))
      newErrors.phone = "+998XXXXXXXXX formatda kiriting";
    if (!form.password) newErrors.password = "Parolni kiriting";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("student-login", {
        phone: form.phone,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Telefon raqam yoki parol noto'g'ri");
      } else {
        toast.success("Muvaffaqiyatli kirdingiz!");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 spotlight" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="md" />
          </Link>
          <h1 className="mt-6 font-display text-2xl sm:text-3xl font-bold text-gold-gradient">
            Kirish
          </h1>
          <p className="mt-2 text-white/50">
            O&apos;quvchi kabinetiga kirish
          </p>
        </div>

        <Card variant="gold" className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Telefon raqam"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errors.phone}
              placeholder="+998901234567"
              type="tel"
            />

            <div className="relative">
              <Input
                label="Parol"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                error={errors.password}
                placeholder="Parolingizni kiriting"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-white/40 hover:text-white/70"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Kirish"
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-white/40">
              Hali ro&apos;yxatdan o&apos;tmaganmisiz?{" "}
              <Link
                href="/register"
                className="text-gold-400 hover:text-gold-300"
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

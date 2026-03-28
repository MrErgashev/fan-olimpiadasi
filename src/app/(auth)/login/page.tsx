"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/shared/Logo";
import { Eye, EyeOff, Phone } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-green-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 spotlight" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-green-700/15 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gold-500/5 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <h1 className="mt-8 font-display text-3xl sm:text-4xl font-bold text-gold-gradient">
            Kirish
          </h1>
          <div className="ornamental-line mt-4 mb-4" />
          <p className="text-white/50 text-lg">
            O&apos;quvchi kabinetiga kirish
          </p>
        </div>

        <Card variant="glass-gold" className="p-8 sm:p-10 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Input
                label="Telefon raqam"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                error={errors.phone}
                placeholder="+998901234567"
                type="tel"
                icon={<Phone className="w-4 h-4" />}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
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
                className="absolute right-3 top-[38px] text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="submit"
                loading={loading}
                variant="premium"
                className="w-full"
                size="lg"
              >
                Kirish
              </Button>
            </motion.div>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-white/5">
            <p className="text-sm text-white/40">
              Hali ro&apos;yxatdan o&apos;tmaganmisiz?{" "}
              <Link
                href="/register"
                className="text-gold-400 hover:text-gold-300 transition-colors font-medium"
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

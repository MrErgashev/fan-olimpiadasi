"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-navy-950 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-navy-700/30 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-gold-500/[0.05] blur-[100px]" />
        <div className="relative text-center flex flex-col items-center">
          <Link href="/">
            <Logo size="xl" variant="dark" />
          </Link>
          <h2 className="mt-8 text-3xl font-display font-bold text-white">
            Fan Olimpiadasi
          </h2>
          <p className="mt-3 text-white/40 max-w-sm">
            11-sinf o&apos;quvchilari orasida respublika miqyosidagi bilim bellashuvi
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-10 flex justify-center">
            <Link href="/">
              <Logo size="lg" variant="light" />
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-navy-950 mb-2">
            Kirish
          </h1>
          <p className="text-slate-500 mb-8">
            O&apos;quvchi kabinetiga kirish uchun ma&apos;lumotlaringizni kiriting
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Telefon raqam"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errors.phone}
              placeholder="+998901234567"
              type="tel"
              icon={<Phone className="w-4 h-4" />}
              variant="light"
            />

            <div className="relative">
              <Input
                label="Parol"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                placeholder="Parolingizni kiriting"
                variant="light"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
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
              loading={loading}
              variant="primary"
              className="w-full"
              size="lg"
            >
              Kirish
            </Button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Hali ro&apos;yxatdan o&apos;tmaganmisiz?{" "}
              <Link
                href="/register"
                className="text-gold-600 hover:text-gold-500 transition-colors font-semibold"
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

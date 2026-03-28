"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/shared/Logo";
import { Loader2, Shield, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-navy-950 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Radial gradient base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(10, 61, 42, 0.3) 0%, transparent 60%)",
          }}
        />

        {/* Spotlight from top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(212, 168, 67, 0.07) 0%, transparent 65%)",
          }}
        />

        {/* Floating orbs */}
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-gold-500/[0.07] rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -right-40 w-[350px] h-[350px] bg-green-500/[0.08] rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 right-1/5 w-48 h-48 bg-gold-400/[0.04] rounded-full blur-2xl animate-pulse-subtle" />
        <div className="absolute bottom-1/4 left-1/6 w-32 h-32 bg-green-400/[0.05] rounded-full blur-2xl animate-float" />

        {/* Noise texture */}
        <div className="noise-overlay absolute inset-0 opacity-30" />
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 w-full max-w-[420px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Logo size="lg" className="justify-center" />
          <div className="ornamental-line mt-5 mx-auto" />
          <div className="mt-5 flex items-center justify-center gap-2.5">
            <Shield className="w-5 h-5 text-gold-400" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gradient-gold-shimmer">
              Boshqaruv Paneli
            </h1>
          </div>
          <p className="text-white/40 text-sm tracking-premium uppercase mt-2.5">
            Tizimga kirish
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div variants={itemVariants}>
          <div className="glass-gold gold-border-bright rounded-2xl shadow-glow-gold-lg p-8 sm:p-10">
            {/* Card header */}
            <div className="text-center mb-6">
              <h2 className="font-display text-xl text-gold-300 font-semibold">
                Xush kelibsiz
              </h2>
              <p className="text-white/40 text-sm mt-1">
                Davom etish uchun ma&apos;lumotlaringizni kiriting
              </p>
            </div>
            <div className="gradient-divider mb-6" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                variant="dark"
                label="Elektron pochta"
                type="email"
                icon={<Mail className="w-5 h-5" />}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@oriental.uz"
              />

              {/* Password with visibility toggle */}
              <div className="relative">
                <Input
                  variant="dark"
                  label="Parol"
                  type={showPassword ? "text" : "password"}
                  icon={<Lock className="w-5 h-5" />}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Parolingizni kiriting"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 bottom-3 text-white/30 hover:text-gold-400 transition-colors duration-200"
                  tabIndex={-1}
                  aria-label={
                    showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"
                  }
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
                variant="premium"
                size="lg"
                loading={loading}
                className="w-full mt-2"
                icon={
                  !loading ? <Shield className="w-5 h-5" /> : undefined
                }
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Tizimga Kirish"
                )}
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-white/25 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-bit SSL bilan himoyalangan</span>
          </div>
          <p className="text-white/15 text-xs mt-2">
            Faqat vakolatli xodimlar uchun
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

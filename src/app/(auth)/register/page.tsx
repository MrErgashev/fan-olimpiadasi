"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/shared/Logo";
import { SUBJECTS, REGIONS } from "@/lib/constants";
import { ArrowLeft, Check, Eye, EyeOff, KeyRound, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";

type Step = "code" | "form";

// Subject accent colors for selection cards
const SUBJECT_ACCENT: Record<string, string> = {
  matematika: "border-blue-500/50 bg-blue-500/10 text-blue-400",
  informatika: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
  tarix: "border-amber-500/50 bg-amber-500/10 text-amber-400",
  "ingliz-tili": "border-red-500/50 bg-red-500/10 text-red-400",
  biologiya: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
  "ona-tili": "border-violet-500/50 bg-violet-500/10 text-violet-400",
  "jismoniy-tarbiya": "border-orange-500/50 bg-orange-500/10 text-orange-400",
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("code");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [accessCode, setAccessCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "+998",
    regionId: "",
    districtId: "",
    schoolName: "",
    subjectIds: [] as string[],
    password: "",
    confirmPassword: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleVerifyCode = async () => {
    setCodeError("");
    if (!accessCode.trim()) {
      setCodeError("Kodni kiriting");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: accessCode.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep("form");
        toast.success("Kod tasdiqlandi!");
      } else {
        setCodeError(data.error || "Noto'g'ri kod");
      }
    } catch {
      setCodeError("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setForm((prev) => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter((id) => id !== subjectId)
        : [...prev.subjectIds, subjectId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (form.firstName.length < 2) newErrors.firstName = "Kamida 2 harf";
    if (form.lastName.length < 2) newErrors.lastName = "Kamida 2 harf";
    if (!/^\+998\d{9}$/.test(form.phone))
      newErrors.phone = "+998XXXXXXXXX formatda kiriting";
    if (!form.regionId) newErrors.regionId = "Viloyatni tanlang";
    if (!form.schoolName) newErrors.schoolName = "Maktab nomini kiriting";
    if (form.subjectIds.length === 0)
      newErrors.subjectIds = "Kamida bitta fan tanlang";
    if (form.password.length < 6) newErrors.password = "Kamida 6 belgi";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Parollar mos kelmaydi";
    if (!form.consent) newErrors.consent = "Rozilik berish shart";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, accessCode }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
        router.push("/login");
      } else {
        toast.error(data.error || "Xatolik yuz berdi");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  const currentStepNum = step === "code" ? 1 : 2;

  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 spotlight" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-green-700/15 blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-gold-500/5 blur-[100px]" />

      <div className="relative w-full max-w-lg py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <h1 className="mt-8 font-display text-3xl sm:text-4xl font-bold text-gold-gradient">
            Ro&apos;yxatdan o&apos;tish
          </h1>
          <div className="ornamental-line mt-4 mb-4" />
        </motion.div>

        {/* Step indicator */}
        <div className="mb-8 max-w-xs mx-auto">
          <div className="flex items-center gap-3">
            {/* Step 1 */}
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  currentStepNum >= 1
                    ? "gradient-gold text-green-900 shadow-glow-gold"
                    : "bg-white/10 text-white/40"
                }`}
              >
                {currentStepNum > 1 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  "1"
                )}
              </div>
              <span className="text-xs text-white/40 hidden sm:block">Tasdiqlash</span>
            </div>

            {/* Line */}
            <div className="flex-1 h-[2px] bg-white/10 relative rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: currentStepNum >= 2 ? "100%" : "0%" }}
                transition={{ duration: 0.5 }}
                className="absolute inset-y-0 left-0 gradient-gold"
              />
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="text-xs text-white/40 hidden sm:block">Ma&apos;lumotlar</span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  currentStepNum >= 2
                    ? "gradient-gold text-green-900 shadow-glow-gold"
                    : "bg-white/10 text-white/40"
                }`}
              >
                2
              </div>
            </div>
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === "code" ? (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glass-gold" className="p-8 sm:p-10 rounded-2xl space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-4 shadow-glow-gold">
                    <KeyRound className="w-8 h-8 text-green-900" />
                  </div>
                  <p className="text-white/70 text-lg">
                    Ro&apos;yxatdan o&apos;tish uchun maxsus kodni kiriting
                  </p>
                </div>

                <Input
                  label="Access kod"
                  placeholder="ORIENTAL-2026-XXXX"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  error={codeError}
                  className="text-center font-mono text-lg tracking-[0.15em]"
                />

                <Button
                  onClick={handleVerifyCode}
                  loading={loading}
                  variant="premium"
                  className="w-full"
                  size="lg"
                >
                  Tekshirish
                </Button>

                <p className="text-center text-sm text-white/40">
                  Allaqachon ro&apos;yxatdan o&apos;tganmisiz?{" "}
                  <Link
                    href="/login"
                    className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
                  >
                    Kirish
                  </Link>
                </p>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glass-gold" className="p-8 sm:p-10 rounded-2xl space-y-5">
                <button
                  onClick={() => setStep("code")}
                  className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Orqaga
                </button>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Ism"
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      error={errors.firstName}
                      placeholder="Ism"
                    />
                    <Input
                      label="Familiya"
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      error={errors.lastName}
                      placeholder="Familiya"
                    />
                  </div>

                  <Input
                    label="Telefon raqam"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    error={errors.phone}
                    placeholder="+998901234567"
                    type="tel"
                  />

                  <Select
                    label="Viloyat"
                    value={form.regionId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        regionId: e.target.value,
                        districtId: "",
                      })
                    }
                    error={errors.regionId}
                    placeholder="Viloyatni tanlang"
                    options={REGIONS.map((r) => ({ value: r, label: r }))}
                  />

                  <Input
                    label="Maktab raqami/nomi"
                    value={form.schoolName}
                    onChange={(e) =>
                      setForm({ ...form, schoolName: e.target.value })
                    }
                    error={errors.schoolName}
                    placeholder="Masalan: 15-maktab"
                  />

                  {/* Fan tanlash */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Olimpiada fanlari
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {SUBJECTS.map((subject) => {
                        const isSelected = form.subjectIds.includes(
                          subject.slug
                        );
                        const accent = SUBJECT_ACCENT[subject.slug] || "";
                        return (
                          <button
                            key={subject.slug}
                            type="button"
                            onClick={() => handleSubjectToggle(subject.slug)}
                            className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-sm text-left transition-all duration-300 ${
                              isSelected
                                ? `${accent} scale-[1.02] shadow-lg`
                                : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/[0.07]"
                            }`}
                          >
                            <span className="text-lg">{subject.emoji}</span>
                            <span className="flex-1 font-medium">
                              {subject.name}
                            </span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500 }}
                              >
                                <Check className="w-4 h-4" />
                              </motion.div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {errors.subjectIds && (
                      <p className="text-sm text-red-400">
                        {errors.subjectIds}
                      </p>
                    )}
                  </div>

                  {/* Parol */}
                  <div className="relative">
                    <Input
                      label="Parol"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      error={errors.password}
                      placeholder="Kamida 6 belgi"
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
                  </div>

                  <Input
                    label="Parol tasdig'i"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    error={errors.confirmPassword}
                    placeholder="Parolni qaytadan kiriting"
                  />

                  {/* Rozilik */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) =>
                        setForm({ ...form, consent: e.target.checked })
                      }
                      className="mt-1 w-4 h-4 rounded border-white/20 bg-green-800 text-gold-500 focus:ring-gold-500/40"
                    />
                    <span className="text-sm text-white/60 group-hover:text-white/70 transition-colors">
                      Shaxsiy ma&apos;lumotlarimni qayta ishlashga rozilik
                      beraman
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="text-sm text-red-400">{errors.consent}</p>
                  )}

                  <Button
                    type="submit"
                    loading={loading}
                    variant="premium"
                    className="w-full"
                    size="lg"
                    icon={<UserPlus className="w-5 h-5" />}
                  >
                    Ro&apos;yxatdan o&apos;tish
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

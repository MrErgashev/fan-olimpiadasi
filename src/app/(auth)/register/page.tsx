"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Logo } from "@/components/shared/Logo";
import { SUBJECTS, REGIONS } from "@/lib/constants";
import { ArrowLeft, Check, Eye, EyeOff, KeyRound, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";

type Step = "code" | "form";

const SUBJECT_ACCENT: Record<string, string> = {
  matematika: "border-blue-300 bg-blue-50 text-blue-700",
  informatika: "border-cyan-300 bg-cyan-50 text-cyan-700",
  tarix: "border-amber-300 bg-amber-50 text-amber-700",
  "ingliz-tili": "border-red-300 bg-red-50 text-red-700",
  biologiya: "border-emerald-300 bg-emerald-50 text-emerald-700",
  "ona-tili": "border-violet-300 bg-violet-50 text-violet-700",
  "jismoniy-tarbiya": "border-orange-300 bg-orange-50 text-orange-700",
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
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[40%] bg-navy-950 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-navy-700/30 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-primary-500/[0.08] blur-[100px]" />
        <div className="relative text-center flex flex-col items-center">
          <Link href="/">
            <Logo size="xl" variant="dark" />
          </Link>
          <h2 className="mt-8 text-3xl font-display font-bold text-white">
            Fan Olimpiadasi
          </h2>
          <p className="mt-3 text-white/40 max-w-sm">
            Ro&apos;yxatdan o&apos;ting va respublika miqyosidagi olimpiadada qatnashing
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <Logo size="lg" variant="light" />
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-navy-950 mb-2">
            Ro&apos;yxatdan o&apos;tish
          </h1>
          <p className="text-slate-500 mb-8">
            Olimpiadaga qatnashish uchun hisob yarating
          </p>

          {/* Step indicator */}
          <div className="mb-8 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    currentStepNum >= 1
                      ? "bg-primary-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {currentStepNum > 1 ? <Check className="w-4 h-4" /> : "1"}
                </div>
                <span className="text-xs text-slate-500 hidden sm:block">Tasdiqlash</span>
              </div>

              <div className="flex-1 h-[2px] bg-slate-200 relative rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: currentStepNum >= 2 ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-y-0 left-0 bg-primary-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-1 justify-end">
                <span className="text-xs text-slate-500 hidden sm:block">Ma&apos;lumotlar</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    currentStepNum >= 2
                      ? "bg-primary-500 text-white"
                      : "bg-slate-100 text-slate-400"
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
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-7 h-7 text-navy-950" />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-950 mb-2">
                    Maxsus kodingizni kiriting
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Ro&apos;yxatdan o&apos;tish uchun maktabingiz yoki Telegram orqali olingan maxsus kodni kiriting
                  </p>

                  <Input
                    placeholder="ORIENTAL-2026-XXXX"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    error={codeError}
                    className="text-center font-mono text-lg tracking-wider"
                    variant="light"
                  />
                </div>

                <Button
                  onClick={handleVerifyCode}
                  loading={loading}
                  variant="primary"
                  className="w-full"
                  size="lg"
                >
                  Tekshirish
                </Button>

                <p className="text-center text-sm text-slate-500">
                  Allaqachon ro&apos;yxatdan o&apos;tganmisiz?{" "}
                  <Link
                    href="/login"
                    className="text-primary-600 hover:text-primary-500 font-semibold transition-colors"
                  >
                    Kirish
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => setStep("code")}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-950 transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" /> Orqaga
                </button>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Ism"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      error={errors.firstName}
                      placeholder="Ism"
                      variant="light"
                    />
                    <Input
                      label="Familiya"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      error={errors.lastName}
                      placeholder="Familiya"
                      variant="light"
                    />
                  </div>

                  <Input
                    label="Telefon raqam"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    error={errors.phone}
                    placeholder="+998901234567"
                    type="tel"
                    variant="light"
                  />

                  <Select
                    label="Viloyat"
                    value={form.regionId}
                    onChange={(e) => setForm({ ...form, regionId: e.target.value, districtId: "" })}
                    error={errors.regionId}
                    placeholder="Viloyatni tanlang"
                    options={REGIONS.map((r) => ({ value: r, label: r }))}
                    variant="light"
                  />

                  <Input
                    label="Maktab raqami/nomi"
                    value={form.schoolName}
                    onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                    error={errors.schoolName}
                    placeholder="Masalan: 15-maktab"
                    variant="light"
                  />

                  {/* Fan tanlash */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Olimpiada fanlari
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {SUBJECTS.map((subject) => {
                        const isSelected = form.subjectIds.includes(subject.slug);
                        const accent = SUBJECT_ACCENT[subject.slug] || "";
                        return (
                          <button
                            key={subject.slug}
                            type="button"
                            onClick={() => handleSubjectToggle(subject.slug)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm text-left transition-all duration-200 ${
                              isSelected
                                ? `${accent} shadow-sm`
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <span className="text-lg">{subject.emoji}</span>
                            <span className="flex-1 font-medium">{subject.name}</span>
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
                      <p className="text-sm text-red-500">{errors.subjectIds}</p>
                    )}
                  </div>

                  {/* Parol */}
                  <div className="relative">
                    <Input
                      label="Parol"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      error={errors.password}
                      placeholder="Kamida 6 belgi"
                      variant="light"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <Input
                    label="Parol tasdig'i"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                    placeholder="Parolni qaytadan kiriting"
                    variant="light"
                  />

                  {/* Rozilik */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/40"
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors">
                      Shaxsiy ma&apos;lumotlarimni qayta ishlashga rozilik beraman
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="text-sm text-red-500">{errors.consent}</p>
                  )}

                  <Button
                    type="submit"
                    loading={loading}
                    variant="primary"
                    className="w-full"
                    size="lg"
                    icon={<UserPlus className="w-5 h-5" />}
                  >
                    Ro&apos;yxatdan o&apos;tish
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

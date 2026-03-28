"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/shared/Logo";
import { SUBJECTS, REGIONS } from "@/lib/constants";
import { ArrowLeft, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type Step = "code" | "form";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("code");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Access code
  const [accessCode, setAccessCode] = useState("");
  const [codeError, setCodeError] = useState("");

  // Form data
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

    // Client-side validation
    const newErrors: Record<string, string> = {};
    if (form.firstName.length < 2) newErrors.firstName = "Kamida 2 harf";
    if (form.lastName.length < 2) newErrors.lastName = "Kamida 2 harf";
    if (!/^\+998\d{9}$/.test(form.phone))
      newErrors.phone = "+998XXXXXXXXX formatda kiriting";
    if (!form.regionId) newErrors.regionId = "Viloyatni tanlang";
    if (!form.schoolName) newErrors.schoolName = "Maktab nomini kiriting";
    if (form.subjectIds.length === 0)
      newErrors.subjectIds = "Kamida bitta fan tanlang";
    if (form.password.length < 6)
      newErrors.password = "Kamida 6 belgi";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Parollar mos kelmaydi";
    if (!form.consent)
      newErrors.consent = "Rozilik berish shart";

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

  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 spotlight" />

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="md" />
          </Link>
          <h1 className="mt-6 font-display text-2xl sm:text-3xl font-bold text-gold-gradient">
            Ro&apos;yxatdan o&apos;tish
          </h1>
        </div>

        {step === "code" ? (
          <Card variant="gold" className="space-y-6">
            <div className="text-center">
              <p className="text-white/70">
                Ro&apos;yxatdan o&apos;tish uchun maxsus kodni kiriting
              </p>
            </div>

            <Input
              label="Access kod"
              placeholder="ORIENTAL-2026-XXXX"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              error={codeError}
              className="text-center font-mono text-lg tracking-wider"
            />

            <Button
              onClick={handleVerifyCode}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Tekshirish"
              )}
            </Button>

            <p className="text-center text-sm text-white/40">
              Allaqachon ro&apos;yxatdan o&apos;tganmisiz?{" "}
              <Link href="/login" className="text-gold-400 hover:text-gold-300">
                Kirish
              </Link>
            </p>
          </Card>
        ) : (
          <Card variant="gold" className="space-y-5">
            <button
              onClick={() => setStep("code")}
              className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Orqaga
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  setForm({ ...form, regionId: e.target.value, districtId: "" })
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
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject.slug}
                      type="button"
                      onClick={() => handleSubjectToggle(subject.slug)}
                      className={`flex items-center gap-2 p-3 rounded-button border text-sm text-left transition-all ${
                        form.subjectIds.includes(subject.slug)
                          ? "border-gold-500/60 bg-gold-500/10 text-gold-400"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                      }`}
                    >
                      <span>{subject.emoji}</span>
                      <span className="flex-1">{subject.name}</span>
                      {form.subjectIds.includes(subject.slug) && (
                        <CheckCircle className="w-4 h-4 text-gold-400" />
                      )}
                    </button>
                  ))}
                </div>
                {errors.subjectIds && (
                  <p className="text-sm text-red-400">{errors.subjectIds}</p>
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
                  className="absolute right-3 top-[38px] text-white/40 hover:text-white/70"
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
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) =>
                    setForm({ ...form, consent: e.target.checked })
                  }
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-green-800 text-gold-500 focus:ring-gold-500/40"
                />
                <span className="text-sm text-white/60">
                  Shaxsiy ma&apos;lumotlarimni qayta ishlashga rozilik beraman
                </span>
              </label>
              {errors.consent && (
                <p className="text-sm text-red-400">{errors.consent}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Ro'yxatdan o'tish"
                )}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

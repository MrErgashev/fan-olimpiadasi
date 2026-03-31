"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Save, RefreshCw, Copy, Eye, EyeOff, KeyRound, Check } from "lucide-react";
import toast from "react-hot-toast";

interface Region {
  id: string;
  name: string;
  districts: { id: string; name: string }[];
}

interface SubjectItem {
  id: string;
  name: string;
  emoji: string;
  slug: string;
}

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  schoolName: string;
  grade: number;
  regionId: string | null;
  districtId: string | null;
  isBlocked: boolean;
  passwordText: string | null;
  subjects: { subject: { id: string; name: string; emoji: string } }[];
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
  student: StudentData | null;
}

export function EditStudentModal({ isOpen, onClose, onDone, student }: EditStudentModalProps) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "+998",
    schoolName: "",
    grade: "11",
    regionId: "",
    districtId: "",
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [maxSubjects, setMaxSubjects] = useState(3);

  // Phone duplicate check
  const [phoneExists, setPhoneExists] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const phoneTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Password reset
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      setForm({
        firstName: student.firstName,
        lastName: student.lastName,
        phone: student.phone,
        schoolName: student.schoolName,
        grade: String(student.grade),
        regionId: student.regionId || "",
        districtId: student.districtId || "",
      });
      setSelectedSubjects(student.subjects.map((s) => s.subject.id));
      setNewPassword(null);
      setErrors({});
      setPhoneExists(false);

      Promise.all([
        fetch("/api/admin/regions").then((r) => r.json()),
        fetch("/api/subjects").then((r) => r.json()),
        fetch("/api/admin/settings").then((r) => r.json()).catch(() => ({ settings: {} })),
      ]).then(([regData, subData, settData]) => {
        setRegions(regData.regions || []);
        setSubjects(subData.subjects || []);
        if (settData.settings?.maxSubjects) {
          setMaxSubjects(parseInt(settData.settings.maxSubjects) || 3);
        }
      });
    }
  }, [isOpen, student]);

  const selectedRegion = regions.find((r) => r.id === form.regionId);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "regionId") next.districtId = "";
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const checkPhoneDuplicate = useCallback((phone: string) => {
    if (phoneTimerRef.current) clearTimeout(phoneTimerRef.current);
    if (!/^\+998\d{9}$/.test(phone) || phone === student?.phone) {
      setPhoneExists(false);
      return;
    }
    phoneTimerRef.current = setTimeout(async () => {
      setCheckingPhone(true);
      try {
        const res = await fetch(`/api/admin/students/check-phone?phone=${encodeURIComponent(phone)}&excludeId=${student?.id}`);
        const data = await res.json();
        setPhoneExists(data.exists);
        if (data.exists) {
          setErrors((prev) => ({ ...prev, phone: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" }));
        }
      } catch { /* ignore */ }
      setCheckingPhone(false);
    }, 500);
  }, [student]);

  const handlePhoneChange = (value: string) => {
    if (!value.startsWith("+998")) value = "+998";
    const digits = value.slice(4).replace(/\D/g, "").slice(0, 9);
    const formatted = "+998" + digits;
    handleChange("phone", formatted);
    checkPhoneDuplicate(formatted);
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) return prev.filter((id) => id !== subjectId);
      if (prev.length >= maxSubjects) {
        toast.error(`Maksimal ${maxSubjects} ta fan tanlash mumkin`);
        return prev;
      }
      return [...prev, subjectId];
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.firstName.trim().length < 2) errs.firstName = "Kamida 2 harf";
    if (form.lastName.trim().length < 2) errs.lastName = "Kamida 2 harf";
    if (!/^\+998\d{9}$/.test(form.phone)) errs.phone = "+998XXXXXXXXX formatda bo'lishi kerak";
    if (phoneExists) errs.phone = "Bu telefon raqam allaqachon ro'yxatdan o'tgan";
    if (!form.schoolName.trim()) errs.schoolName = "Maktab nomini kiriting";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !student) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          schoolName: form.schoolName,
          grade: parseInt(form.grade),
          regionId: form.regionId || null,
          districtId: form.districtId || null,
          subjectIds: selectedSubjects,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Xatolik yuz berdi");
        return;
      }
      toast.success("O'quvchi ma'lumotlari yangilandi");
      onDone();
      onClose();
    } catch {
      toast.error("Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!student) return;
    setResettingPassword(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/reset-password`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Xatolik");
        return;
      }
      setNewPassword(data.password);
      setShowPassword(true);
      toast.success("Parol yangilandi");
    } catch {
      toast.error("Server xatosi");
    } finally {
      setResettingPassword(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Nusxalandi");
    } catch {
      toast.error("Nusxalab bo'lmadi");
    }
  };

  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="O'quvchini tahrirlash" size="md" theme="light">
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Ism"
            variant="light"
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="Familiya"
            variant="light"
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            error={errors.lastName}
          />
        </div>

        <div>
          <Input
            label="Telefon raqam"
            variant="light"
            value={form.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            error={errors.phone}
          />
          {checkingPhone && <p className="text-xs text-slate-400 mt-1">Tekshirilmoqda...</p>}
        </div>

        <Input
          label="Maktab nomi"
          variant="light"
          value={form.schoolName}
          onChange={(e) => handleChange("schoolName", e.target.value)}
          error={errors.schoolName}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Sinf"
            variant="light"
            value={form.grade}
            onChange={(e) => handleChange("grade", e.target.value)}
            options={Array.from({ length: 11 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}-sinf` }))}
          />
          <Select
            label="Viloyat"
            variant="light"
            placeholder="Tanlang..."
            value={form.regionId}
            onChange={(e) => handleChange("regionId", e.target.value)}
            options={regions.map((r) => ({ value: r.id, label: r.name }))}
          />
          <Select
            label="Tuman"
            variant="light"
            placeholder="Tanlang..."
            value={form.districtId}
            onChange={(e) => handleChange("districtId", e.target.value)}
            options={(selectedRegion?.districts || []).map((d) => ({ value: d.id, label: d.name }))}
            disabled={!form.regionId}
          />
        </div>

        {/* Fanlar */}
        {subjects.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Fanlar <span className="text-slate-400">({selectedSubjects.length}/{maxSubjects})</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((sub) => {
                const isSelected = selectedSubjects.includes(sub.id);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleSubject(sub.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      isSelected
                        ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span>{sub.emoji}</span>
                    <span>{sub.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Parol bo'limi */}
        <div className="border-t border-slate-200 pt-3">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <KeyRound className="w-4 h-4 inline mr-1" />
            Parol
          </label>

          {/* Hozirgi parol */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Hozirgi parol:</p>
                <p className="font-mono text-sm font-semibold text-slate-800">
                  {showPassword ? (newPassword || student.passwordText || "—") : "••••••••"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                {(newPassword || student.passwordText) && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(newPassword || student.passwordText || "")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Yangi parol generatsiya */}
          {newPassword && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3">
              <p className="text-xs text-emerald-600">Yangi parol muvaffaqiyatli yaratildi!</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleResetPassword}
            disabled={resettingPassword}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all disabled:opacity-50"
          >
            {resettingPassword ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Yangi parol generatsiya qilish
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Bekor qilish
          </Button>
          <Button variant="blue" onClick={handleSubmit} loading={loading} icon={<Save className="w-4 h-4" />} className="flex-1">
            Saqlash
          </Button>
        </div>
      </div>
    </Modal>
  );
}

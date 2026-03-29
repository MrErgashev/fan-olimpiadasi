"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { generatePassword } from "@/lib/student-utils";
import { UserPlus, RefreshCw, Eye, EyeOff, Copy, CheckCircle2, Plus, X } from "lucide-react";
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

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface CreatedResult {
  name: string;
  phone: string;
  password: string;
}

export function AddStudentModal({ isOpen, onClose, onCreated }: AddStudentModalProps) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "+998",
    password: "",
    schoolName: "",
    grade: "11",
    regionId: "",
    districtId: "",
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [maxSubjects, setMaxSubjects] = useState(3);
  const [phoneExists, setPhoneExists] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const phoneTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Success screen
  const [createdResult, setCreatedResult] = useState<CreatedResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Load regions, subjects, and settings
      Promise.all([
        fetch("/api/admin/regions").then((r) => r.json()),
        fetch("/api/admin/settings").then((r) => r.json()).catch(() => ({ settings: {} })),
      ]).then(([regData, settData]) => {
        setRegions(regData.regions || []);
        if (settData.settings?.maxSubjects) {
          setMaxSubjects(parseInt(settData.settings.maxSubjects) || 3);
        }
      });

      // Load subjects
      fetch("/api/subjects")
        .then((r) => r.json())
        .then((d) => {
          if (d.subjects) setSubjects(d.subjects);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const selectedRegion = regions.find((r) => r.id === form.regionId);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "regionId") next.districtId = "";
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Phone duplicate check with debounce
  const checkPhoneDuplicate = useCallback((phone: string) => {
    if (phoneTimerRef.current) clearTimeout(phoneTimerRef.current);
    if (!/^\+998\d{9}$/.test(phone)) {
      setPhoneExists(false);
      return;
    }
    phoneTimerRef.current = setTimeout(async () => {
      setCheckingPhone(true);
      try {
        const res = await fetch(`/api/admin/students/check-phone?phone=${encodeURIComponent(phone)}`);
        const data = await res.json();
        setPhoneExists(data.exists);
        if (data.exists) {
          setErrors((prev) => ({ ...prev, phone: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" }));
        }
      } catch { /* ignore */ }
      setCheckingPhone(false);
    }, 500);
  }, []);

  const handlePhoneChange = (value: string) => {
    // Ensure starts with +998
    if (!value.startsWith("+998")) value = "+998";
    // Only allow digits after +998
    const digits = value.slice(4).replace(/\D/g, "").slice(0, 9);
    const formatted = "+998" + digits;
    handleChange("phone", formatted);
    checkPhoneDuplicate(formatted);
  };

  const handleAutoPassword = () => {
    const pw = generatePassword();
    setForm((prev) => ({ ...prev, password: pw }));
    setShowPassword(true);
    setErrors((prev) => ({ ...prev, password: "" }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Nusxalandi");
    } catch {
      toast.error("Nusxalab bo'lmadi");
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      }
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
    if (form.password.length < 6) errs.password = "Kamida 6 belgi";
    if (!form.schoolName.trim()) errs.schoolName = "Maktab nomini kiriting";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          grade: parseInt(form.grade),
          regionId: form.regionId || undefined,
          districtId: form.districtId || undefined,
          subjectIds: selectedSubjects,
          returnPassword: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Xatolik yuz berdi");
        return;
      }
      setCreatedResult({
        name: `${form.firstName} ${form.lastName}`,
        phone: form.phone,
        password: form.password,
      });
      onCreated();
    } catch {
      toast.error("Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ firstName: "", lastName: "", phone: "+998", password: "", schoolName: "", grade: "11", regionId: "", districtId: "" });
    setSelectedSubjects([]);
    setErrors({});
    setCreatedResult(null);
    setPhoneExists(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddAnother = () => {
    resetForm();
  };

  // Success screen
  if (createdResult) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Muvaffaqiyatli qo'shildi!" size="md" theme="light">
        <div className="space-y-5">
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">{createdResult.name}</h3>
            <p className="text-sm text-slate-400 mt-1">muvaffaqiyatli ro&apos;yxatdan o&apos;tkazildi</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Telefon</p>
                <p className="font-mono text-sm text-slate-700">{createdResult.phone}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(createdResult.phone)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Parol</p>
                <p className="font-mono text-sm text-slate-700 font-semibold">{createdResult.password}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(createdResult.password)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700">
              Parolni yozib oling! Modal yopilgandan keyin parolni ko&apos;rib bo&apos;lmaydi.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleAddAnother} icon={<Plus className="w-4 h-4" />} className="flex-1">
              Yana qo&apos;shish
            </Button>
            <Button variant="blue" onClick={handleClose} className="flex-1">
              Yopish
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="O'quvchi qo'shish" size="lg" theme="light">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Ism"
            variant="light"
            placeholder="Ism"
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="Familiya"
            variant="light"
            placeholder="Familiya"
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            error={errors.lastName}
          />
        </div>

        <div>
          <Input
            label="Telefon raqam"
            variant="light"
            placeholder="+998901234567"
            value={form.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            error={errors.phone}
          />
          {checkingPhone && <p className="text-xs text-slate-400 mt-1">Tekshirilmoqda...</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Parol</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                variant="light"
                placeholder="Parol"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button variant="outline" onClick={handleAutoPassword} className="shrink-0" title="Avtomatik parol">
              <RefreshCw className="w-4 h-4" />
            </Button>
            {form.password && (
              <Button variant="outline" onClick={() => copyToClipboard(form.password)} className="shrink-0" title="Nusxalash">
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <Input
          label="Maktab nomi"
          variant="light"
          placeholder="Maktab nomi"
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
            options={Array.from({ length: 11 }, (_, i) => ({
              value: String(i + 1),
              label: `${i + 1}-sinf`,
            }))}
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

        {/* Fanlar tanlash */}
        {subjects.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Fanlar <span className="text-slate-400">(maksimal {maxSubjects} ta)</span>
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
                        ? "bg-primary-50 border-primary-300 text-primary-700"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span>{sub.emoji}</span>
                    <span>{sub.name}</span>
                    {isSelected && <X className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
            {selectedSubjects.length > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                {selectedSubjects.length}/{maxSubjects} ta fan tanlandi
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="ghost" onClick={handleClose} className="flex-1">
            Bekor qilish
          </Button>
          <Button variant="blue" onClick={handleSubmit} loading={loading} icon={<UserPlus className="w-4 h-4" />} className="flex-1">
            Qo&apos;shish
          </Button>
        </div>
      </div>
    </Modal>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { generatePassword } from "@/lib/student-utils";
import { UserPlus, RefreshCw, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

interface Region {
  id: string;
  name: string;
  districts: { id: string; name: string }[];
}

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/admin/regions")
        .then((r) => r.json())
        .then((d) => setRegions(d.regions || []))
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

  const handleAutoPassword = () => {
    const pw = generatePassword();
    setForm((prev) => ({ ...prev, password: pw }));
    setShowPassword(true);
    setErrors((prev) => ({ ...prev, password: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.firstName.trim().length < 2) errs.firstName = "Kamida 2 harf";
    if (form.lastName.trim().length < 2) errs.lastName = "Kamida 2 harf";
    if (!/^\+998\d{9}$/.test(form.phone)) errs.phone = "+998XXXXXXXXX formatda bo'lishi kerak";
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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Xatolik yuz berdi");
        return;
      }
      toast.success("O'quvchi muvaffaqiyatli qo'shildi");
      setForm({ firstName: "", lastName: "", phone: "+998", password: "", schoolName: "", grade: "11", regionId: "", districtId: "" });
      setErrors({});
      onCreated();
      onClose();
    } catch {
      toast.error("Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="O'quvchi qo'shish" size="lg" theme="light">
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

        <Input
          label="Telefon raqam"
          variant="light"
          placeholder="+998901234567"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          error={errors.phone}
        />

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
            <Button variant="outline" onClick={handleAutoPassword} className="shrink-0">
              <RefreshCw className="w-4 h-4" />
            </Button>
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

        <div className="flex gap-3 pt-4">
          <Button variant="ghost" onClick={onClose} className="flex-1">
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

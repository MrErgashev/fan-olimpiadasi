"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  User,
  Phone,
  MapPin,
  School,
  Check,
  Save,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { SUBJECTS } from "@/lib/constants";

const SUBJECT_ACCENT: Record<string, string> = {
  matematika: "border-blue-400/50 bg-blue-500/10 text-blue-300",
  informatika: "border-cyan-400/50 bg-cyan-500/10 text-cyan-300",
  tarix: "border-amber-400/50 bg-amber-500/10 text-amber-300",
  "ingliz-tili": "border-red-400/50 bg-red-500/10 text-red-300",
  biologiya: "border-emerald-400/50 bg-emerald-500/10 text-emerald-300",
  "ona-tili": "border-violet-400/50 bg-violet-500/10 text-violet-300",
  "jismoniy-tarbiya": "border-orange-400/50 bg-orange-500/10 text-orange-300",
};

interface StudentProfile {
  firstName: string;
  lastName: string;
  phone: string;
  schoolName: string;
  regionName: string;
  subjects: { id: string; slug: string; name: string; emoji: string }[];
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [maxSubjects, setMaxSubjects] = useState(1);

  useEffect(() => {
    Promise.all([
      fetch("/api/student/profile").then((r) => r.json()),
      fetch("/api/settings/max-subjects").then((r) => r.json()),
    ])
      .then(([profileData, settingsData]) => {
        if (profileData.student) {
          setProfile(profileData.student);
          setSelectedSlugs(profileData.student.subjects.map((s: { slug: string }) => s.slug));
        }
        if (settingsData.maxSubjects !== undefined) {
          setMaxSubjects(settingsData.maxSubjects);
        }
      })
      .catch(() => toast.error("Ma'lumotlarni yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubjectToggle = (slug: string) => {
    setSelectedSlugs((prev) => {
      const alreadySelected = prev.includes(slug);
      if (alreadySelected) {
        if (prev.length <= 1) {
          toast.error("Kamida bitta fan tanlangan bo'lishi kerak");
          return prev;
        }
        return prev.filter((s) => s !== slug);
      }
      // max=1 → radio xatti-harakat
      if (maxSubjects === 1) {
        return [slug];
      }
      // max>1 → limitga tekshirish
      if (maxSubjects > 0 && prev.length >= maxSubjects) {
        toast.error(`Maksimal ${maxSubjects} ta fan tanlash mumkin`);
        return prev;
      }
      return [...prev, slug];
    });
  };

  const handleSave = async () => {
    if (selectedSlugs.length === 0) {
      toast.error("Kamida bitta fan tanlang");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectIds: selectedSlugs }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Fanlar muvaffaqiyatli yangilandi!");
        // Profil holatini yangilash
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                subjects: SUBJECTS.filter((s) => selectedSlugs.includes(s.slug)).map((s) => ({
                  id: s.slug,
                  slug: s.slug,
                  name: s.name,
                  emoji: s.emoji,
                })),
              }
            : prev
        );
      } else {
        toast.error(data.error || "Xatolik yuz berdi");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-white/50 py-20">
        Profil topilmadi
      </div>
    );
  }

  const hasChanges =
    JSON.stringify(selectedSlugs.sort()) !==
    JSON.stringify(profile.subjects.map((s) => s.slug).sort());

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          Mening profilim
        </h1>
        <p className="text-white/50 mt-1">
          Shaxsiy ma&apos;lumotlaringiz va tanlagan fanlaringiz
        </p>
      </div>

      {/* Shaxsiy ma'lumotlar */}
      <Card variant="glass-blue" className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Shaxsiy ma&apos;lumotlar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <User className="w-4 h-4 text-primary-400" />
            <div>
              <p className="text-xs text-white/40">Ism Familiya</p>
              <p className="text-sm text-white font-medium">
                {profile.firstName} {profile.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <Phone className="w-4 h-4 text-primary-400" />
            <div>
              <p className="text-xs text-white/40">Telefon</p>
              <p className="text-sm text-white font-medium">{profile.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <MapPin className="w-4 h-4 text-primary-400" />
            <div>
              <p className="text-xs text-white/40">Viloyat</p>
              <p className="text-sm text-white font-medium">
                {profile.regionName || "Ko'rsatilmagan"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <School className="w-4 h-4 text-primary-400" />
            <div>
              <p className="text-xs text-white/40">Maktab</p>
              <p className="text-sm text-white font-medium">{profile.schoolName}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Fan tanlash */}
      <Card variant="glass-blue" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Olimpiada fanlari
          </h2>
          <Badge variant="info" size="sm">
            {maxSubjects === 0
              ? "Cheksiz"
              : `Maks. ${maxSubjects} ta`}
          </Badge>
        </div>

        {maxSubjects === 1 && (
          <p className="text-sm text-white/40 mb-4">
            Faqat bitta fan tanlash mumkin. Boshqa fanga o&apos;tish uchun yangi fanni bosing.
          </p>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          {SUBJECTS.map((subject) => {
            const isSelected = selectedSlugs.includes(subject.slug);
            const accent = SUBJECT_ACCENT[subject.slug] || "";
            return (
              <button
                key={subject.slug}
                type="button"
                onClick={() => handleSubjectToggle(subject.slug)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm text-left transition-all duration-200 ${
                  isSelected
                    ? `${accent} shadow-sm`
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10"
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

        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Button
              onClick={handleSave}
              loading={saving}
              variant="blue"
              icon={<Save className="w-4 h-4" />}
            >
              O&apos;zgarishlarni saqlash
            </Button>
          </motion.div>
        )}
      </Card>
    </div>
  );
}

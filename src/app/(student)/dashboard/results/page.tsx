"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Trophy,
  CheckCircle,
  XCircle,
  MinusCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Result {
  testName: string;
  subjectName: string;
  subjectEmoji: string;
  totalScore: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalQuestions: number;
  finishedAt: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/student/results");
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch {
      toast.error("Natijalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-gradient">
          Natijalarim
        </h1>
        <p className="mt-2 text-white/50">
          Topshirgan testlaringiz natijalari
        </p>
      </div>

      {results.length === 0 ? (
        <Card variant="glass-blue" className="text-center py-16">
          <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Hali test topshirilmagan</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map((r, i) => (
            <Card key={i} variant="glass-blue">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Fan info */}
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-3xl">{r.subjectEmoji}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {r.subjectName}
                    </h3>
                    <p className="text-sm text-white/40">{r.testName}</p>
                  </div>
                </div>

                {/* Ball */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-mono text-3xl font-bold text-cyan-400">
                      {r.totalScore.toFixed(1)}
                    </p>
                    <p className="text-xs text-white/40">/ 100 ball</p>
                  </div>

                  {/* Statistika */}
                  <div className="flex gap-3">
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {r.correctCount}
                    </Badge>
                    <Badge variant="error">
                      <XCircle className="w-3 h-3 mr-1" />
                      {r.wrongCount}
                    </Badge>
                    <Badge variant="warning">
                      <MinusCircle className="w-3 h-3 mr-1" />
                      {r.unansweredCount}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

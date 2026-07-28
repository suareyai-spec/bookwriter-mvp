"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import GenerateButton from "@/components/GenerateButton";
import { getCreditCost } from "@/lib/credits";

const CREDIT_COST = getCreditCost("university_course");

export default function UniversityCoursePage() {
  const { status: authStatus } = useSession();
  const router = useRouter();

  const [courseTitle, setCourseTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [academicLevel, setAcademicLevel] = useState<"undergraduate" | "graduate" | "professional">("undergraduate");
  const [creditHours, setCreditHours] = useState(3);
  const [weeks, setWeeks] = useState(15);
  const [description, setDescription] = useState("");
  const [audiencePrerequisites, setAudiencePrerequisites] = useState("");
  const [learningObjectives, setLearningObjectives] = useState("");
  const [deliveryFormat, setDeliveryFormat] = useState("Online Asynchronous");
  const [gradingPreference, setGradingPreference] = useState<"quiz-heavy" | "project-heavy" | "balanced">("balanced");
  const [language, setLanguage] = useState("English");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [bookId, setBookId] = useState<string | null>(null);
  const [poll, setPoll] = useState<any>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/auth/login");
  }, [authStatus, router]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  function startPolling(id: string) {
    const tick = async () => {
      try {
        const res = await fetch(`/api/books/${id}/status`);
        if (!res.ok) return;
        const data = await res.json();
        setPoll(data);
        if (data.status === "complete") {
          if (pollRef.current) clearInterval(pollRef.current);
          router.push(`/library/${id}`);
        } else if (data.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          setGenerating(false);
          setError(data.failedReason || "Generation failed. Your credits have been refunded.");
        }
      } catch {}
    };
    tick();
    pollRef.current = setInterval(tick, 4000);
  }

  async function handleSubmit() {
    if (!courseTitle.trim()) { setError("Course title is required"); return; }
    if (!subject.trim()) { setError("Subject / discipline is required"); return; }
    if (!description.trim() || description.trim().length < 10) { setError("Course description must be at least 10 characters"); return; }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/special/university-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle,
          subject,
          academicLevel,
          creditHours,
          weeks,
          description,
          audiencePrerequisites,
          learningObjectives,
          deliveryFormat,
          gradingPreference,
          language,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to start generation");
        setLoading(false);
        return;
      }

      setBookId(data.bookId);
      setGenerating(true);
      setLoading(false);
      startPolling(data.bookId);
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/40 transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  if (generating) {
    const progressStatus = poll?.progressStatus;
    const totalWeeks = weeks;
    const currentWeek = poll?.currentChapter || 0;
    const stages = [
      { key: "syllabus", label: "Syllabus generated" },
      { key: "outlines", label: "Weekly outlines generated" },
      { key: "writing", label: `Weekly content (${Math.min(currentWeek, totalWeeks)} of ${totalWeeks} weeks)` },
      { key: "assessments", label: "Assessment package generated" },
    ];
    const order = ["syllabus", "outlines", "writing", "assessments"];
    const currentIdx = order.indexOf(progressStatus || "syllabus");

    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">
          <Navbar />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
            <div className="text-center mb-10">
              <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Generating your University Course
              </h2>
              <p className="text-gray-400 text-sm">
                This is a full {totalWeeks}-week course — expect ~20-30 minutes. You can safely leave this page; we&apos;ll email you when it&apos;s ready.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
              {stages.map((s, i) => {
                const isDone = i < currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-400"
                          : isCurrent
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "bg-white/[0.05] text-gray-600"
                      }`}
                    >
                      {isDone ? "✓" : isCurrent ? <span className="inline-block animate-pulse">⟳</span> : "○"}
                    </span>
                    <span className={`text-sm ${isDone ? "text-gray-300" : isCurrent ? "text-white font-medium" : "text-gray-600"}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {poll?.totalChapters > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>{poll.percentComplete || 0}% complete</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(2, poll.percentComplete || 0)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Create a University Course
          </h1>
          <p className="text-gray-400 mb-8">
            A full 12-15 week academic course for online asynchronous delivery — syllabus, weekly lectures, discussion prompts, and a complete assessment package. Costs <strong className="text-white">{CREDIT_COST} credits</strong> and takes <strong className="text-white">~20-30 min</strong> to generate.
          </p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className={labelClass}>Course Title</label>
              <input className={inputClass} value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="e.g. Introduction to Behavioral Economics" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Subject / Discipline</label>
                <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Economics, Psychology, Computer Science" />
              </div>
              <div>
                <label className={labelClass}>Academic Level</label>
                <select className={inputClass} value={academicLevel} onChange={(e) => setAcademicLevel(e.target.value as any)}>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="graduate">Graduate</option>
                  <option value="professional">Professional Certificate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Credit Hours</label>
                <select className={inputClass} value={creditHours} onChange={(e) => setCreditHours(Number(e.target.value))}>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Number of Weeks</label>
                <select className={inputClass} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}>
                  <option value={12}>12 weeks</option>
                  <option value={13}>13 weeks</option>
                  <option value={14}>14 weeks</option>
                  <option value={15}>15 weeks</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Course Description</label>
              <textarea className={inputClass} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this course about? What will it cover, and what perspective or approach should it take?" />
            </div>

            <div>
              <label className={labelClass}>Target Audience &amp; Prerequisites</label>
              <textarea className={inputClass} rows={2} value={audiencePrerequisites} onChange={(e) => setAudiencePrerequisites(e.target.value)} placeholder="e.g. Second-year undergraduates; no prior coursework required" />
            </div>

            <div>
              <label className={labelClass}>Learning Objectives (optional)</label>
              <textarea className={inputClass} rows={3} value={learningObjectives} onChange={(e) => setLearningObjectives(e.target.value)} placeholder="List 3-5 objectives, one per line. Leave blank and we'll generate measurable, Bloom's-taxonomy-mapped objectives for you." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Delivery Format</label>
                <input className={inputClass} value={deliveryFormat} onChange={(e) => setDeliveryFormat(e.target.value)} placeholder="Online Asynchronous" />
              </div>
              <div>
                <label className={labelClass}>Grading Preference</label>
                <select className={inputClass} value={gradingPreference} onChange={(e) => setGradingPreference(e.target.value as any)}>
                  <option value="balanced">Balanced</option>
                  <option value="quiz-heavy">Quiz-heavy</option>
                  <option value="project-heavy">Project-heavy</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Language</label>
              <select className={inputClass} value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Italian">Italian</option>
                <option value="Japanese">Japanese</option>
                <option value="Chinese">Chinese (Simplified)</option>
                <option value="Korean">Korean</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>

            <GenerateButton
              cost={CREDIT_COST}
              label="Generate Course"
              onClick={handleSubmit}
              loading={loading}
              disabled={!courseTitle.trim()}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { card, button, input } from "@/lib/ui";
import { SparklesIcon } from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/components/Toast";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

export default function QuizPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { show } = useToast();
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "taking" | "completed">("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  if (!isLoaded) return <div className="p-8 text-center">Loading...</div>;

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <h1 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">Take a Quiz</h1>
        <p className="mb-6 text-[var(--text-secondary)]">Sign in to test your knowledge and join the scoreboard!</p>
        <SignInButton mode="modal">
          <button className={button.primary}>Sign In to Continue</button>
        </SignInButton>
      </div>
    );
  }

  async function handleStart() {
    if (!topic.trim()) return;
    setStatus("generating");
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(-1));
      setStatus("taking");
      setCurrentIndex(0);
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to generate quiz", "error");
      setStatus("idle");
    }
  }

  function handleOptionSelect(optionIndex: number) {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  }

  async function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate score
      let calculatedScore = 0;
      answers.forEach((ans, idx) => {
        if (ans === questions[idx].correctIndex) calculatedScore++;
      });
      setScore(calculatedScore);
      setStatus("completed");

      // Save score — quiz results still display either way, but the
      // scoreboard/my-dashboard entry silently wouldn't exist without this
      // check, so surface a toast if the save itself failed.
      try {
        const res = await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, score: calculatedScore, total: questions.length }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Failed to save score");
      } catch (err) {
        show(err instanceof Error ? err.message : "Failed to save your score", "error");
      }
    }
  }

  async function downloadPDF() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Placement Hub - Quiz Certificate", 20, 30);
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(`Topic: ${topic}`, 20, 50);
    doc.text(`Score: ${score} / ${questions.length}`, 20, 60);

    doc.setFontSize(12);
    doc.text("Questions Summary:", 20, 80);
    
    let y = 90;
    questions.forEach((q, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${i + 1}. ${q.question.substring(0, 80)}${q.question.length > 80 ? '...' : ''}`, 20, y);
      y += 8;
      const userAns = answers[i];
      const isCorrect = userAns === q.correctIndex;
      doc.text(`Your answer: ${userAns >= 0 ? q.options[userAns] : "Skipped"} - ${isCorrect ? "Correct" : "Incorrect"}`, 25, y);
      y += 12;
    });

    doc.save(`Quiz_Results_${topic.replace(/\s+/g, "_")}.pdf`);
  }

  return (
    <div className="mx-auto max-w-3xl flex-col gap-6 py-6">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`p-8 ${card}`}>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Quiz Generator</h1>
            <p className="mb-6 mt-2 text-[var(--text-secondary)]">Test your knowledge on any tech topic. We will dynamically generate a quiz for you.</p>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="e.g. React Hooks, DBMS, TCS Technical Round..." 
                className={`${input} flex-1`} 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button onClick={handleStart} disabled={!topic.trim()} className={button.primary}>
                Generate Quiz
              </button>
            </div>
          </motion.div>
        )}

        {status === "generating" && (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex flex-col items-center justify-center p-12 ${card}`}>
            <SparklesIcon width={32} height={32} className="mb-4 animate-spin text-indigo-500" />
            <h2 className="text-lg font-medium text-[var(--text-primary)]">Generating your quiz...</h2>
            <p className="text-[var(--text-secondary)]">AI is writing 5 questions about &quot;{topic}&quot;</p>
          </motion.div>
        )}

        {status === "taking" && questions.length > 0 && (
          <motion.div key="taking" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-8 ${card}`}>
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Topic: {topic}</span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Question {currentIndex + 1} of {questions.length}</span>
            </div>
            
            <h2 className="mb-8 text-xl font-medium text-[var(--text-primary)]">{questions[currentIndex].question}</h2>
            
            <div className="flex flex-col gap-3">
              {questions[currentIndex].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    answers[currentIndex] === idx 
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" 
                      : "border-[var(--border-default)] hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <span className="text-[var(--text-primary)]">{opt}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleNext} 
                disabled={answers[currentIndex] === -1} 
                className={button.primary}
              >
                {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
              </button>
            </div>
          </motion.div>
        )}

        {status === "completed" && (
          <motion.div key="completed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-8 text-center ${card}`}>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{score}</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">Quiz Completed!</h2>
            <p className="text-[var(--text-secondary)]">You scored {score} out of {questions.length} on {topic}.</p>
            
            <div className="mt-8 flex justify-center gap-4">
              <button onClick={() => setStatus("idle")} className={button.secondary}>Take Another</button>
              <button onClick={downloadPDF} className={button.primary}>Download PDF</button>
              <Link href="/quiz/scoreboard" className={button.secondary}>View Scoreboard</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

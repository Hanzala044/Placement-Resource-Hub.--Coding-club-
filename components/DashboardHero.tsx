"use client";

import Link from "next/link";
import { ArrowRight, FileText, Target, Sparkles, Star, Building2 } from "lucide-react";
import AnimatedGradient from "@/components/ui/animated-gradient";
import { motion } from "framer-motion";

interface DashboardHeroProps {
  experienceCount: number;
  companyCount: number;
  resourceCount: number;
  weeklyDelta: number;
  /** % of decided outcomes (selected vs rejected, pending excluded) that were "selected". null if no decided outcomes yet. */
  selectedRate: number | null;
  topCompanies: { id: string; name: string }[];
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="flex flex-col items-center justify-center">
      <span className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] sm:text-xs">{label}</span>
    </motion.div>
  );
}

/**
 * Light glassmorphism hero for the dashboard, over a soft pastel
 * green/blue animated gradient (not the app's brand indigo/violet — a
 * deliberate one-off look for this band, per the reference image).
 * Every number on the card is real, computed server-side from Supabase
 * (see app/page.tsx), not sample data. Stays this same pastel look
 * regardless of the light/dark/cream toggle — it's a fixed design choice
 * for the hero band, not part of the app's theme system.
 */
export function DashboardHero({
  experienceCount,
  companyCount,
  resourceCount,
  weeklyDelta,
  selectedRate,
  topCompanies,
}: DashboardHeroProps) {
  const marqueeCompanies = topCompanies.length > 0 ? [...topCompanies, ...topCompanies, ...topCompanies] : [];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[var(--surface-muted)] text-[var(--text-primary)]">
      <AnimatedGradient
        config={{
          preset: "custom",
          color1: "var(--surface-card)", // adaptive to theme
          color2: "var(--surface-muted)", // adaptive
          color3: "var(--surface-page)", // adaptive
          rotation: -30,
          proportion: 45,
          scale: 0.45,
          speed: 8,
          distortion: 2,
          swirl: 35,
          swirlIterations: 8,
          softness: 100,
          shape: "Edge",
          shapeSize: 55,
        }}
        noise={{ opacity: 4 }}
      />

      <div className="relative z-10 px-6 py-14 sm:px-10 sm:py-16">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left column */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ staggerChildren: 0.1 }}
            className="flex flex-col justify-center space-y-7 lg:col-span-7"
          >
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-card)]/50 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-[var(--surface-card)]/70">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] sm:text-xs">
                  AITM Coding Club Screening · Track 2
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </span>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-medium leading-[1.05] tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl"
            >
              Placement prep,
              <br />
              <span className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                made searchable
              </span>
              <br />
              instead of scattered
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl text-lg leading-relaxed text-[var(--text-secondary)]"
            >
              Real interview experiences and prep resources from seniors who&rsquo;ve actually sat these
              rounds — searchable by company, role, and topic instead of buried in WhatsApp forwards.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/experiences"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] hover:bg-indigo-500 active:scale-[0.98]"
              >
                Browse experiences
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/submit-experience"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-card)]/50 px-7 py-3.5 text-sm font-semibold text-[var(--text-primary)] backdrop-blur-sm transition-colors hover:bg-[var(--surface-card)]/80"
              >
                <FileText className="h-4 w-4" />
                Share your experience
              </Link>
            </motion.div>
          </motion.div>

          {/* Right column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-5 lg:col-span-5"
          >
            <div className="relative overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--surface-card)]/60 p-7 shadow-xl shadow-indigo-900/5 backdrop-blur-xl">
              <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                    <Target className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{experienceCount}</div>
                    <div className="text-sm text-[var(--text-secondary)]">Experiences shared</div>
                  </div>
                </div>

                {selectedRate !== null ? (
                  <div className="mb-7 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Selected outcome rate</span>
                      <span className="font-medium text-[var(--text-primary)]">{selectedRate}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${selectedRate}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">Among experiences with a decided outcome</p>
                  </div>
                ) : (
                  <p className="mb-7 text-sm text-[var(--text-secondary)]">Outcome stats appear once a few experiences report selected/rejected.</p>
                )}

                <div className="mb-6 h-px w-full bg-[var(--border-default)]" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <StatItem value={String(companyCount)} label="Companies" />
                  <StatItem value={String(resourceCount)} label="Resources" />
                  <StatItem value={`+${weeklyDelta}`} label="This week" />
                </div>

                <div className="mt-7 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-card)]/80 px-3 py-1 text-[10px] font-medium tracking-wide text-[var(--text-primary)]">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                    </span>
                    LIVE DATA
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-card)]/80 px-3 py-1 text-[10px] font-medium tracking-wide text-[var(--text-primary)]">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    AI-POWERED
                  </div>
                </div>
              </div>
            </div>

            {marqueeCompanies.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--surface-card)]/60 py-7 backdrop-blur-xl"
              >
                <h3 className="mb-5 px-7 text-sm font-medium text-[var(--text-secondary)]">Companies in the database</h3>
                <div
                  className="relative flex overflow-hidden"
                  style={{
                    maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                    WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                  }}
                >
                  <div className="animate-marquee flex gap-10 whitespace-nowrap px-4">
                    {marqueeCompanies.map((c, i) => (
                      <div
                        key={`${c.id}-${i}`}
                        className="flex cursor-default items-center gap-2 opacity-60 grayscale transition-all hover:scale-105 hover:opacity-100 hover:grayscale-0"
                      >
                        <Building2 className="h-5 w-5 text-[var(--text-primary)]" />
                        <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-3xl border border-dashed border-[var(--border-default)] bg-[var(--surface-card)]/50 p-7 text-center backdrop-blur-xl"
              >
                <p className="text-sm text-[var(--text-secondary)]">No companies yet — be the first to add one.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, FileText, Target, Sparkles, Star, Building2 } from "lucide-react";
import AnimatedGradient from "@/components/ui/animated-gradient";

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
    <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
      <span className="text-xl font-bold text-white sm:text-2xl">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:text-xs">{label}</span>
    </div>
  );
}

/**
 * Dark glassmorphism hero for the dashboard — every number on this card is
 * real, computed server-side from Supabase (see app/page.tsx), not sample
 * data. Deliberately its own dark band rather than following the rest of
 * the app's light/dark-adaptive theme, the way a product site's hero
 * banner commonly reads darker than the app body below it.
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
    <div className="relative w-full overflow-hidden rounded-3xl bg-zinc-950 text-white">
      <AnimatedGradient
        config={{
          preset: "custom",
          color1: "#050505",
          color2: "#6366f1", // indigo-500 — matches the app's brand accent
          color3: "#a855f7", // purple-500
          rotation: -40,
          proportion: 45,
          scale: 0.5,
          speed: 14,
          distortion: 3,
          swirl: 55,
          swirlIterations: 10,
          softness: 90,
          shape: "Edge",
          shapeSize: 40,
        }}
        noise={{ opacity: 6 }}
      />

      <div className="relative z-10 px-6 py-14 sm:px-10 sm:py-16">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left column */}
          <div className="flex flex-col justify-center space-y-7 lg:col-span-7">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-white/10">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 sm:text-xs">
                  AITM Coding Club Screening · Track 2
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                </span>
              </div>
            </div>

            <h1 className="animate-fade-in text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Placement prep,
              <br />
              <span className="bg-gradient-to-br from-white via-white to-indigo-300 bg-clip-text text-transparent">
                made searchable
              </span>
              <br />
              instead of scattered
            </h1>

            <p className="animate-fade-in max-w-xl text-lg leading-relaxed text-zinc-400">
              Real interview experiences and prep resources from seniors who&rsquo;ve actually sat these
              rounds — searchable by company, role, and topic instead of buried in WhatsApp forwards.
            </p>

            <div className="animate-fade-in flex flex-col gap-4 sm:flex-row">
              <Link
                href="/experiences"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-zinc-950 transition-all hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]"
              >
                Browse experiences
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/submit-experience"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <FileText className="h-4 w-4" />
                Share your experience
              </Link>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5 lg:col-span-5">
            <div className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl">
              <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">{experienceCount}</div>
                    <div className="text-sm text-zinc-400">Experiences shared</div>
                  </div>
                </div>

                {selectedRate !== null ? (
                  <div className="mb-7 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Selected outcome rate</span>
                      <span className="font-medium text-white">{selectedRate}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-white to-zinc-400"
                        style={{ width: `${selectedRate}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500">Among experiences with a decided outcome</p>
                  </div>
                ) : (
                  <p className="mb-7 text-sm text-zinc-500">Outcome stats appear once a few experiences report selected/rejected.</p>
                )}

                <div className="mb-6 h-px w-full bg-white/10" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <StatItem value={String(companyCount)} label="Companies" />
                  <StatItem value={String(resourceCount)} label="Resources" />
                  <StatItem value={`+${weeklyDelta}`} label="This week" />
                </div>

                <div className="mt-7 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    LIVE DATA
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <Sparkles className="h-3 w-3 text-indigo-400" />
                    AI-POWERED
                  </div>
                </div>
              </div>
            </div>

            {marqueeCompanies.length > 0 ? (
              <div className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 py-7 backdrop-blur-xl">
                <h3 className="mb-5 px-7 text-sm font-medium text-zinc-400">Companies in the database</h3>
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
                        className="flex cursor-default items-center gap-2 opacity-50 grayscale transition-all hover:scale-105 hover:opacity-100 hover:grayscale-0"
                      >
                        <Building2 className="h-5 w-5 text-white" />
                        <span className="text-base font-semibold tracking-tight text-white">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in rounded-3xl border border-dashed border-white/10 bg-white/5 p-7 text-center backdrop-blur-xl">
                <p className="text-sm text-zinc-400">No companies yet — be the first to add one.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

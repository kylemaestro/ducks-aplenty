import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { DuckSpecies, FactChoice } from "./api";
import { fetchFactReveal, fetchRandomFactChoices } from "./api";
import { celebrateDuckPick } from "./confettiBurst";
import { FactCitations } from "./FactCitations";
import { MallardLogo } from "./MallardLogo";

type Phase = "idle" | "loading-trio" | "pick" | "loading-reward" | "reward" | "error";

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [choices, setChoices] = useState<FactChoice[]>([]);
  const [rewardFact, setRewardFact] = useState<string | null>(null);
  const [rewardCitations, setRewardCitations] = useState<string[]>([]);
  const [rewardDuck, setRewardDuck] = useState<DuckSpecies | null>(null);
  const [rewardSourceFactId, setRewardSourceFactId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const rewardClueCardRef = useRef<HTMLDivElement | null>(null);
  const celebratedFactIdRef = useRef<number | null>(null);

  const loadTrio = useCallback(async () => {
    setErrorMessage(null);
    setRewardFact(null);
    setRewardCitations([]);
    setRewardDuck(null);
    setRewardSourceFactId(null);
    celebratedFactIdRef.current = null;
    setPhase("loading-trio");
    try {
      const facts = await fetchRandomFactChoices(3);
      setChoices(facts);
      setPhase("pick");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Could not load clues.");
      setPhase("error");
    }
  }, []);

  const onChooseFact = useCallback(async (fact: FactChoice) => {
    setErrorMessage(null);
    setPhase("loading-reward");
    try {
      const { fun_fact, duck: d, citations } = await fetchFactReveal(fact.id);
      setRewardSourceFactId(fact.id);
      setRewardDuck(d);
      setRewardFact(fun_fact);
      setRewardCitations(citations ?? []);
      setPhase("reward");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Could not reveal the duck.");
      setPhase("error");
    }
  }, []);

  // Hello world!~
  const reset = useCallback(() => {
    setChoices([]);
    setRewardFact(null);
    setRewardCitations([]);
    setRewardDuck(null);
    setRewardSourceFactId(null);
    celebratedFactIdRef.current = null;
    setErrorMessage(null);
    setPhase("idle");
  }, []);

  useLayoutEffect(() => {
    if (phase !== "reward" || rewardSourceFactId === null || !rewardFact || !rewardDuck) return;
    if (celebratedFactIdRef.current === rewardSourceFactId) return;
    const el = rewardClueCardRef.current;
    if (!el) return;
    celebratedFactIdRef.current = rewardSourceFactId;
    const r = el.getBoundingClientRect();
    const pad = 10;
    const x = (r.left + r.width / 2) / window.innerWidth;
    const y = (r.bottom + pad) / window.innerHeight;
    celebrateDuckPick({
      origin: {
        x: Math.min(0.96, Math.max(0.04, x)),
        y: Math.min(0.96, Math.max(0.04, y)),
      },
    });
  }, [phase, rewardSourceFactId, rewardFact, rewardDuck]);

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 text-center">
        <MallardLogo />
        <div className="relative mx-auto inline-block">
          {/* matching flower from the logo, perched at the upper-left */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-5 -top-3 sm:-left-8 sm:-top-4"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-9 sm:w-9">
              <g transform="translate(12 12)">
                <circle cx="-4" cy="-2.5" r="3" fill="#fbd5d5" />
                <circle cx="4" cy="-2.5" r="3" fill="#fbd5d5" />
                <circle cx="-4" cy="4" r="3" fill="#fbd5d5" />
                <circle cx="4" cy="4" r="3" fill="#fbd5d5" />
                <circle cx="0" cy="0.7" r="2" fill="#e9c46a" />
              </g>
            </svg>
          </span>

          <h1 className="font-title flex flex-wrap items-end justify-center gap-x-2.5 text-5xl font-extrabold tracking-wide drop-shadow-sm sm:gap-x-3 sm:text-6xl">
            <span className="leading-none text-pond-800">Ducks</span>
            
          </h1>

          {/* sparkle echoing the ones scattered around the mascot */}
          <span
            aria-hidden
            className="pointer-events-none absolute -right-4 -top-1 sm:-right-7 sm:-top-2"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-8 sm:w-8">
              <path
                d="M12 1 L13.5 10.5 L23 12 L13.5 13.5 L12 23 L10.5 13.5 L1 12 L10.5 10.5 Z"
                fill="#e9c46a"
              />
            </svg>
          </span>
        </div>
        <p className="mx-auto mt-5 max-w-xl text-lg font-medium leading-relaxed text-pond-800/85">
          Draw three Jeopardy-style pond clues, pick the one that hooks you, then meet the feathered answer
          behind the trivia.
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center">
        {phase === "idle" && (
          <button
            type="button"
            onClick={loadTrio}
            className="rounded-full bg-pond-600 px-10 py-4 font-cute text-lg font-semibold text-white shadow-cute transition hover:bg-pond-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-200/90 active:translate-y-0.5 active:shadow-cute-sm"
          >
            Deal three clues
          </button>
        )}

        {phase === "loading-trio" && (
          <p className="animate-pulse font-cute text-lg font-semibold text-pond-800">
            Shuffling the clue cards…
          </p>
        )}

        {phase === "pick" && choices.length > 0 && (
          <div className="w-full space-y-6">
            <p className="text-center font-cute text-lg font-semibold text-pond-800">
              Tap the clue you want to solve
            </p>
            <ul className="grid gap-5 sm:grid-cols-1">
              {choices.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => onChooseFact(f)}
                    className="flex min-h-[8rem] w-full flex-col rounded-3xl border-2 border-pond-100 bg-white/95 p-6 text-left shadow-card transition hover:border-bill/50 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-200/70 active:scale-[0.99]"
                  >
                    <p className="flex-1 text-base font-medium leading-relaxed text-slate-700">{f.fact}</p>
                    <span className="mt-5 inline-flex w-fit max-w-full items-center gap-2 rounded-full border-2 border-white/90 bg-gradient-to-r from-pink-100/95 via-bill/25 to-pink-50/90 px-5 py-2 font-cute text-sm font-extrabold tracking-wide text-pond-800 shadow-inner ring-2 ring-bill/25">
                      <span className="select-none text-lg leading-none" aria-hidden>
                        💗
                      </span>
                      <span>Yes! This clue, please</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={loadTrio}
                className="rounded-full border-2 border-pond-200 bg-white/90 px-6 py-2.5 font-cute text-sm font-bold text-pond-700 shadow-sm transition hover:border-pond-300 hover:bg-pond-50 focus:outline-none focus:ring-4 focus:ring-pink-200/60"
              >
                Draw three new clues
              </button>
            </div>
          </div>
        )}

        {phase === "loading-reward" && (
          <p className="animate-pulse font-cute text-lg font-semibold text-pond-800">
            Revealing the duck behind your clue…
          </p>
        )}

        {phase === "reward" && rewardDuck && rewardFact && (
          <div className="w-full max-w-xl rounded-[2rem] border-2 border-pond-100 bg-white/95 p-8 shadow-card sm:p-10">
            <p className="text-center font-cute text-base font-bold tracking-wide text-bill-dark">
              And the duck is…
            </p>
            <h2 className="mt-3 text-center font-cute text-4xl font-bold tracking-wide text-pond-800 sm:text-[2.5rem]">
              {rewardDuck.name}
            </h2>
            <p className="mt-1 text-center text-sm font-semibold italic text-pond-600">
              {rewardDuck.scientific_name}
            </p>
            <div
              ref={rewardClueCardRef}
              className="mt-8 rounded-3xl border border-pink-100/90 bg-gradient-to-br from-pond-50 via-white to-pink-50/40 p-6 shadow-inner"
            >
              <p className="font-cute text-xs font-bold tracking-wide text-pond-600">Your clue</p>
              <p className="mt-3 text-lg font-medium leading-relaxed text-slate-700">{rewardFact}</p>
              <FactCitations citations={rewardCitations} className="mt-5 border-t border-pond-200/60 pt-4" />
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={loadTrio}
                className="rounded-full bg-pond-600 px-8 py-3 font-cute text-base font-bold text-white shadow-cute-sm transition hover:bg-pond-700 focus:outline-none focus:ring-4 focus:ring-pink-200/80 active:translate-y-0.5"
              >
                New clue round
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-full border-2 border-pond-200 bg-white px-8 py-3 font-cute text-base font-bold text-pond-800 shadow-sm transition hover:border-pond-300 hover:bg-pond-50 focus:outline-none focus:ring-4 focus:ring-pink-200/50"
              >
                Start over
              </button>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="max-w-md rounded-[2rem] border-2 border-rose-200 bg-gradient-to-b from-rose-50 to-white p-8 text-center text-rose-900 shadow-card">
            <p className="font-cute text-xl font-bold text-rose-800">Oops — something went wrong</p>
            <p className="mt-3 text-sm font-medium leading-relaxed text-rose-800/90">{errorMessage}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-8 rounded-full bg-rose-500 px-8 py-3 font-cute text-sm font-bold text-white shadow-cute-sm transition hover:bg-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-200"
            >
              Try again
            </button>
          </div>
        )}
      </main>

      <footer className="mt-auto pt-16 text-center font-cute text-xs font-semibold tracking-wide text-pond-500/80">
        API: Python ♡ UI: Vite + React + Tailwind ♡ Facts in SQLite
      </footer>
    </div>
  );
}

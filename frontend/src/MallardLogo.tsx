import { useCallback, useState } from "react";

/** Whimsical mallard-inspired mark for the header — not a field guide plate. */
export function MallardLogo() {
  const [wiggle, setWiggle] = useState(false);

  const handleClick = useCallback(() => {
    if (wiggle) return;
    setWiggle(true);
  }, [wiggle]);

  const handleAnimationEnd = useCallback(() => {
    setWiggle(false);
  }, []);

  return (
    <div className="mx-auto mb-3 flex justify-center">
      <button
        type="button"
        onClick={handleClick}
        aria-label="Wiggle the mallard logo"
        className="inline-flex min-h-[6.5rem] min-w-[11rem] cursor-pointer items-center justify-center rounded-full border-2 border-pond-100/80 bg-white/40 px-5 py-3 shadow-cute-sm transition hover:border-bill/40 hover:bg-white/70 hover:shadow-cute focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-200/80 active:scale-[0.97]"
      >
        <span
          className={wiggle ? "inline-block origin-bottom animate-mallard-wiggle" : "inline-block origin-bottom"}
          onAnimationEnd={handleAnimationEnd}
        >
          <svg
            viewBox="0 0 100 92"
            className="h-[8.375rem] w-auto drop-shadow-sm sm:h-30"
            aria-hidden
          >
            {/* soft water ripple */}
            <ellipse cx="50" cy="88" rx="36" ry="3" fill="#9fd4c9" opacity="0.55" />
            <ellipse cx="50" cy="85.5" rx="22" ry="1.6" fill="#c5e8df" opacity="0.7" />

            {/* chibi body */}
            <ellipse cx="50" cy="70" rx="26" ry="18" fill="#f4e8c8" />
            {/* belly highlight */}
            <ellipse cx="50" cy="73" rx="17" ry="10" fill="#fbf3df" />

            {/* tucked-in wings */}
            <ellipse cx="26" cy="71" rx="6.5" ry="11" fill="#c4b079" transform="rotate(-12 26 71)" />
            <ellipse cx="74" cy="71" rx="6.5" ry="11" fill="#c4b079" transform="rotate(12 74 71)" />

            {/* big round head */}
            <circle cx="50" cy="34" r="28" fill="#1b8a6b" />
            {/* subtle head highlight */}
            <ellipse cx="42" cy="20" rx="9" ry="5" fill="#3aa589" opacity="0.55" />

            {/* signature drake curl as a little topknot */}
            <path d="M48 7 Q52 2 56 6 Q53 11 48 7 Z" fill="#145a46" />

            {/* iconic mallard white collar */}
            <ellipse cx="50" cy="60" rx="26" ry="4" fill="#f6f1e3" />

            {/* tiny flower tucked on the side of the head */}
            <g transform="translate(72 22)">
              <circle cx="-2.6" cy="-1.6" r="1.9" fill="#fbd5d5" />
              <circle cx="2.6" cy="-1.6" r="1.9" fill="#fbd5d5" />
              <circle cx="-2.6" cy="2.6" r="1.9" fill="#fbd5d5" />
              <circle cx="2.6" cy="2.6" r="1.9" fill="#fbd5d5" />
              <circle cx="0" cy="0.5" r="1.3" fill="#e9c46a" />
            </g>

            {/* big chibi dot eyes with twin sparkles */}
            <ellipse cx="39" cy="36" rx="4.5" ry="5" fill="#0f172a" />
            <ellipse cx="61" cy="36" rx="4.5" ry="5" fill="#0f172a" />
            <circle cx="40.5" cy="34" r="1.6" fill="#fff" />
            <circle cx="62.5" cy="34" r="1.6" fill="#fff" />
            <circle cx="38" cy="38.5" r="0.7" fill="#fff" opacity="0.7" />
            <circle cx="60" cy="38.5" r="0.7" fill="#fff" opacity="0.7" />

            {/* rosy cheek blush */}
            <ellipse cx="30" cy="46" rx="4" ry="2.5" fill="#f7b1b1" opacity="0.7" />
            <ellipse cx="70" cy="46" rx="4" ry="2.5" fill="#f7b1b1" opacity="0.7" />

            {/* dainty bill */}
            <ellipse cx="50" cy="48" rx="6.5" ry="3.8" fill="#f4a261" />
            <path d="M43.5 50 Q50 53.5 56.5 50 Q55 54 50 55 Q45 54 43.5 50 Z" fill="#e76f51" opacity="0.75" />
            <ellipse cx="50" cy="46.8" rx="3" ry="0.7" fill="#fff" opacity="0.45" />

            {/* sprinkled pastel sparkles */}
            <circle cx="12" cy="24" r="1.6" fill="#e9c46a" opacity="0.9" />
            <circle cx="88" cy="52" r="1.4" fill="#2a9d8f" opacity="0.85" />
            <circle cx="14" cy="56" r="1.1" fill="#f7b1b1" opacity="0.85" />
            <circle cx="84" cy="14" r="1.2" fill="#e9c46a" opacity="0.85" />
          </svg>
        </span>
      </button>
    </div>
  );
}

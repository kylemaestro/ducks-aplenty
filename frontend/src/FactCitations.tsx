type Props = {
  citations: string[];
  className?: string;
};

function hostLabel(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function FactCitations({ citations, className = "" }: Props) {
  if (!citations.length) return null;
  return (
    <div className={`text-xs font-medium text-slate-600 ${className}`.trim()}>
      <p className="inline-block rounded-full bg-pond-100/80 px-3 py-1 font-cute text-[0.7rem] font-bold tracking-wide text-pond-700">
        Sources
      </p>
      <ul className="mt-3 space-y-2 pl-1">
        {citations.map((href) => (
          <li key={href} className="flex items-start gap-2 break-all">
            <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-bill" aria-hidden />
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md text-pond-700 underline decoration-pink-200 decoration-2 underline-offset-[3px] transition hover:text-bill-dark hover:decoration-bill/60"
            >
              {hostLabel(href)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";

/* =========================
   SPONSOR BANNER
========================= */

export default function SponsorBanner({
  sponsors = [],
  matchday = null,
  config = { rotation: "static", interval: 6000 }
}) {
  const activeSponsors = useMemo(() => {
    return sponsors.filter(s =>
      s.active &&
      (s.matchday === null || s.matchday === matchday)
    );
  }, [sponsors, matchday]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (config.rotation !== "rotate" || activeSponsors.length <= 1) return;
    const t = setInterval(() => {
      setIndex(i => (i + 1) % activeSponsors.length);
    }, config.interval || 6000);
    return () => clearInterval(t);
  }, [activeSponsors.length, config]);

  if (!activeSponsors.length) return null;

  const sponsor = activeSponsors[index];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-6 py-4 flex items-center justify-between shadow-lg animate-in fade-in">
      <div className="flex items-center gap-4">
        {sponsor.logoUrl && (
          <img
            src={sponsor.logoUrl}
            alt={sponsor.name}
            className="h-10 object-contain"
          />
        )}
        <div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            Sponsored by
          </div>
          <div className="font-black uppercase italic text-slate-200">
            {sponsor.name}
          </div>
        </div>
      </div>

      {sponsor.link && (
        <a
          href={sponsor.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]"
        >
          Visit
        </a>
      )}
    </div>
  );
}

"use client";

/** Sfondo atmosferico: alba quieta, senza clutter. */
export function Atmosphere() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-atmosphere" />
      <div className="atmosphere-orb atmosphere-orb-a animate-drift" />
      <div className="atmosphere-orb atmosphere-orb-b animate-drift-slow" />
      <div className="absolute inset-x-0 top-0 h-[42vh] bg-hero-wash" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}

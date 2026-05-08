export default function Login() {
  return (
    <div className="fixed inset-0 bg-[#060404]">
      {/* Full-bleed hero image */}
      <img
        src="/athena-hero.png"
        alt="Athena"
        className="absolute inset-0 w-full h-full object-cover object-top"
        draggable={false}
      />

      {/* Subtle gradient at top and bottom so text reads cleanly */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

      {/* Title at the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-16"
        style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
      >
        <h1 className="font-cinzel text-5xl text-ivory tracking-[0.3em] drop-shadow-lg">
          ATHENA
        </h1>
        <p className="font-garamond text-ivory/70 tracking-widest text-sm mt-2">
          Your strength. Your cycle. Your story.
        </p>
      </div>
    </div>
  )
}

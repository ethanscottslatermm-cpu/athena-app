import heroImg from '../assets/athena-hero.png'

export default function Login() {
  return (
    <div className="fixed inset-0 bg-[#060404]">
      {/* Full-bleed hero image */}
      <img
        src={heroImg}
        alt="Athena"
        className="absolute inset-0 w-full h-full object-cover object-top"
        draggable={false}
      />

      {/* Gradient overlay — fades top and bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

      {/* Title pinned to bottom above home bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center"
        style={{ paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
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

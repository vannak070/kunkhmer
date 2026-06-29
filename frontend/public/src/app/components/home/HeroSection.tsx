import { Sparkles, ArrowRight, Calendar } from "lucide-react";

interface HeroSectionProps {
  onExploreFighters: () => void;
  onViewEvents: () => void;
}

export default function HeroSection({ onExploreFighters, onViewEvents }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      {/* Vibrant gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A3D91] via-[#1565C0] to-[#0A3D91]" />

      {/* Animated glow effects */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#F2C94C] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Compact badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F2C94C]/20 backdrop-blur-sm rounded-full mb-5 border border-[#F2C94C]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#F2C94C]" />
            <span className="text-xs font-bold text-[#F2C94C]">OFFICIAL PLATFORM</span>
          </div>

          {/* Bold heading with gradient */}
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-none">
            <span className="bg-gradient-to-r from-white via-white to-[#F2C94C] bg-clip-text text-transparent">
              KUNKHMER
            </span>
          </h1>

          {/* Concise tagline */}
          <p className="text-base md:text-lg text-white/95 mb-6 font-medium max-w-xl mx-auto">
            The Official Digital Gateway to KUNKHMER Martial Arts—driving growth, recognition, and global access.
          </p>

          {/* Compact CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onExploreFighters}
              className="group px-6 py-3 bg-[#F2C94C] text-[#0A3D91] rounded-xl font-bold hover:bg-[#FFD700] hover:shadow-lg hover:scale-105 transition-all"
            >
              <span className="flex items-center gap-2">
                Explore Fighters
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={onViewEvents}
              className="px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-xl font-bold border border-white/40 hover:bg-white/25 transition-all"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                View Events
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

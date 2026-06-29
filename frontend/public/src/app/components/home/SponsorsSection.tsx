import { useState } from "react";
import { ArrowLeft, ArrowRight, Handshake, Building2 } from "lucide-react";

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  image?: string;
  industry: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  eventsSponsored: number;
}

interface SponsorsSectionProps {
  sponsors: Sponsor[];
  onViewAllClick: () => void;
}

export default function SponsorsSection({ sponsors, onViewAllClick }: SponsorsSectionProps) {
  const [sponsorSlideIndex, setSponsorSlideIndex] = useState(0);

  return (
    <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl p-6 md:p-8 border-2 border-gray-200 shadow-xl overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#F2C94C]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#0A3D91]/5 to-transparent rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0A3D91]/10 to-[#1565C0]/10 rounded-full mb-4 border border-[#0A3D91]/20">
          <Handshake className="w-4 h-4 text-[#0A3D91]" />
          <span className="text-sm font-black text-[#0A3D91] uppercase tracking-wider">Our Partners</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 bg-gradient-to-r from-gray-900 via-[#0A3D91] to-gray-900 bg-clip-text text-transparent">
          Trusted by Industry Leaders
        </h2>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto font-medium">
          Partnering with Cambodia's most prestigious brands to elevate Kun Khmer globally
        </p>
      </div>

      {/* Sponsors Slider */}
      <div className="relative max-w-6xl mx-auto">
        {/* Navigation Arrows */}
        <button
          onClick={() => setSponsorSlideIndex((prev) => (prev - 1 + Math.ceil(sponsors.length / 3)) % Math.ceil(sponsors.length / 3))}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gradient-to-br from-[#0A3D91] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0A3D91] rounded-full flex items-center justify-center transition-all shadow-xl hover:shadow-2xl hover:scale-110 -ml-6 border-2 border-white"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => setSponsorSlideIndex((prev) => (prev + 1) % Math.ceil(sponsors.length / 3))}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gradient-to-br from-[#0A3D91] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0A3D91] rounded-full flex items-center justify-center transition-all shadow-xl hover:shadow-2xl hover:scale-110 -mr-6 border-2 border-white"
        >
          <ArrowRight className="w-5 h-5 text-white" />
        </button>

        {/* Slider Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${sponsorSlideIndex * 100}%)` }}
          >
            {Array.from({ length: Math.ceil(sponsors.length / 3) }).map((_, slideIdx) => (
              <div key={slideIdx} className="min-w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                  {sponsors.slice(slideIdx * 3, slideIdx * 3 + 3).map((sponsor) => (
                    <div
                      key={sponsor.id}
                      className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:border-[#0A3D91] cursor-pointer hover:-translate-y-2"
                    >
                      {/* Image Container with Overlay */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={sponsor.image}
                          alt={sponsor.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      {/* Content Section */}
                      <div className="p-4 bg-gradient-to-br from-white to-gray-50">
                        {/* Sponsor Name */}
                        <h3 className="text-lg font-black text-gray-900 text-center mb-2 line-clamp-1 group-hover:text-[#0A3D91] transition-colors">
                          {sponsor.name}
                        </h3>

                        {/* Industry Tag */}
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="font-semibold">{sponsor.industry}</span>
                        </div>
                      </div>

                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: Math.ceil(sponsors.length / 3) }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSponsorSlideIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === sponsorSlideIndex
                ? 'w-12 bg-gradient-to-r from-[#0A3D91] to-[#1565C0] shadow-lg'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* View All Partners Link */}
      <div className="relative text-center mt-6">
        <button
          onClick={onViewAllClick}
          className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white rounded-xl font-black text-sm uppercase tracking-wider hover:shadow-2xl hover:shadow-[#0A3D91]/50 transition-all hover:scale-105 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Handshake className="w-4 h-4" />
            View All Partners
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1565C0] to-[#0A3D91] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    </div>
  );
}

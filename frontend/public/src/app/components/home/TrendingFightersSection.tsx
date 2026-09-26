import { Flame, ChevronRight, TrendingUp, Crown, Check, User, Weight, ArrowRight } from "lucide-react";

interface Fighter {
  id: string;
  name: string;
  image: string;
  age: number;
  weight: string;
  wins: number;
  losses: number;
  draws: number;
  championships: number;
  verified: boolean;
}

interface TrendingFightersSectionProps {
  fighters: Fighter[];
  onViewAllClick: () => void;
  onFighterClick: (fighterId: string) => void;
}

export default function TrendingFightersSection({ fighters, onViewAllClick, onFighterClick }: TrendingFightersSectionProps) {
  return (
    <div className="relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-lg overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#C8102E]/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#F2C94C]/5 to-transparent rounded-full blur-3xl" />

      <div className="relative flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#C8102E]/10 to-red-700/10 rounded-full border border-[#C8102E]/20">
              <Flame className="w-4 h-4 text-[#C8102E]" />
              <span className="text-xs font-black text-[#C8102E] uppercase tracking-wider">Trending Now</span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Top Fighters This Month
          </h2>
          <p className="text-gray-600 font-medium">Cambodia's most popular warriors right now</p>
        </div>
        <button
          onClick={onViewAllClick}
          className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl font-black text-sm text-gray-700 transition-all border border-gray-300 hover:shadow-lg"
        >
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fighters.slice(0, 3).map((fighter, index) => (
          <div
            key={fighter.id}
            onClick={() => onFighterClick(fighter.id)}
            className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-500 border-2 border-gray-200 hover:border-[#C8102E] cursor-pointer hover:-translate-y-2"
          >

            {/* Fighter Image */}
            <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
              <img
                src={fighter.image}
                alt={fighter.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Verified Badge - Bottom */}
              {fighter.verified && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 bg-[#0A3D91]/90 backdrop-blur-sm text-white rounded-lg shadow-lg border border-white/30">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Verified Fighter</span>
                </div>
              )}
            </div>

            {/* Fighter Info */}
            <div className="relative p-5 bg-gradient-to-br from-white to-gray-50">
              {/* Name */}
              <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-[#C8102E] transition-colors">
                {fighter.name}
              </h3>

              {/* Details */}
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-semibold">{fighter.age != null ? `${fighter.age} yrs` : "—"}</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5" />
                  <span className="font-semibold">{fighter.weight} kg</span>
                </div>
              </div>

              {/* Fight Record */}
              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-black text-green-600">{fighter.wins}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Wins</p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <p className="text-2xl font-black text-red-600">{fighter.losses}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Losses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-600">{fighter.draws}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Draws</p>
                </div>
              </div>

              {/* View Profile Button */}
              <button className="relative w-full px-4 py-3 bg-gradient-to-r from-[#C8102E] to-red-700 text-white rounded-xl font-black text-sm uppercase tracking-wider hover:shadow-xl hover:shadow-[#C8102E]/30 transition-all group/btn overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  View Profile
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-[#C8102E] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Mobile View All Button */}
      <div className="md:hidden mt-6 text-center">
        <button
          onClick={onViewAllClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl font-black text-sm text-gray-700 transition-all border border-gray-300 hover:shadow-lg"
        >
          View All Fighters <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

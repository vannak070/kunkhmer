import { ArrowLeft, MapPin, Star, Users, Check, User, Weight } from "lucide-react";

interface Club {
  id: string;
  name: string;
  location: string;
  image: string;
  headCoach: string;
  activeFighters: number;
  rating: number;
  status: string;
}

interface Fighter {
  id: string;
  name: string;
  image: string;
  age: number;
  weight: string;
  wins: number;
  losses: number;
  draws: number;
  verified: boolean;
}

interface ClubDetailPageProps {
  club: Club;
  fighters: Fighter[];
  onBack: () => void;
  onFighterClick: (fighterId: string) => void;
}

export default function ClubDetailPage({ club, fighters, onBack, onFighterClick }: ClubDetailPageProps) {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clubs
      </button>

      {/* Club Header */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl">
        <div className="relative h-80">
          <img
            src={club.image}
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-6 left-6">
            <span className={`px-4 py-2 rounded-xl text-sm font-black uppercase backdrop-blur-xl border-2 shadow-xl ${
              club.status === 'active'
                ? 'bg-green-500/90 text-white border-white/30'
                : 'bg-gray-500/90 text-white border-white/30'
            }`}>
              {club.status}
            </span>
          </div>

          {/* Club Info */}
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">{club.name}</h1>
            <div className="flex items-center gap-2 text-white/90 text-lg">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">{club.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Club Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl p-6 border-2 border-yellow-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F2C94C] to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">{club.rating}</div>
              <div className="text-sm text-gray-600 font-bold uppercase tracking-wider">Rating</div>
            </div>
          </div>
        </div>

        {/* Head Coach */}
        <div className="bg-gradient-to-br from-[#0A3D91]/5 to-blue-50 rounded-2xl p-6 border-2 border-[#0A3D91]/20">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Head Coach</p>
            <p className="text-2xl font-black text-gray-900">{club.headCoach}</p>
          </div>
        </div>

        {/* Active Fighters */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#0A3D91] rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">{club.activeFighters}</div>
              <div className="text-sm text-gray-600 font-bold uppercase tracking-wider">Fighters</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fighters Section */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-gray-200">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Club Fighters</h2>
          <p className="text-gray-600">Athletes training at {club.name}</p>
        </div>

        {fighters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fighters.map((fighter) => (
              <div
                key={fighter.id}
                onClick={() => onFighterClick(fighter.id)}
                className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-500 border-2 border-gray-200 hover:border-[#C8102E] cursor-pointer"
              >
                {/* Fighter Image */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                  <img
                    src={fighter.image}
                    alt={fighter.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {fighter.verified && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 bg-[#0A3D91]/90 backdrop-blur-sm text-white rounded-lg shadow-lg border border-white/30">
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-black uppercase">Verified</span>
                    </div>
                  )}
                </div>

                {/* Fighter Info */}
                <div className="p-4 bg-gradient-to-br from-white to-gray-50">
                  <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-[#C8102E] transition-colors">
                    {fighter.name}
                  </h3>

                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span className="font-semibold">{fighter.age} yrs</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1.5">
                      <Weight className="w-3.5 h-3.5" />
                      <span className="font-semibold">{fighter.weight}</span>
                    </div>
                  </div>

                  {/* Fight Record */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="text-center">
                      <p className="text-xl font-black text-green-600">{fighter.wins}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Wins</p>
                    </div>
                    <div className="text-center border-x border-gray-200">
                      <p className="text-xl font-black text-red-600">{fighter.losses}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Losses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-gray-600">{fighter.draws}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Draws</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No fighters registered at this club yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

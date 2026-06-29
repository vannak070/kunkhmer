import { Calendar, MapPin, Trophy, Building2, Tv, Users, Eye, ChevronRight, Clock } from "lucide-react";
import eventPosterImage from 'figma:asset/76de12a848bf50a1769fa454bf2dab5cb85ea354.png';

interface MatchBatchCardProps {
  batch: any;
  events: any[];
  isExpanded: boolean;
  onToggleExpansion: (batchId: string) => void;
  onViewMatch: (matchId: string) => void;
  onViewDetails: (matchId: string) => void;
  variant?: 'upcoming' | 'previous';
}

export function MatchBatchCard({
  batch,
  events,
  isExpanded,
  onToggleExpansion,
  onViewMatch,
  onViewDetails,
  variant = 'upcoming'
}: MatchBatchCardProps) {
  const mainMatch = batch.matches.find((m: any) => m.matchOrder === 1) || batch.matches[0];
  const otherMatches = batch.matches.filter((m: any) => m.id !== mainMatch.id);
  const batchEvent = events.find(e => e.id === batch.eventId);
  const displayImage = batchEvent?.image || eventPosterImage;

  const headerBgClass = variant === 'previous'
    ? 'bg-gradient-to-r from-gray-700 to-gray-800'
    : 'bg-gradient-to-r from-[#0A3D91] to-blue-700';

  const buttonClass = variant === 'previous'
    ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900'
    : 'bg-gradient-to-r from-[#0A3D91] to-blue-700 hover:from-blue-800 hover:to-blue-900';

  const statusBadge = variant === 'previous'
    ? 'bg-gray-900 text-white border border-white/20'
    : batch.status === 'Approved' ? 'bg-green-500 text-white' :
      batch.status === 'Scheduled' ? 'bg-blue-500 text-white' :
      batch.status === 'Completed' ? 'bg-gray-700 text-white' :
      'bg-gray-500 text-white';

  return (
    <div className="space-y-4">
      {/* Main Event Card */}
      <div className="group relative bg-gradient-to-br from-white to-gray-50/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-[#0A3D91]/30">
        {/* Event Header */}
        <div className={`${headerBgClass} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <span className="text-sm font-black text-white tracking-wide">{batch.batchNumber}</span>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white mb-1">{batch.eventName}</h3>
                <div className="flex items-center gap-3 text-sm text-white/90">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-semibold">{new Date(batch.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <span className="text-white/50">•</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-semibold">{batch.location}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase ${statusBadge}`}>
                {variant === 'previous' ? 'Completed' : batch.status}
              </span>
            </div>
          </div>
        </div>

        {/* Event Content */}
        <div className="p-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={`bg-gradient-to-br ${variant === 'previous' ? 'from-gray-50 to-gray-100/50 border-gray-200/50' : 'from-blue-50 to-blue-100/50 border-blue-200/50'} rounded-xl p-4 border`}>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className={`w-4 h-4 ${variant === 'previous' ? 'text-gray-700' : 'text-[#0A3D91]'}`} />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Total Bouts</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{batch.totalMatches}</p>
            </div>
            {batch.organizerClub && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Organizer</span>
                </div>
                <p className="text-sm font-black text-gray-900 truncate">{batch.organizerClub}</p>
              </div>
            )}
            {batch.broadcastStation && (
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 border border-red-200/50">
                <div className="flex items-center gap-2 mb-1">
                  <Tv className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Broadcast</span>
                </div>
                <p className="text-sm font-black text-gray-900 truncate">{batch.broadcastStation}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span className="font-bold">{batch.totalMatches} matches in this event</span>
            </div>
            <div className="flex items-center gap-3">
              {otherMatches.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpansion(batch.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all"
                >
                  <span>{isExpanded ? 'Hide' : 'View All'} Matches ({batch.totalMatches})</span>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(mainMatch.id);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 ${buttonClass} text-white rounded-xl transition-all font-bold text-sm shadow-md hover:shadow-lg`}
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Other Matches - Collapsible */}
      {isExpanded && otherMatches.length > 0 && (
        <div className="ml-0 md:ml-4 space-y-3">
          {otherMatches.map((match: any) => {
            const fighterAImage = typeof match.fighterA.image === 'string' ? match.fighterA.image : "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400";
            const fighterBImage = typeof match.fighterB.image === 'string' ? match.fighterB.image : "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400";

            return (
              <div
                key={match.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewMatch(match.id);
                }}
                className={`group relative bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border cursor-pointer ${
                  variant === 'previous' ? 'border-gray-200 hover:border-gray-400' : 'border-gray-200 hover:border-[#0A3D91]/50'
                }`}
              >
                {/* Match Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`px-2.5 py-1 text-white text-xs font-black rounded-lg ${variant === 'previous' ? 'bg-gray-700' : 'bg-[#0A3D91]'}`}>
                        BOUT #{match.matchOrder}
                      </div>
                      <span className="text-sm font-black text-gray-900">{match.matchType}</span>
                      <span className="px-2.5 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg">{match.weightClass}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                      variant === 'previous' ? 'bg-gray-600 text-white' :
                      match.status === 'Completed' ? 'bg-gray-600 text-white' :
                      match.status === 'Ready' ? 'bg-green-500 text-white' :
                      match.status === 'In Progress' ? 'bg-red-500 text-white animate-pulse' :
                      'bg-blue-500 text-white'
                    }`}>
                      {variant === 'previous' ? 'Completed' : match.status}
                    </span>
                  </div>
                </div>

                {/* Match Content */}
                <div className="p-5">
                  {/* Fighters Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Fighter A */}
                    <div className={`relative rounded-xl p-4 transition-all ${
                      (variant === 'previous' || batch.status === 'Completed') && match.winner === match.fighterA.name
                        ? 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-2 border-yellow-400'
                        : 'bg-gray-50 border-2 border-gray-100'
                    }`}>
                      {(variant === 'previous' || batch.status === 'Completed') && match.winner === match.fighterA.name && (
                        <div className="absolute -top-2 -right-2 px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center gap-1 shadow-lg">
                          <Trophy className="w-3 h-3 text-white" />
                          <span className="text-xs font-black text-white uppercase">Winner</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden flex-shrink-0">
                          <img src={fighterAImage} alt={match.fighterA.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-base font-black mb-0.5 truncate ${
                            (variant === 'previous' || batch.status === 'Completed') && match.winner === match.fighterA.name
                              ? 'text-yellow-900' : 'text-gray-900'
                          }`}>{match.fighterA.name}</h4>
                          <p className="text-xs text-gray-600 truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {match.fighterA.clubName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-white text-gray-900 text-xs font-bold rounded-lg border border-gray-200">
                          {match.fighterA.record}
                        </span>
                        <span className="px-2.5 py-1 bg-blue-50 text-[#0A3D91] text-xs font-bold rounded-lg">
                          {match.fighterA.weight}kg
                        </span>
                      </div>
                    </div>

                    {/* Fighter B */}
                    <div className={`relative rounded-xl p-4 transition-all ${
                      (variant === 'previous' || batch.status === 'Completed') && match.winner === match.fighterB.name
                        ? 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-2 border-yellow-400'
                        : 'bg-gray-50 border-2 border-gray-100'
                    }`}>
                      {(variant === 'previous' || batch.status === 'Completed') && match.winner === match.fighterB.name && (
                        <div className="absolute -top-2 -right-2 px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center gap-1 shadow-lg">
                          <Trophy className="w-3 h-3 text-white" />
                          <span className="text-xs font-black text-white uppercase">Winner</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden flex-shrink-0">
                          <img src={fighterBImage} alt={match.fighterB.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-base font-black mb-0.5 truncate ${
                            (variant === 'previous' || batch.status === 'Completed') && match.winner === match.fighterB.name
                              ? 'text-yellow-900' : 'text-gray-900'
                          }`}>{match.fighterB.name}</h4>
                          <p className="text-xs text-gray-600 truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {match.fighterB.clubName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-white text-gray-900 text-xs font-bold rounded-lg border border-gray-200">
                          {match.fighterB.record}
                        </span>
                        <span className="px-2.5 py-1 bg-blue-50 text-[#0A3D91] text-xs font-bold rounded-lg">
                          {match.fighterB.weight}kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Match Info Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-xs font-bold text-gray-900">{match.rounds} Rounds</span>
                      </div>
                      {match.agreedWeight && (
                        <span className="text-xs text-gray-600 font-semibold">Catchweight: {match.agreedWeight}kg</span>
                      )}
                    </div>
                    {(variant === 'previous' || batch.status === 'Completed') && match.winner && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-md">
                        <Trophy className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs font-black text-white">{match.winnerMethod} • R{match.winnerRound}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

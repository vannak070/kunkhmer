import { 
  AWARD_CATEGORY_CONFIG, 
  AWARD_TYPE_CONFIG, 
  AWARD_LEVEL_CONFIG,
  type Award,
  formatPrizeMoney 
} from "../data/awards";
import { Trophy, Medal, Award as AwardIcon, DollarSign, MapPin, Calendar, Crown } from "lucide-react";

interface AwardCardProps {
  award: Award;
  compact?: boolean;
  showWinner?: boolean;
}

export function AwardCard({ award, compact = false, showWinner = true }: AwardCardProps) {
  const categoryConfig = AWARD_CATEGORY_CONFIG[award.category];
  const typeConfig = AWARD_TYPE_CONFIG[award.type];
  const levelConfig = award.level ? AWARD_LEVEL_CONFIG[award.level] : null;
  
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${categoryConfig.bgColor} ${categoryConfig.borderColor} border-2 rounded-lg px-3 py-1.5`}>
        <span className="text-lg">{typeConfig.icon}</span>
        {levelConfig && <span className="text-sm">{levelConfig.icon}</span>}
        <span className={`text-sm font-bold ${categoryConfig.color}`}>{award.title}</span>
      </div>
    );
  }
  
  return (
    <div className={`p-6 rounded-2xl border-2 ${categoryConfig.bgColor} ${categoryConfig.borderColor} hover:shadow-lg transition-all`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl bg-white/80`}>
          <span className="text-4xl">{typeConfig.icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide ${categoryConfig.bgColor} ${categoryConfig.color} ${categoryConfig.borderColor} border`}>
                  {categoryConfig.icon} {categoryConfig.label}
                </span>
                {levelConfig && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide ${levelConfig.bgColor} ${levelConfig.color} ${levelConfig.borderColor} border-2`}>
                    {levelConfig.icon} {levelConfig.label}
                  </span>
                )}
              </div>
              <h3 className={`text-xl font-black ${categoryConfig.color}`}>
                {award.title}
              </h3>
            </div>
            <AwardStatusBadge status={award.status} />
          </div>
          
          <p className="text-sm text-[#707070] mb-3">
            {award.description}
          </p>
          
          {/* Award Details */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-bold text-[#1A1A24]">{award.organization}</span>
            </div>
            
            {award.eventName && (
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#0A3D91]" />
                <span className="text-[#707070]">{award.eventName}</span>
              </div>
            )}
            
            {award.weightClass && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#1A1A24]">Weight:</span>
                <span className="text-[#707070]">{award.weightClass}</span>
              </div>
            )}
            
            {award.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C8102E]" />
                <span className="text-[#707070]">{award.location}</span>
              </div>
            )}
            
            {award.awardedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[#707070]">{new Date(award.awardedDate).toLocaleDateString()}</span>
              </div>
            )}
            
            {award.cashPrize && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-green-600" />
                <span className="font-bold text-green-700">{formatPrizeMoney(award.cashPrize)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Winner Information */}
      {showWinner && award.winnerName && (
        <div className="mt-4 p-3 bg-white/80 rounded-lg border border-green-300">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold text-green-700 uppercase">Winner</span>
          </div>
          <p className="text-sm font-bold text-[#1A1A24]">{award.winnerName}</p>
          {award.winnerClub && <p className="text-xs text-[#707070]">{award.winnerClub}</p>}
        </div>
      )}
      
      {/* Trophy Details */}
      {award.trophyDetails && (
        <div className="mt-3 p-3 bg-white/60 rounded-lg">
          <p className="text-xs text-[#707070] italic">{award.trophyDetails}</p>
        </div>
      )}
    </div>
  );
}

function AwardStatusBadge({ status }: { status: Award['status'] }) {
  const config = {
    awarded: { label: 'Awarded', color: 'bg-green-100 text-green-700 border-green-300' },
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    nominated: { label: 'Nominated', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  };
  
  const { label, color } = config[status];
  
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border-2 ${color}`}>
      {label}
    </span>
  );
}

// Award Badge (small, for inline display)
export function AwardBadge({ award }: { award: Award }) {
  const typeConfig = AWARD_TYPE_CONFIG[award.type];
  const levelConfig = award.level ? AWARD_LEVEL_CONFIG[award.level] : null;
  
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border-2 border-[#E0E0E0] rounded-lg">
      <span className="text-sm">{typeConfig.icon}</span>
      {levelConfig && <span className="text-xs">{levelConfig.icon}</span>}
      <span className="text-xs font-bold text-[#1A1A24]">{typeConfig.label}</span>
    </div>
  );
}

// Fighter Award Summary Widget
export function FighterAwardSummaryWidget({ fighterId, summary }: { 
  fighterId: string;
  summary: any;
}) {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-white rounded-xl shadow-sm">
          <Trophy className="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-purple-700">{summary.totalAwards}</h3>
          <p className="text-sm font-bold text-purple-600 uppercase tracking-wide">Total Awards</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="p-3 bg-white rounded-xl border border-yellow-200">
          <div className="text-2xl font-black text-yellow-700">{summary.goldMedals}</div>
          <div className="text-xs font-bold text-yellow-600 uppercase">🥇 Gold</div>
        </div>
        
        <div className="p-3 bg-white rounded-xl border border-gray-200">
          <div className="text-2xl font-black text-gray-700">{summary.silverMedals}</div>
          <div className="text-xs font-bold text-gray-600 uppercase">🥈 Silver</div>
        </div>
        
        <div className="p-3 bg-white rounded-xl border border-orange-200">
          <div className="text-2xl font-black text-orange-700">{summary.bronzeMedals}</div>
          <div className="text-xs font-bold text-orange-600 uppercase">🥉 Bronze</div>
        </div>
        
        <div className="p-3 bg-white rounded-xl border border-purple-200">
          <div className="text-2xl font-black text-purple-700">{summary.international}</div>
          <div className="text-xs font-bold text-purple-600 uppercase">🌍 International</div>
        </div>
        
        <div className="p-3 bg-white rounded-xl border border-blue-200">
          <div className="text-2xl font-black text-blue-700">{summary.national}</div>
          <div className="text-xs font-bold text-blue-600 uppercase">🇰🇭 National</div>
        </div>
        
        {summary.totalPrizeMoney > 0 && (
          <div className="p-3 bg-white rounded-xl border border-green-200">
            <div className="text-lg font-black text-green-700">${summary.totalPrizeMoney.toLocaleString()}</div>
            <div className="text-xs font-bold text-green-600 uppercase">💰 Prize Money</div>
          </div>
        )}
      </div>
      
      {summary.highestAchievement && (
        <div className="mt-4 p-3 bg-white rounded-xl border-2 border-purple-300">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-purple-700 uppercase">Highest Achievement</span>
          </div>
          <p className="text-sm font-bold text-[#1A1A24]">{summary.highestAchievement.title}</p>
          <p className="text-xs text-[#707070]">{summary.highestAchievement.year}</p>
        </div>
      )}
    </div>
  );
}

// Awards by Category Display
export function AwardsByCategory({ awards }: { awards: Award[] }) {
  const categories: Array<{ category: any; awards: Award[] }> = [
    { category: 'international', awards: awards.filter(a => a.category === 'international') },
    { category: 'regional', awards: awards.filter(a => a.category === 'regional') },
    { category: 'national', awards: awards.filter(a => a.category === 'national') },
    { category: 'professional', awards: awards.filter(a => a.category === 'professional') },
    { category: 'recognition', awards: awards.filter(a => a.category === 'recognition') },
  ];
  
  return (
    <div className="space-y-6">
      {categories.map(({ category, awards: categoryAwards }) => {
        if (categoryAwards.length === 0) return null;
        
        const config = AWARD_CATEGORY_CONFIG[category];
        
        return (
          <div key={category}>
            <div className={`flex items-center gap-3 mb-4 p-4 ${config.bgColor} rounded-xl border-2 ${config.borderColor}`}>
              <span className="text-3xl">{config.icon}</span>
              <div>
                <h3 className={`text-xl font-black ${config.color}`}>{config.label}</h3>
                <p className="text-sm text-[#707070]">{config.description}</p>
              </div>
              <div className={`ml-auto px-4 py-2 ${config.color} font-black text-2xl`}>
                {categoryAwards.length}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryAwards.map(award => (
                <AwardCard key={award.id} award={award} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

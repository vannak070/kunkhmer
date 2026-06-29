import { CHAMPIONSHIP_TYPE_CONFIG, type Championship, type ChampionshipType, formatCashPrize } from "../data/championships";
import { Trophy, Medal, DollarSign, Crown, Award } from "lucide-react";

interface ChampionshipCardProps {
  championship: Championship;
  compact?: boolean;
}

export function ChampionshipCard({ championship, compact = false }: ChampionshipCardProps) {
  const config = CHAMPIONSHIP_TYPE_CONFIG[championship.type];
  const ChampionIcon = getChampionshipIcon(championship.type);
  
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${config.bgColor} ${config.borderColor} border-2 rounded-lg px-3 py-1.5`}>
        <ChampionIcon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-bold ${config.color}`}>{championship.title}</span>
      </div>
    );
  }
  
  return (
    <div className={`p-6 rounded-2xl border-2 ${config.bgColor} ${config.borderColor} hover:shadow-lg transition-all`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-white/80 ${config.color}`}>
          <ChampionIcon className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide ${config.bgColor} ${config.color} ${config.borderColor} border mb-2`}>
                {config.icon} {config.label}
              </span>
              <h3 className={`text-xl font-black ${config.color} mt-1`}>
                {championship.title}
              </h3>
            </div>
            <ChampionshipStatusBadge status={championship.status} />
          </div>
          
          <p className="text-sm text-[#707070] mb-3">
            {championship.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#1A1A24]">Event:</span>
              <span className="text-[#707070]">{championship.eventName}</span>
            </div>
            
            {championship.weightCategory && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#1A1A24]">Weight:</span>
                <span className="text-[#707070]">{championship.weightCategory}</span>
              </div>
            )}
            
            {championship.cashPrize && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-green-600" />
                <span className="font-bold text-green-700">{formatCashPrize(championship.cashPrize)}</span>
              </div>
            )}
          </div>
          
          {championship.winner && (
            <div className="mt-4 p-3 bg-white/80 rounded-lg border border-green-300">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold text-green-700 uppercase">Winner</span>
              </div>
              <p className="text-sm font-bold text-[#1A1A24]">{championship.winner.fighterName}</p>
              <p className="text-xs text-[#707070]">{championship.winner.clubName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getChampionshipIcon(type: ChampionshipType) {
  const icons: Record<ChampionshipType, any> = {
    belt: Trophy,
    trophy: Award,
    medal: Medal,
    cash: DollarSign,
    title: Crown,
  };
  return icons[type];
}

function ChampionshipStatusBadge({ status }: { status: Championship['status'] }) {
  const config = {
    announced: { label: 'Announced', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    awarded: { label: 'Awarded', color: 'bg-green-100 text-green-700 border-green-300' },
  };
  
  const { label, color } = config[status];
  
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border-2 ${color}`}>
      {label}
    </span>
  );
}

// Event prizes summary
export function EventPrizesSummary({ championships }: { championships: Championship[] }) {
  if (championships.length === 0) {
    return (
      <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-xl text-center">
        <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-sm font-bold text-gray-600">No championships announced yet</p>
      </div>
    );
  }
  
  const totalCash = championships
    .filter(ch => ch.cashPrize)
    .reduce((sum, ch) => sum + (ch.cashPrize || 0), 0);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
          <Trophy className="w-6 h-6 text-yellow-700 mx-auto mb-2" />
          <div className="text-2xl font-black text-yellow-700">
            {championships.filter(ch => ch.type === 'belt').length}
          </div>
          <div className="text-xs font-bold text-yellow-600 uppercase">Belts</div>
        </div>
        
        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-center">
          <Award className="w-6 h-6 text-amber-700 mx-auto mb-2" />
          <div className="text-2xl font-black text-amber-700">
            {championships.filter(ch => ch.type === 'trophy').length}
          </div>
          <div className="text-xs font-bold text-amber-600 uppercase">Trophies</div>
        </div>
        
        <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl text-center">
          <Medal className="w-6 h-6 text-orange-700 mx-auto mb-2" />
          <div className="text-2xl font-black text-orange-700">
            {championships.filter(ch => ch.type === 'medal').length}
          </div>
          <div className="text-xs font-bold text-orange-600 uppercase">Medals</div>
        </div>
        
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl text-center">
          <DollarSign className="w-6 h-6 text-green-700 mx-auto mb-2" />
          <div className="text-2xl font-black text-green-700">
            {formatCashPrize(totalCash)}
          </div>
          <div className="text-xs font-bold text-green-600 uppercase">Total Prize</div>
        </div>
      </div>
      
      <div className="space-y-3">
        {championships.map(ch => (
          <ChampionshipCard key={ch.id} championship={ch} />
        ))}
      </div>
    </div>
  );
}

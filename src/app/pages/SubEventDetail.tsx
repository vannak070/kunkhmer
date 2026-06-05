import { useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { 
  ArrowLeft, Plus, Calendar, MapPin, Trophy, Users,
  PlayCircle, Edit, CheckCircle, Clock, Share2, Download, X
} from "lucide-react";
import { MOCK_SUB_EVENTS, MOCK_EVENTS, MOCK_MATCHES, MOCK_FIGHTERS } from "../data/mock";
import { getBroadcastStationById } from "../data/masterData";
import { usePermissions } from "../hooks/usePermissions";
import { ShareableMatchCard } from "../components/ShareableMatchCard";
import { clsx } from "clsx";
import { toast } from "sonner";
import html2canvas from "html2canvas";

export function SubEventDetail() {
  const { eventId, subEventId } = useParams();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const cardRef = useRef<HTMLDivElement>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const mainEvent = MOCK_EVENTS.find((e) => e.id === eventId) || MOCK_EVENTS[0];
  const subEvent = MOCK_SUB_EVENTS.find((se) => se.id === subEventId) || MOCK_SUB_EVENTS[0];
  const matches = MOCK_MATCHES.filter(m => m.subEventId === subEvent.id);

  // Get broadcast station
  const broadcastStation = mainEvent.broadcastStationId 
    ? getBroadcastStationById(mainEvent.broadcastStationId) 
    : null;

  const { canEditEvent } = permissions;

  // Only approved events can add matches to sub-events
  const canAddMatch = mainEvent.status === "KKF Approved" || mainEvent.status === "Published" || mainEvent.status === "In Progress";
  
  // Can share only if matches are confirmed
  const canShare = matches.length > 0 && matches.every(m => 
    m.status === "Club Confirmed" || 
    m.status === "Ready to Fight" || 
    m.status === "In Progress" || 
    m.status === "Completed"
  );

  const handleAddMatch = () => {
    if (!canAddMatch) {
      toast.error("❌ Event must be approved before adding matches");
      return;
    }
    navigate(`/home/events/${eventId}/sub-events/${subEventId}/add-match`);
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `${subEvent.name.replace(/\s+/g, '-')}-fight-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success("✅ Fight card downloaded successfully!");
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error("❌ Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (!canShare) {
      toast.error("❌ All matches must be confirmed before sharing");
      return;
    }
    setShowShareCard(true);
  };

  // Prepare match data for shareable card
  const shareableMatches = matches.map((match, index) => ({
    id: match.id,
    matchNumber: index + 1,
    fighterA: {
      id: match.fighterA.id,
      name: match.fighterA.name,
      alias: match.fighterA.alias || match.fighterA.name,
      gym: match.fighterA.gym,
      style: match.fighterA.style || "Kun Khmer Traditional",
      image: match.fighterA.image,
      nationality: match.fighterA.nationality || "Cambodia",
    },
    fighterB: {
      id: match.fighterB.id,
      name: match.fighterB.name,
      alias: match.fighterB.alias || match.fighterB.name,
      gym: match.fighterB.gym,
      image: match.fighterB.image,
      nationality: match.fighterB.nationality || "Cambodia",
    },
    weight: match.agreedWeight || 70,
    weightAgreement: match.weightClass || "",
    rounds: match.rounds || 5,
    isSpecialMatch: match.isChampionship || false,
    isForeignMatch: match.fighterB.nationality !== "Cambodia",
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      {/* Hero Header */}
      <div className="relative h-72 w-full overflow-hidden bg-gradient-to-br from-[#1A1A24] via-[#0A3D91] to-[#051C42]">
        <div className="absolute inset-0">
          <img 
            src={subEvent.image} 
            alt={subEvent.name}
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top Navigation Bar */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
          <Link to={`/home/events/${eventId}`} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-xl transition-all shadow-lg border border-white/20 hover:scale-105">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          
          {/* Create Event Button */}
          {permissions.hasPermission('events.create') && (
            <Link 
              to="/home/events/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:scale-[1.02] backdrop-blur-sm border border-white/10"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full px-6 md:px-10 pb-8 z-20">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/70 text-sm font-medium mb-4">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link to={`/home/events/${eventId}`} className="hover:text-white transition-colors">{mainEvent.name}</Link>
              <span>/</span>
              <span className="text-white font-bold">{subEvent.name}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg shadow-md bg-purple-500 text-white">
                Week {subEvent.weekNumber}
              </span>
              <span className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg shadow-md ${
                subEvent.status === 'Completed' ? 'bg-emerald-500 text-white' :
                subEvent.status === 'In Progress' ? 'bg-blue-500 text-white' :
                'bg-gray-400 text-white'
              }`}>
                {subEvent.status}
              </span>
              <span className="px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg shadow-md bg-[#F2C94C] text-[#1A1A24]">
                {subEvent.phase}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-4 drop-shadow-2xl leading-none">
              {subEvent.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-base font-bold">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#F2C94C]" />
                {subEvent.date}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#F2C94C]" />
                {subEvent.location}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
              <span className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-[#F2C94C]" />
                {matches.length} Matches
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-10">
        
        {/* Description Card */}
        <div className="mb-8 bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
          <h3 className="text-2xl font-black uppercase mb-4 tracking-tight text-[#1A1A24] flex items-center gap-3">
            <span className="w-2 h-8 bg-gradient-to-b from-[#C8102E] to-[#A00D24] rounded-full" />
            About This Week
          </h3>
          <p className="text-[#707070] leading-relaxed text-lg">
            {subEvent.description}
          </p>
        </div>

        {/* Fight Card Section */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
          <div className="p-6 bg-gradient-to-r from-[#F4F5F8] to-white border-b border-[#E0E0E0] flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#1A1A24] mb-1">Fight Card</h2>
              <p className="text-sm text-[#707070] font-medium">
                {matches.length} {matches.length === 1 ? 'match' : 'matches'} scheduled for this week
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Share Button */}
              {matches.length > 0 && (
                <button
                  onClick={handleShare}
                  disabled={!canShare}
                  className={clsx(
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg",
                    canShare
                      ? "bg-gradient-to-r from-[#F2C94C] to-[#F2B134] hover:from-[#F2B134] hover:to-[#E09F1F] text-[#1A1A24] hover:shadow-xl hover:scale-[1.02]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <Share2 className="w-4 h-4" />
                  Share Fight Card
                </button>
              )}
              
              {/* Create Match Button - Made more prominent */}
              {canAddMatch && canEditEvent && (
                <button
                  onClick={handleAddMatch}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:from-[#A00D24] hover:to-[#8A0B20] text-white px-6 py-3 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  <Plus className="w-5 h-5" />
                  Create Match
                </button>
              )}
              {!canAddMatch && canEditEvent && (
                <div className="text-sm text-amber-600 font-bold bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                  ⚠️ Event must be approved to add matches
                </div>
              )}
            </div>
          </div>
          
          {matches.length > 0 ? (
            <div className="divide-y divide-[#E0E0E0]">
              {matches.map((match, index) => (
                <Link
                  key={match.id}
                  to={`/matches/${match.id}`}
                  className="block p-8 hover:bg-[#F9FAFB] transition-colors group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0A3D91] to-[#051C42] rounded-2xl flex items-center justify-center text-white text-xl font-black">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#B0B0B0] uppercase tracking-wider">Match {index + 1}</div>
                        <div className="text-sm text-[#707070] font-medium">{match.rounds} Rounds • {match.agreedWeight}kg</div>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider ${
                      match.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      match.status === 'Ready to Fight' ? 'bg-blue-100 text-blue-700' :
                      match.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                      match.status === 'Club Confirmed' ? 'bg-green-100 text-green-700' :
                      match.status === 'Pending Club Confirmation' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {match.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-6 items-center">
                    {/* Fighter A */}
                    <div className="flex items-center gap-4">
                      <img 
                        src={match.fighterA.image} 
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-[#E0E0E0] group-hover:border-[#0A3D91] transition-colors" 
                        alt={match.fighterA.name}
                      />
                      <div>
                        <div className="text-xl font-black text-[#1A1A24] group-hover:text-[#0A3D91] transition-colors">
                          {match.fighterA.name}
                        </div>
                        <div className="text-sm text-[#707070] font-medium">{match.fighterA.record}</div>
                        <div className="text-xs text-[#B0B0B0] font-bold mt-1">{match.fighterA.gym}</div>
                      </div>
                    </div>

                    {/* VS Badge */}
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#C8102E] to-[#A00D24] rounded-full flex items-center justify-center text-white text-lg font-black shadow-lg">
                        VS
                      </div>
                    </div>

                    {/* Fighter B */}
                    <div className="flex items-center gap-4 justify-end text-right">
                      <div>
                        <div className="text-xl font-black text-[#1A1A24] group-hover:text-[#0A3D91] transition-colors">
                          {match.fighterB.name}
                        </div>
                        <div className="text-sm text-[#707070] font-medium">{match.fighterB.record}</div>
                        <div className="text-xs text-[#B0B0B0] font-bold mt-1">{match.fighterB.gym}</div>
                      </div>
                      <img 
                        src={match.fighterB.image} 
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-[#E0E0E0] group-hover:border-[#0A3D91] transition-colors" 
                        alt={match.fighterB.name}
                      />
                    </div>
                  </div>

                  {/* Match Result (if completed) */}
                  {match.result && (
                    <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                        <div>
                          <div className="font-black text-emerald-800 uppercase tracking-wide text-sm">
                            Winner: {MOCK_FIGHTERS.find(f => f.id === match.result.winner)?.name}
                          </div>
                          <div className="text-sm text-emerald-700 font-medium">
                            {match.result.method} • Round {match.result.round} • {match.result.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <PlayCircle className="w-16 h-16 text-[#E0E0E0] mx-auto mb-4" />
              <h4 className="text-xl font-black text-[#1A1A24] mb-2">No Matches Yet</h4>
              <p className="text-[#707070] font-medium mb-6">
                Start building the fight card for this week
              </p>
              {canAddMatch && canEditEvent && (
                <button
                  onClick={handleAddMatch}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A3D91] to-[#051C42] text-white px-6 py-3 rounded-xl font-bold"
                >
                  <Plus className="w-5 h-5" />
                  Add First Match
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b-2 border-[#E0E0E0] px-8 py-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-3xl font-black text-[#0A3D91] uppercase tracking-tight">Shareable Fight Card</h2>
                <p className="text-sm text-[#707070] font-medium mt-1">Download and share on social media</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadCard}
                  disabled={isGenerating}
                  className={clsx(
                    "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg",
                    isGenerating
                      ? "bg-gray-300 text-gray-500 cursor-wait"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-xl"
                  )}
                >
                  <Download className="w-5 h-5" />
                  {isGenerating ? "Generating..." : "Download"}
                </button>
                <button
                  onClick={() => setShowShareCard(false)}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-[#707070] transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Shareable Card Preview */}
            <div className="p-8 bg-[#F4F5F8]">
              <div className="mx-auto" style={{ width: 'fit-content' }}>
                <ShareableMatchCard
                  ref={cardRef}
                  eventName={mainEvent.name}
                  subEventName={subEvent.name}
                  date={subEvent.date}
                  time="19:00"
                  location={subEvent.location}
                  venue={mainEvent.location}
                  matches={shareableMatches}
                  broadcastStation={broadcastStation || undefined}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
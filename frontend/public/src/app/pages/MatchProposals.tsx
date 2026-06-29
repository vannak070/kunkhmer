import { useState } from "react";
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar, Users, Shield, Flame } from "lucide-react";
import { MOCK_MATCHES, MOCK_EVENTS, GRADE_STYLES } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";
import { Link } from "react-router";

export function MatchProposals() {
  const permissions = usePermissions();
  const currentUser = permissions.currentUser;
  const [filter, setFilter] = useState<string>("pending");

  if (!currentUser || currentUser.role !== 'club') {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[#C8102E] mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#C8102E] mb-2">Access Denied</h2>
          <p className="text-[#707070] font-medium">This page is only accessible to Club/Gym users.</p>
        </div>
      </div>
    );
  }

  // Filter matches where current user's club is involved
  const userClubId = currentUser.organization; // In real app, this would be a proper club ID
  
  const relevantMatches = MOCK_MATCHES.filter(match => {
    // Check if either fighter belongs to the user's club
    const fighterAClub = match.fighterA.gym;
    const fighterBClub = match.fighterB.gym;
    
    return fighterAClub === userClubId || fighterBClub === userClubId;
  });

  const pendingMatches = relevantMatches.filter(match => 
    match.status === "Proposed" || match.status === "Pending Club Confirmation"
  );

  const confirmedMatches = relevantMatches.filter(match => 
    match.clubAResponse === "confirmed" && match.clubBResponse === "confirmed"
  );

  const rejectedMatches = relevantMatches.filter(match => 
    match.clubAResponse === "rejected" || match.clubBResponse === "rejected"
  );

  const displayMatches = filter === "pending" ? pendingMatches : 
                         filter === "confirmed" ? confirmedMatches : 
                         rejectedMatches;

  const handleAccept = (matchId: string) => {
    const match = MOCK_MATCHES.find(m => m.id === matchId);
    if (!match) return;

    const isClubA = match.fighterA.gym === userClubId;
    const today = new Date().toISOString().split('T')[0];
    
    if (isClubA) {
      match.clubAResponse = "confirmed";
      match.clubAConfirmedDate = today;
    } else {
      match.clubBResponse = "confirmed";
      match.clubBConfirmedDate = today;
    }

    // Update match status based on both clubs' responses
    if (match.clubAResponse === "confirmed" && match.clubBResponse === "confirmed") {
      match.status = "Club Confirmed"; // Both clubs confirmed, ready for organizer to assign to event
    } else if (match.clubAResponse === "confirmed" || match.clubBResponse === "confirmed") {
      match.status = "Pending Club Confirmation"; // One club confirmed, waiting for other
    }

    alert("Match proposal confirmed! Your fighter has been confirmed for this match.");
    window.location.reload();
  };

  const handleReject = (matchId: string) => {
    const match = MOCK_MATCHES.find(m => m.id === matchId);
    if (!match) return;

    const isClubA = match.fighterA.gym === userClubId;
    
    if (isClubA) {
      match.clubAResponse = "rejected";
    } else {
      match.clubBResponse = "rejected";
    }

    match.status = "Rejected";

    alert("Match proposal rejected.");
    window.location.reload();
  };

  const getMyResponse = (match: any) => {
    const isClubA = match.fighterA.gym === userClubId;
    return isClubA ? match.clubAResponse : match.clubBResponse;
  };

  const getOpponentResponse = (match: any) => {
    const isClubA = match.fighterA.gym === userClubId;
    return isClubA ? match.clubBResponse : match.clubAResponse;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-4xl font-black tracking-tight uppercase text-[#0A3D91]">
          Match Proposals
        </h1>
        <p className="text-[#707070] mt-2 font-medium text-lg">
          Review and respond to match proposals from organizers
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border-2 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-1">Pending</p>
              <p className="text-4xl font-black text-amber-700">{pendingMatches.length}</p>
            </div>
            <Clock className="w-12 h-12 text-amber-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border-2 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-1">Confirmed</p>
              <p className="text-4xl font-black text-emerald-700">{confirmedMatches.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-[#C8102E] uppercase tracking-wider mb-1">Rejected</p>
              <p className="text-4xl font-black text-[#C8102E]">{rejectedMatches.length}</p>
            </div>
            <XCircle className="w-12 h-12 text-[#C8102E]" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter("pending")}
          className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
            filter === "pending"
              ? "bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white shadow-lg"
              : "bg-white text-[#707070] border-2 border-[#E0E0E0] hover:border-[#0A3D91]"
          }`}
        >
          Pending ({pendingMatches.length})
        </button>
        <button
          onClick={() => setFilter("confirmed")}
          className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
            filter === "confirmed"
              ? "bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white shadow-lg"
              : "bg-white text-[#707070] border-2 border-[#E0E0E0] hover:border-[#0A3D91]"
          }`}
        >
          Confirmed ({confirmedMatches.length})
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
            filter === "rejected"
              ? "bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white shadow-lg"
              : "bg-white text-[#707070] border-2 border-[#E0E0E0] hover:border-[#0A3D91]"
          }`}
        >
          Rejected ({rejectedMatches.length})
        </button>
      </div>

      {/* Match Proposals List */}
      <div className="space-y-6">
        {displayMatches.length === 0 && (
          <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] p-12 text-center">
            <Clock className="w-16 h-16 text-[#B0B0B0] mx-auto mb-4" />
            <p className="text-[#707070] font-medium text-lg">
              No {filter} match proposals.
            </p>
          </div>
        )}

        {displayMatches.map((match) => {
          const event = MOCK_EVENTS.find(e => e.id === match.eventId);
          const myResponse = getMyResponse(match);
          const opponentResponse = getOpponentResponse(match);
          const isClubA = match.fighterA.gym === userClubId;
          const myFighter = isClubA ? match.fighterA : match.fighterB;
          const opponentFighter = isClubA ? match.fighterB : match.fighterA;
          const gradeStyleA = GRADE_STYLES[match.fighterA.grade || 'D'];
          const gradeStyleB = GRADE_STYLES[match.fighterB.grade || 'D'];

          return (
            <div key={match.id} className="bg-white rounded-2xl border-2 border-[#E0E0E0] overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              {/* Match Header */}
              <div className="bg-gradient-to-r from-[#0A3D91] to-[#051C42] px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-black text-xl mb-1">{event?.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {match.date}
                      </span>
                      <span>•</span>
                      <span>{match.rounds} Rounds</span>
                      <span>•</span>
                      <span>{match.weightClass}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {match.proposalStatus === "confirmed" && (
                      <span className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg">
                        <CheckCircle className="w-4 h-4" />
                        Confirmed
                      </span>
                    )}
                    {match.proposalStatus === "rejected" && (
                      <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg">
                        <XCircle className="w-4 h-4" />
                        Rejected
                      </span>
                    )}
                    {match.proposalStatus?.includes("pending") && (
                      <span className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg">
                        <Clock className="w-4 h-4" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Fighter A */}
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <img 
                        src={match.fighterA.image} 
                        alt={match.fighterA.name}
                        className={`w-28 h-28 rounded-full object-cover border-4 shadow-xl ${
                          isClubA ? 'border-[#0A3D91]' : 'border-[#E0E0E0]'
                        }`}
                      />
                      {isClubA && (
                        <span className="absolute -top-2 -left-2 bg-[#0A3D91] text-white p-2 rounded-full shadow-lg border-2 border-white">
                          <Shield className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-xl text-[#1A1A24] mb-2">{match.fighterA.name}</h4>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-sm font-mono font-bold bg-[#F4F5F8] px-3 py-1 rounded-lg">{match.fighterA.record}</span>
                      <span className={`text-xs font-black px-2 py-1 rounded ${gradeStyleA.bg} ${gradeStyleA.text}`}>
                        Grade {match.fighterA.grade}
                      </span>
                    </div>
                    <p className="text-sm text-[#707070] font-medium">{match.fighterA.gym}</p>
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-[#0A3D91] text-xs font-bold uppercase rounded-lg border border-blue-100">
                        {match.fighterA.style}
                      </span>
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#1A1A24] to-[#0A3D91] rounded-2xl rotate-45 flex items-center justify-center shadow-xl mb-4">
                      <span className="font-black italic text-3xl text-white -rotate-45">VS</span>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-black text-[#707070] uppercase">Your Status:</span>
                        {myResponse === "confirmed" && (
                          <span className="text-emerald-600 font-bold text-sm flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Confirmed
                          </span>
                        )}
                        {myResponse === "rejected" && (
                          <span className="text-red-600 font-bold text-sm flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Rejected
                          </span>
                        )}
                        {myResponse === "pending" && (
                          <span className="text-amber-600 font-bold text-sm flex items-center gap-1">
                            <Clock className="w-4 h-4" /> Pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-black text-[#707070] uppercase">Opponent:</span>
                        {opponentResponse === "confirmed" && (
                          <span className="text-emerald-600 font-bold text-sm flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Confirmed
                          </span>
                        )}
                        {opponentResponse === "rejected" && (
                          <span className="text-red-600 font-bold text-sm flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Rejected
                          </span>
                        )}
                        {opponentResponse === "pending" && (
                          <span className="text-amber-600 font-bold text-sm flex items-center gap-1">
                            <Clock className="w-4 h-4" /> Waiting...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fighter B */}
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <img 
                        src={match.fighterB.image} 
                        alt={match.fighterB.name}
                        className={`w-28 h-28 rounded-full object-cover border-4 shadow-xl ${
                          !isClubA ? 'border-[#C8102E]' : 'border-[#E0E0E0]'
                        }`}
                      />
                      {!isClubA && (
                        <span className="absolute -top-2 -right-2 bg-[#C8102E] text-white p-2 rounded-full shadow-lg border-2 border-white">
                          <Shield className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-xl text-[#1A1A24] mb-2">{match.fighterB.name}</h4>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-sm font-mono font-bold bg-[#F4F5F8] px-3 py-1 rounded-lg">{match.fighterB.record}</span>
                      <span className={`text-xs font-black px-2 py-1 rounded ${gradeStyleB.bg} ${gradeStyleB.text}`}>
                        Grade {match.fighterB.grade}
                      </span>
                    </div>
                    <p className="text-sm text-[#707070] font-medium">{match.fighterB.gym}</p>
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-red-50 text-[#C8102E] text-xs font-bold uppercase rounded-lg border border-red-100">
                        {match.fighterB.style}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {myResponse === "pending" && match.proposalStatus !== "rejected" && (
                  <div className="mt-6 pt-6 border-t-2 border-[#E0E0E0] flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => handleAccept(match.id)}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Accept Match
                    </button>
                    <button
                      onClick={() => handleReject(match.id)}
                      className="inline-flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-[#C8102E] border-2 border-[#C8102E] px-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Match
                    </button>
                  </div>
                )}

                {myResponse === "confirmed" && opponentResponse === "pending" && (
                  <div className="mt-6 pt-6 border-t-2 border-[#E0E0E0]">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                      <p className="text-[#0A3D91] font-bold flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5" />
                        Waiting for opponent club to respond...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
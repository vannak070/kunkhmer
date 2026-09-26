import { Calendar, MapPin, Trophy, Building2, Tv, Users, Eye, ChevronRight, Clock, Swords } from "lucide-react";
import { Link } from "react-router";
import { PublicStatusBadge } from "./PublicStatusBadge";
import { getFighterSlug } from "../data/masterData";
import { useI18n } from "../i18n/LanguageContext";
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
  const { t, tn, formatDate, formatWeight, localName } = useI18n();
  const weightLabel = (m: any) => (m?.agreedWeight ? formatWeight(m.agreedWeight) : t("matches.catchweight"));
  const mainMatch = batch.matches.find((m: any) => m.matchOrder === 1) || batch.matches[0];
  const otherMatches = batch.matches.filter((m: any) => m.id !== mainMatch.id);
  const batchEvent = events.find(e => e.id === batch.eventId);
  const displayImage = batchEvent?.image || eventPosterImage;

  const headerBgClass = variant === 'previous'
    ? 'bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800'
    : 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800';

  const buttonClass = variant === 'previous'
    ? 'bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 border border-zinc-700'
    : 'bg-gradient-to-r from-[#0A3D91] to-blue-700 hover:from-blue-700 hover:to-blue-600 shadow-[0_4px_12px_rgba(10,61,145,0.25)] hover:shadow-[0_6px_20px_rgba(10,61,145,0.4)]';

  const formatBatchDate = (dateStr: any) => formatDate(dateStr) || "—";

  return (
    <div className="space-y-4">
      {/* Main Event Card */}
      <div 
        onClick={() => {
          onToggleExpansion(batch.id);
        }}
        className="group relative bg-white rounded-3xl overflow-hidden hover:shadow-[0_20px_50px_rgba(10,61,145,0.06)] transition-all duration-500 border border-slate-100/80 cursor-pointer"
      >
        {/* Glow Top Accent Bar */}
        <div className={`h-1.5 w-full ${variant === 'previous' ? 'bg-zinc-600' : 'bg-gradient-to-r from-red-600 via-amber-500 to-[#0A3D91]'}`} />

        {/* Event Header */}
        <div className={`${headerBgClass} px-6 py-5`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20 shrink-0">
                <span className="text-[10px] font-black text-amber-400 tracking-widest uppercase">{t("matches.matchCard")}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg md:text-xl font-black text-white mb-1.5 truncate tracking-tight">{batch.batchNumber}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap font-medium">
                  <span className="font-extrabold text-amber-400">{batch.eventName}</span>
                  <span className="text-slate-600 font-normal">•</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatBatchDate(batch.date)}</span>
                  </div>
                  <span className="text-slate-600 font-normal">•</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{batch.location}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <PublicStatusBadge status={variant === 'previous' ? 'Completed' : batch.status} surface="dark" />
              <div className="p-2 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 text-slate-300 transition-all duration-300 group-hover:border-slate-500 group-hover:text-white">
                <ChevronRight className={`w-4 h-4 transition-transform duration-350 ${isExpanded ? 'rotate-90' : ''}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Event Content */}
        <div className="p-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className={`bg-gradient-to-br ${variant === 'previous' ? 'from-zinc-50/50 to-zinc-100/30 border-zinc-200/50' : 'from-blue-50/50 to-indigo-50/30 border-blue-100/50'} rounded-2xl p-4 border transition-all duration-300 hover:shadow-sm`}>
              <div className="flex items-center gap-2 mb-1.5">
                <Trophy className={`w-4 h-4 ${variant === 'previous' ? 'text-zinc-500' : 'text-[#0A3D91]'}`} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{tn("common.bout", batch.totalMatches)}</span>
              </div>
              <p className="text-xl font-black text-slate-900">{batch.totalMatches}</p>
            </div>
            {batch.organizerClub && (
              <div className="bg-gradient-to-br from-violet-50/50 to-purple-50/30 rounded-2xl p-4 border border-violet-100/50 transition-all duration-300 hover:shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <Building2 className="w-4 h-4 text-violet-600" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("matches.organizer")}</span>
                </div>
                <p className="text-sm font-black text-slate-800 truncate">{batch.organizerClub}</p>
              </div>
            )}
            {batch.broadcastStation && (
              <div className="bg-gradient-to-br from-rose-50/50 to-red-50/30 rounded-2xl p-4 border border-rose-100/50 transition-all duration-300 hover:shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <Tv className="w-4 h-4 text-rose-600" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("matches.broadcast")}</span>
                </div>
                <p className="text-sm font-black text-slate-800 truncate">{batch.broadcastStation}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{tn("common.boutOnCard", batch.totalMatches)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpansion(batch.id);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 ${buttonClass} text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider`}
              >
                <Eye className="w-4 h-4" />
                <span>{isExpanded ? t("common.hideDetails") : t("common.viewDetails")}</span>
                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* All Matches - Collapsible */}
      {isExpanded && (
        <div className="ml-0 md:ml-4 space-y-4 animate-tab-content">
          {/* Headliner Match (Fight Card format) */}
          {mainMatch && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(mainMatch.id);
              }}
              className="p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl border-2 border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_10px_30px_rgba(245,158,11,0.06)] transition-all duration-300 cursor-pointer text-white relative overflow-hidden"
            >
              {/* Gold light sheen background effect */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />

              <div className="text-center mb-4 relative z-10">
                <span className="px-4 py-1 bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-amber-500/25 text-[9px] font-black text-amber-400 border border-amber-500/30 rounded-full tracking-widest uppercase shadow-sm">
                  {t("matches.mainEvent")}
                </span>
              </div>
              
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center relative z-10">
                {/* Fighter A (Red Corner) */}
                <div className="flex items-center gap-4 min-w-0 text-left">
                  <div className="relative shrink-0">
                    <img
                      src={typeof mainMatch.fighterA.image === 'string' ? mainMatch.fighterA.image : "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100"}
                      alt={mainMatch.fighterA.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-rose-600 text-[8px] font-black text-white rounded uppercase border border-rose-500">
                      {t("matches.red")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-black text-white text-base truncate block tracking-tight">{localName(mainMatch.fighterA.name, mainMatch.fighterA.nameKhmer)}</span>
                      {mainMatch.fighterA.grade && (
                        <span title={t("common.gradeHint")} className="text-[9px] font-bold px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-slate-300 shrink-0">
                          {t("common.grade", { grade: mainMatch.fighterA.grade })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-bold truncate">{mainMatch.fighterA.clubName || "Independent"}</p>
                    {mainMatch.fighterA.record && (
                      <p className="text-[11px] text-amber-400 font-bold mt-1">{mainMatch.fighterA.record} <span className="text-amber-400/60 font-semibold">{t("common.wld")}</span></p>
                    )}
                  </div>
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center justify-center px-4 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 text-xs font-black flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-amber-300">
                    VS
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{weightLabel(mainMatch)}</span>
                </div>

                {/* Fighter B (Blue Corner) */}
                <div className="flex items-center gap-4 min-w-0 text-right justify-end">
                  <div className="min-w-0">
                    <div className="flex items-center justify-end gap-1.5 mb-1">
                      {mainMatch.fighterB.grade && (
                        <span title={t("common.gradeHint")} className="text-[9px] font-bold px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-slate-300 shrink-0">
                          {t("common.grade", { grade: mainMatch.fighterB.grade })}
                        </span>
                      )}
                      <span className="font-black text-white text-base truncate block tracking-tight">{localName(mainMatch.fighterB.name, mainMatch.fighterB.nameKhmer)}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold truncate">{mainMatch.fighterB.clubName || "Independent"}</p>
                    {mainMatch.fighterB.record && (
                      <p className="text-[11px] text-amber-400 font-bold mt-1">{mainMatch.fighterB.record} <span className="text-amber-400/60 font-semibold">{t("common.wld")}</span></p>
                    )}
                  </div>
                  <div className="relative shrink-0">
                    <img
                      src={typeof mainMatch.fighterB.image === 'string' ? mainMatch.fighterB.image : "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100"}
                      alt={mainMatch.fighterB.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.25)]"
                    />
                    <span className="absolute -bottom-1 -left-1 px-1.5 py-0.5 bg-blue-600 text-[8px] font-black text-white rounded uppercase border border-blue-500">
                      {t("matches.blue")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-5 flex justify-center">
                <Link
                  to={`/compare?red=${getFighterSlug(mainMatch.fighterA)}&blue=${getFighterSlug(mainMatch.fighterB)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-[#051C42] bg-[#F2C94C] hover:bg-[#FFD84D] transition-colors"
                >
                  <Swords className="w-3.5 h-3.5" aria-hidden />
                  {t("matchup.preview")}
                </Link>
              </div>
            </div>
          )}

          {/* Other Matches */}
          {otherMatches && otherMatches.length > 0 && (
            <div className="space-y-3">
              {otherMatches.map((match: any, idx: number) => {
                const fighterAImage = typeof match.fighterA.image === 'string' ? match.fighterA.image : "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100";
                const fighterBImage = typeof match.fighterB.image === 'string' ? match.fighterB.image : "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100";
                const fAName = localName(match.fighterA?.name, match.fighterA?.nameKhmer) || "TBD";
                const fBName = localName(match.fighterB?.name, match.fighterB?.nameKhmer) || "TBD";
                const fAClub = match.fighterA?.clubName || "Independent";
                const fBClub = match.fighterB?.clubName || "Independent";
                const fARecord = match.fighterA?.record || "";
                const fBRecord = match.fighterB?.record || "";
                const fAGrade = match.fighterA?.grade || "";
                const fBGrade = match.fighterB?.grade || "";

                // Determine winner name
                let winnerName = "";
                if (match.winnerId) {
                  if (match.winnerId === match.fighterA.id) winnerName = fAName;
                  else if (match.winnerId === match.fighterB.id) winnerName = fBName;
                } else if (match.winner) {
                  if (match.winner === 'fighterA') winnerName = fAName;
                  else if (match.winner === 'fighterB') winnerName = fBName;
                  else winnerName = match.winner;
                }

                return (
                  <div
                    key={match.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewMatch(match.id);
                    }}
                    className={`group relative bg-white rounded-2xl overflow-hidden hover:shadow-[0_12px_30px_rgba(10,61,145,0.05)] transition-all duration-300 border border-slate-100 cursor-pointer`}
                  >
                    {/* Match Header */}
                    <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`px-2.5 py-1 text-white text-[10px] font-black tracking-wider uppercase rounded-lg ${variant === 'previous' ? 'bg-zinc-700' : 'bg-[#0A3D91]'}`}>
                          {t("matches.boutNumber", { n: idx + 2 })}
                        </div>
                        <span className="text-xs font-black text-slate-800 tracking-tight">{match.isChampionshipBout ? t("matches.championshipBout") : t("matches.rankingFight")}</span>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-extrabold rounded">{weightLabel(match)}</span>
                      </div>
                      <PublicStatusBadge status={variant === 'previous' ? 'Completed' : match.status} />
                    </div>

                    {/* Match Content */}
                    <div className="p-5">
                      {/* Fighters Grid */}
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        {/* Fighter A */}
                        <div className="flex items-center gap-3 min-w-0 text-left">
                          <img
                            src={fighterAImage}
                            alt={fAName}
                            className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-bold text-slate-900 text-sm truncate block tracking-tight">{fAName}</span>
                              {fAGrade && (
                                <span title={t("common.gradeHint")} className="text-[9px] font-bold px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500 shrink-0">
                                  {t("common.grade", { grade: fAGrade })}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-semibold truncate mb-0.5">{fAClub}</div>
                            {fARecord && <div className="text-[10px] text-[#0A3D91] font-bold">{fARecord} ({t("common.wld")})</div>}
                          </div>
                        </div>

                        {/* Center Spec Badge */}
                        <div className="flex flex-col items-center shrink-0">
                          <span className="text-[8px] font-black text-slate-400 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-full font-mono mb-1">
                            VS
                          </span>
                          <div className="text-[9px] text-slate-500 font-bold text-center leading-normal">
                            <div>{weightLabel(match)}</div>
                            {match.rounds && <div>{tn("common.rounds", Number(match.rounds))}</div>}
                          </div>
                        </div>

                        {/* Fighter B */}
                        <div className="flex items-center justify-end gap-3 min-w-0 text-right">
                          <div className="min-w-0">
                            <div className="flex items-center justify-end gap-1.5 mb-0.5">
                              {fBGrade && (
                                <span title={t("common.gradeHint")} className="text-[9px] font-bold px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500 shrink-0">
                                  {t("common.grade", { grade: fBGrade })}
                                </span>
                              )}
                              <span className="font-bold text-slate-900 text-sm truncate block tracking-tight">{fBName}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-semibold truncate mb-0.5">{fBClub}</div>
                            {fBRecord && <div className="text-[10px] text-[#0A3D91] font-bold">{fBRecord} ({t("common.wld")})</div>}
                          </div>
                          <img
                            src={fighterBImage}
                            alt={fBName}
                            className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex justify-center">
                        <Link
                            to={`/compare?red=${getFighterSlug(match.fighterA)}&blue=${getFighterSlug(match.fighterB)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0A3D91] bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            <Swords className="w-3.5 h-3.5" aria-hidden />
                            {t("matchup.preview")}
                          </Link>
                      </div>

                      {/* Championship Bout Gilded Bar */}
                      {match.isChampionshipBout && (
                        <div className="mt-3 pt-2.5 border-t border-dashed border-amber-200 flex items-center justify-center gap-1.5 text-[10px] font-extrabold text-amber-700 bg-amber-50/30 rounded-lg py-1.5 px-2">
                          <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="uppercase">{t("matches.titleBout")}</span>
                        </div>
                      )}

                      {/* Winner Outcome */}
                      {winnerName && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col items-center gap-2 text-center">
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-[10px] font-black text-emerald-600 border border-emerald-500/20 rounded-lg shadow-sm">
                            <Trophy className="w-3 h-3 text-emerald-500 fill-emerald-100" />
                            <span>
                              {t("matches.winner")}: {winnerName}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold leading-normal">
                            {match.winnerMethod && <span>{t("matches.method")}: {match.winnerMethod}</span>}
                            {match.winnerRound && <span className="mx-1.5 text-slate-300">•</span>}
                            {match.winnerRound && <span>{t("matches.round", { n: match.winnerRound })}</span>}
                            {match.winnerTime && <span className="text-slate-400 font-semibold ml-1">({match.winnerTime})</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

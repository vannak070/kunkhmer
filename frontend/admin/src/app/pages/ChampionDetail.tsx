/**
 * A title's page (/home/champion/:id): the belt, who holds it now (with the fighter's club and record), the next
 * step ("Schedule a title bout"), Edit, and the title history from the official results (crowned / defended / lost),
 * newest first. More menu: Vacate title (with an optional reason) and, for a Super Admin, Delete title. Real data
 * only. The old separate history page is part of this page now. English + Khmer.
 * See claude/updates/admin-step3-simple-pages.md.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, Crown, History, MoreHorizontal, Pencil, Swords, Trash2, Trophy } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { formatDay, useT } from "../i18n/program";
import { ConfirmDialog, FighterAvatar, LangSwitch } from "../components/program/shared";
import { RecordText } from "../components/fighters/FighterTable";
import { holderName, titleHeld, typeLabel } from "../components/titles/titleUtils";
import { isRealPhoto } from "../components/fighters/fighterUtils";

export function ChampionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const permissions = usePermissions();
  const me = api.auth.getCurrentUser();
  const isSuper = me?.role === "Super Admin";
  const canManage = permissions.hasPermission("events.create");

  const [data, setData] = useState<{ title: any; holder: any | null; bouts: any[] } | null | undefined>(undefined);
  const [menu, setMenu] = useState(false);
  const [dialog, setDialog] = useState<null | "vacate" | "delete">(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const title = await api.champions.get(id!);
      const [holder, bouts] = await Promise.all([
        titleHeld(title) ? api.fighters.get(title.current_holder_id).catch(() => null) : Promise.resolve(null),
        api.matches.list().catch(() => []),
      ]);
      setData({ title, holder, bouts });
    } catch (e) {
      setData(null);
    }
  };
  useEffect(() => { setData(undefined); load(); }, [id]);

  const history = useMemo(() => [...(data?.title.defenses ?? [])].reverse(), [data]);

  if (data === undefined) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;
  if (data === null)
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-4">
        <p className="text-slate-700">{t("td.loadFailed")}</p>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => { setData(undefined); load(); }} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
          <Link to="/home/program?tab=champions" className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 inline-flex items-center">{t("td.back")}</Link>
        </div>
      </div>
    );

  const { title, holder, bouts } = data;
  const held = titleHeld(title);
  const belt = isRealPhoto(title.belt_image_url) ? title.belt_image_url : null;
  const kg = Number(title.weight_class);
  const facts = [typeLabel(t, title.champion_type), kg > 0 ? t("common.kg", { n: kg }) : null, title.organization && title.organization !== "KKF" ? title.organization : null].filter(Boolean);

  const run = async (action: () => Promise<unknown>, message: string, after?: () => void) => {
    setBusy(true);
    try {
      await action();
      toast.success(message);
      setDialog(null);
      setReason("");
      after ? after() : await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  };
  const vacate = () =>
    run(
      () => api.champions.update(title.id, { currentHolderId: null, currentHolderName: null, nationality: null, status: "Vacant", ...(reason.trim() ? { notes: `${t("td.vacatedNote")}: ${reason.trim()}` } : {}) }),
      t("td.vacated"),
    );
  const remove = () => run(() => api.champions.delete(title.id), t("td.deleted", { name: title.title_name }), () => navigate("/home/program?tab=champions"));

  /** One history line: who won and against whom, from the bout when it is known. */
  const line = (d: any) => {
    const bout = d.match_id ? bouts.find((b) => b.id === d.match_id) : undefined;
    const winnerName = bout ? (bout.winner_id === bout.fighter_a_id ? bout.fighter_a_name : bout.winner_id === bout.fighter_b_id ? bout.fighter_b_name : null) : null;
    const loserName = bout && winnerName ? (winnerName === bout.fighter_a_name ? bout.fighter_b_name : bout.fighter_a_name) : null;
    if (d.result === "Crowned New Champion") return winnerName && loserName ? t("td.crowned", { winner: winnerName, loser: loserName }) : t("td.crownedPlain", { loser: d.opponent });
    if (d.result === "Won") return winnerName && loserName ? t("td.defended", { holder: winnerName, opponent: loserName }) : t("td.defendedPlain", { opponent: d.opponent });
    return winnerName && loserName ? t("td.lost", { winner: winnerName, holder: loserName }) : t("td.lostPlain", { opponent: d.opponent });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/home/program?tab=champions" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4" aria-hidden /> {t("td.back")}
        </Link>
        <LangSwitch />
      </div>

      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 shadow-sm flex flex-col sm:flex-row gap-5">
        {belt ? <img src={belt} alt="" className="w-24 h-24 rounded-2xl object-contain bg-white border border-slate-200 shrink-0" /> : <span className="w-24 h-24 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0" aria-hidden><Crown className="w-10 h-10" /></span>}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 break-words">{title.title_name}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${held ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{held ? t("ti.held") : t("ti.vacantChip")}</span>
          </div>
          {facts.length > 0 && <p className="text-base text-slate-600">{facts.join(" · ")}</p>}
        </div>
        {canManage && (
          <div className="flex sm:flex-col items-start gap-2 shrink-0">
            <Link to={`/home/champion/${title.id}/edit`} className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary">
              <Pencil className="w-4 h-4" aria-hidden /> {t("common.edit")}
            </Link>
            <div className="relative">
              <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label={t("common.more")} className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-primary">
                <MoreHorizontal className="w-5 h-5" aria-hidden />
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg z-20 py-1" onMouseLeave={() => setMenu(false)}>
                  {held && (
                    <button type="button" onClick={() => { setMenu(false); setDialog("vacate"); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">{t("td.vacate")}</button>
                  )}
                  {isSuper && (
                    <button type="button" onClick={() => { setMenu(false); setDialog("delete"); }} className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 inline-flex items-center gap-2"><Trash2 className="w-4 h-4" aria-hidden /> {t("td.delete")}</button>
                  )}
                  {!held && !isSuper && <p className="px-4 py-3 text-sm text-slate-500">{t("td.noMore")}</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Champion */}
      {held ? (
        <section aria-label={t("td.champion")} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <FighterAvatar name={holderName(title)} image={title.current_holder_photo_db} />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5"><Crown className="w-4 h-4" aria-hidden /> {t("td.champion")}</p>
            <Link to={`/home/fighters/${title.current_holder_id}`} className="text-xl font-bold text-slate-900 hover:text-primary break-words">{holderName(title)}</Link>
            <p className="text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              {holder?.clubName && <span>{holder.clubName}</span>}
              {holder?.record && <span className="inline-flex items-center gap-1"><RecordText record={holder.record} /></span>}
              {title.date_awarded && <span>{t("ti.since", { date: formatDay(title.date_awarded, lang, false) })}</span>}
              {Number(title.defense_count) > 0 && <span>{t("club.defenses", { n: title.defense_count })}</span>}
              {title.last_defense_date && <span>{t("td.lastDefense", { date: formatDay(title.last_defense_date, lang, false) })}</span>}
            </p>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 flex items-center gap-4">
          <span className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0" aria-hidden><Crown className="w-6 h-6" /></span>
          <p className="text-base text-slate-700">{t("td.vacantText")}</p>
        </section>
      )}

      {canManage && (
        <Link to={`/home/champion/${title.id}/schedule-defense`} className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-[#f5f8fd] p-4 hover:border-primary">
          <span className="flex items-center gap-3 min-w-0">
            <span className="w-11 h-11 rounded-xl bg-white border border-[#d5e0f3] text-primary flex items-center justify-center shrink-0" aria-hidden><Swords className="w-5 h-5" /></span>
            <span className="min-w-0"><span className="block text-base font-semibold text-slate-900">{t("td.schedule")}</span><span className="block text-sm text-slate-600">{held ? t("td.scheduleHeld") : t("td.scheduleVacant")}</span></span>
          </span>
          <CalendarDays className="w-5 h-5 text-primary shrink-0" aria-hidden />
        </Link>
      )}

      {/* History */}
      <section className="space-y-3" aria-labelledby="title-history">
        <h2 id="title-history" className="text-lg font-bold text-slate-900 flex items-center gap-2"><History className="w-5 h-5 text-primary" aria-hidden /> {t("td.history")}</h2>
        {history.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-base text-slate-600">{t("td.historyEmpty")}</p>
        ) : (
          <ol className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
            {history.map((d) => (
              <li key={d.id} className="p-4 flex items-start gap-3">
                <span className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${d.result === "Lost" ? "bg-red-50 text-red-600" : d.result === "Won" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`} aria-hidden><Trophy className="w-4 h-4" /></span>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-slate-900 break-words">{line(d)}</p>
                  <p className="text-sm text-slate-600">
                    {formatDay(d.date, lang, false)}
                    {d.event_id && <> · <Link to={`/home/events/${d.event_id}`} className="text-primary hover:underline">{d.event_name}</Link></>}
                    {d.method && !/^(draw|no contest)$/i.test(d.method) && ` · ${d.method}${d.round && d.method.toLowerCase() !== "decision" ? ` · ${t("fp.round", { n: d.round })}` : ""}`}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {title.notes && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900 mb-1">{t("td.notes")}</h2>
          <p className="text-base text-slate-700 whitespace-pre-line break-words">{title.notes}</p>
        </section>
      )}

      <ConfirmDialog
        open={dialog === "vacate"}
        title={t("td.vacateTitle", { name: title.title_name })}
        text={t("td.vacateText")}
        confirmLabel={t("td.vacate")}
        busy={busy}
        onConfirm={vacate}
        onClose={() => { setDialog(null); setReason(""); }}
      >
        <label className="block mt-3">
          <span className="text-sm font-semibold text-slate-800">{t("td.reason")}</span>
          <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </label>
      </ConfirmDialog>
      <ConfirmDialog
        open={dialog === "delete"}
        title={t("td.deleteTitle", { name: title.title_name })}
        text={t("td.deleteText")}
        confirmLabel={t("td.delete")}
        danger
        busy={busy}
        onConfirm={remove}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}

/**
 * Fighter page (/home/fighters/:id), real data only (owner, 2026-09-30): photo or initials, names, club,
 * status, weight class, record (career before this system + results recorded here), and four tabs —
 * Overview (next bout, latest results, profile) · Fights (every bout with the real result) · Videos (linked
 * to this fighter) · Titles (titles held + title fights). Edit, Activate (a draft) and Delete (Super Admin).
 * No invented stats, biography, training or medical data. English + Khmer.
 * See claude/updates/admin-fighters-clubs.md.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, Crown, MoreHorizontal, Pencil, PlayCircle, Swords, Trash2, Trophy } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { formatDay, useT } from "../i18n/program";
import { ConfirmDialog, Initials, LangSwitch } from "../components/program/shared";
import { FighterReviewActions } from "../components/FighterReview";
import { FighterStatusChip, RecordText } from "../components/fighters/FighterTable";
import { PrivateDetailsView, issueTexts } from "../components/fighters/PrivateDetails";
import { nationalityLabel, withEventNames, ageOf, boutsOf, classFor, className, isRealPhoto, isUnverified, nextBout, opponentOf, outcomeFor, recordParts, weightOf, type Outcome } from "../components/fighters/fighterUtils";

type Tab = "overview" | "fights" | "videos" | "titles" | "private";

export function FighterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const permissions = usePermissions();
  const me = api.auth.getCurrentUser();
  const isStaff = me?.role === "Super Admin" || me?.role === "KKF Officer";
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<{ fighter: any; bouts: any[]; classes: any[]; videos: any[]; titles: any[] } | null | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  // Private details (ID / emergency contact / medical): KKF staff only — claude/features/fighter-personal-records.md
  const [priv, setPriv] = useState<any | null>(null);
  const [privFailed, setPrivFailed] = useState(false);

  const load = () => {
    Promise.all([
      api.fighters.get(id!),
      api.matches.list().catch(() => []),
      api.settingsLists.list("weight-classes").catch(() => []),
      api.videos.list().catch(() => []),
      api.champions.list().catch(() => []),
      api.events.list().catch(() => []),
    ])
      .then(([fighter, bouts, classes, videos, titles, events]) => setData({ fighter, bouts: withEventNames(bouts, events), classes, videos, titles }))
      .catch(() => setData(null));
  };
  useEffect(() => { setData(undefined); load(); }, [id]);
  useEffect(() => {
    setPriv(null);
    setPrivFailed(false);
    if (isStaff) api.fighters.privateGet(id!).then(setPriv).catch(() => setPrivFailed(true));
  }, [id]);

  const view = useMemo(() => {
    if (!data) return null;
    const f = data.fighter;
    const mine = boutsOf(f.id, data.bouts);
    return {
      bouts: mine,
      next: nextBout(f.id, data.bouts),
      results: mine.filter((b) => outcomeFor(b, f.id)),
      videos: data.videos.filter((v) => v.fighter_id === f.id && !v.deleted_at),
      held: data.titles.filter((c) => c.current_holder_id === f.id),
      titleFights: mine.filter((b) => b.is_title_match || b.isTitleMatch),
    };
  }, [data]);

  if (data === undefined) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;
  if (data === null || !view)
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-4">
        <p className="text-slate-700">{t("fp.loadFailed")}</p>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => { setData(undefined); load(); }} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
          <Link to="/home/fighters" className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 inline-flex items-center">{t("fp.back")}</Link>
        </div>
      </div>
    );

  const f = data.fighter;
  const kg = weightOf(f);
  const cls = classFor(kg, data.classes);
  const age = ageOf(f.dateOfBirth);
  const total = recordParts(f.record);
  const career = recordParts(f.careerRecord);
  const here = total && career ? [total[0] - career[0], total[1] - career[1], total[2] - career[2]] : null;
  const photo = isRealPhoto(f.image) ? f.image : null;
  const styles = String(f.style || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const styleLabel = (s: string) => (["aggressive", "clinch", "counter", "balanced", "kicking", "boxing"].includes(s) ? t(`style.${s}` as any) : s);

  const remove = async () => {
    setBusy(true);
    try {
      await api.fighters.delete(f.id);
      toast.success(t("fp.deleted", { name: f.name }));
      navigate(f.clubId ? `/home/clubs/${f.clubId}` : "/home/fighters");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: t("fp.tab.overview") },
    { id: "fights", label: t("fp.tab.fights"), count: view.bouts.length },
    { id: "videos", label: t("fp.tab.videos"), count: view.videos.length },
    { id: "titles", label: t("fp.tab.titles"), count: view.held.length + view.titleFights.length },
    ...(isStaff ? [{ id: "private" as Tab, label: t("pv.tab"), count: issueTexts(priv, t).length }] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to={f.clubId ? `/home/clubs/${f.clubId}` : "/home/fighters"} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4" aria-hidden /> {f.clubId ? t("fp.backClub", { club: f.clubName || "" }) : t("fp.back")}
        </Link>
        <LangSwitch />
      </div>

      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-5">
          {photo ? (
            <img src={photo} alt="" className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover object-top bg-slate-100 shrink-0" />
          ) : (
            <Initials name={f.name} size="w-28 h-28 md:w-32 md:h-32 text-3xl" tone="bg-primary/10 text-primary" />
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 break-words">{f.name}</h1>
              <FighterStatusChip status={f.status} />
            </div>
            {f.nameKhmer && <p lang="km" className="text-lg text-slate-700">{f.nameKhmer}</p>}
            {f.alias && <p className="text-base text-slate-600">“{f.alias}”</p>}
            <p className="flex flex-wrap gap-x-5 gap-y-1 text-base text-slate-700">
              {f.clubId ? <Link to={`/home/clubs/${f.clubId}`} className="text-primary font-semibold hover:underline">{f.clubName}</Link> : <span className="text-slate-500">{t("f.noClub")}</span>}
              {kg && <span>{t("common.kg", { n: kg })}{cls ? ` · ${className(cls, lang)}` : ""}</span>}
              {age !== null && <span>{t("fp.age", { n: age })}</span>}
              {f.nationality && <span>{nationalityLabel(f.nationality, lang)}</span>}
            </p>
          </div>
          <div className="flex sm:flex-col items-start gap-2 shrink-0">
            {permissions.hasPermission("fighters.edit") && (
              <Link to={`/home/fighters/${f.id}/edit`} className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary">
                <Pencil className="w-4 h-4" aria-hidden /> {t("common.edit")}
              </Link>
            )}
            {isUnverified(f.status) && isStaff && (
              <FighterReviewActions fighter={f} onDone={() => load()} />
            )}
            {permissions.hasPermission("fighters.delete") && (
              <div className="relative">
                <button type="button" onClick={() => setMoreOpen((o) => !o)} aria-expanded={moreOpen} aria-label={t("common.more")} className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-primary">
                  <MoreHorizontal className="w-5 h-5" aria-hidden />
                </button>
                {moreOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg z-20 py-1" onMouseLeave={() => setMoreOpen(false)}>
                    <button type="button" onClick={() => { setMoreOpen(false); setConfirmDelete(true); }} className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 inline-flex items-center gap-2">
                      <Trash2 className="w-4 h-4" aria-hidden /> {t("fp.delete")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Record */}
        <div className="mt-5 grid sm:grid-cols-[auto_minmax(0,1fr)] gap-4 items-center rounded-xl bg-slate-50 border border-slate-200 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-600">{t("fp.record")}</p>
            <p className="text-3xl"><RecordText record={f.record} /></p>
            <p className="text-xs text-slate-500">{t("f.recordLabel")}</p>
          </div>
          <p className="text-sm text-slate-600">
            {career && here ? t("fp.recordSplit", { career: f.careerRecord, here: here.join("-") }) : t("fp.recordHint")}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div role="tablist" className="flex flex-wrap gap-2">
        {tabs.map((x) => (
          <button key={x.id} role="tab" aria-selected={tab === x.id} type="button" onClick={() => setTab(x.id)} className={`h-11 px-4 rounded-xl text-sm font-semibold border ${tab === x.id ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
            {x.label}{x.count ? <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${tab === x.id ? "bg-white/20" : "bg-slate-100"}`}>{x.count}</span> : null}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-5">
          <div className="space-y-5">
            <Card title={t("fp.next")} icon={<CalendarDays className="w-5 h-5 text-primary" aria-hidden />}>
              {view.next ? <BoutRow b={view.next} fighterId={f.id} /> : <p className="text-base text-slate-600">{t("fp.noNext")}</p>}
            </Card>
            <Card title={t("fp.latest")} icon={<Swords className="w-5 h-5 text-primary" aria-hidden />}>
              {view.results.length === 0 ? <p className="text-base text-slate-600">{t("fp.noResults")}</p> : (
                <ul className="divide-y divide-slate-100 -my-2">{view.results.slice(0, 3).map((b) => <li key={b.id} className="py-2"><BoutRow b={b} fighterId={f.id} /></li>)}</ul>
              )}
            </Card>
          </div>
          <Card title={t("fp.profile")}>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-base">
              {[
                [t("fp.born"), f.dateOfBirth ? formatDay(f.dateOfBirth, lang, false) : null],
                [t("fp.gender"), f.gender ? t(`gender.${f.gender}` as any) : null],
                [t("fp.height"), Number(f.height) > 0 ? t("fp.cm", { n: f.height }) : null],
                [t("fp.weight"), kg ? t("common.kg", { n: kg }) : null],
                [t("fp.class"), cls ? className(cls, lang) : null],
                [t("fp.grade"), f.grade || null],
                [t("fp.styles"), styles.length ? styles.map(styleLabel).join(", ") : null],
                [t("fp.province"), f.province || null],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} className="contents"><dt className="text-slate-500">{k}</dt><dd className="text-slate-900 break-words">{v}</dd></div>
              ))}
            </dl>
          </Card>
        </div>
      )}

      {tab === "fights" && (
        view.bouts.length === 0 ? <Empty text={t("fp.noFights")} /> : (
          <ul className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
            {view.bouts.map((b) => <li key={b.id} className="p-4"><BoutRow b={b} fighterId={f.id} /></li>)}
          </ul>
        )
      )}

      {tab === "videos" && (
        view.videos.length === 0 ? <Empty text={t("fp.noVideos")} /> : (
          <ul className="grid sm:grid-cols-2 gap-4">
            {view.videos.map((v) => (
              <li key={v.id}>
                <a href={v.youtube_url || "#"} target="_blank" rel="noopener noreferrer" className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-primary">
                  {isRealPhoto(v.thumbnail) ? <img src={v.thumbnail} alt="" className="w-32 h-20 rounded-lg object-cover bg-slate-100 shrink-0" /> : <span className="w-32 h-20 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><PlayCircle className="w-7 h-7 text-slate-400" aria-hidden /></span>}
                  <span className="min-w-0">
                    <span className="block text-base font-semibold text-slate-900 break-words">{v.title}</span>
                    <span className="block text-sm text-slate-600">{v.status === "Published" ? t("fp.videoPublic") : t("fp.videoDraft")}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )
      )}

      {tab === "private" && isStaff && <PrivateDetailsView fighterId={f.id} data={priv} error={privFailed} />}

      {tab === "titles" && (
        view.held.length + view.titleFights.length === 0 ? <Empty text={t("fp.noTitles")} /> : (
          <div className="space-y-5">
            {view.held.length > 0 && (
              <Card title={t("fp.holds")} icon={<Crown className="w-5 h-5 text-amber-600" aria-hidden />}>
                <ul className="space-y-2">
                  {view.held.map((c) => (
                    <li key={c.id}><Link to={`/home/champion/${c.id}`} className="text-base font-semibold text-primary hover:underline">{c.title_name}</Link>{Number(c.defense_count) > 0 && <span className="text-sm text-slate-600"> · {t("club.defenses", { n: c.defense_count })}</span>}</li>
                  ))}
                </ul>
              </Card>
            )}
            {view.titleFights.length > 0 && (
              <Card title={t("fp.titleFights")} icon={<Trophy className="w-5 h-5 text-amber-600" aria-hidden />}>
                <ul className="divide-y divide-slate-100 -my-2">{view.titleFights.map((b) => <li key={b.id} className="py-2"><BoutRow b={b} fighterId={f.id} /></li>)}</ul>
              </Card>
            )}
          </div>
        )
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={t("fp.deleteTitle", { name: f.name })}
        text={t("fp.deleteText")}
        confirmLabel={t("fp.delete")}
        danger
        busy={busy}
        onConfirm={remove}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">{icon}{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-base text-slate-600">{text}</p>;
}

const OUT_TONE: Record<Outcome, string> = {
  win: "bg-emerald-50 text-emerald-700",
  loss: "bg-red-50 text-red-700",
  draw: "bg-amber-50 text-amber-800",
  nc: "bg-slate-100 text-slate-600",
};

/** One bout for this fighter: date, opponent, fight night, and the real result (method · round). */
function BoutRow({ b, fighterId }: { b: any; fighterId: string }) {
  const { t, lang } = useT();
  const o = outcomeFor(b, fighterId);
  const upcoming = !o && new Date(String(b.date).slice(0, 10) + "T00:00:00Z").getTime() >= new Date(new Date().toISOString().slice(0, 10)).getTime();
  const method = b.winner_method && !/^(draw|no contest)$/i.test(b.winner_method) ? String(b.winner_method) : null;
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-base font-semibold text-slate-900 break-words">
          {t("fp.vs", { name: opponentOf(b, fighterId) || "—" })}
          {(b.is_title_match || b.isTitleMatch) && <span className="ml-2 inline-flex items-center gap-1 text-sm text-amber-700"><Trophy className="w-4 h-4" aria-hidden />{b.championshipTitleName || t("common.titleFight")}</span>}
        </p>
        <p className="text-sm text-slate-600">
          {formatDay(b.date, lang, false)}
          {b.event_id && <> · <Link to={`/home/events/${b.event_id}`} className="text-primary hover:underline">{b.event_name || t("fp.fightNight")}</Link></>}
          {method && ` · ${method}${b.winner_round ? ` · ${t("fp.round", { n: b.winner_round })}` : ""}`}
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${o ? OUT_TONE[o] : "bg-blue-50 text-primary"}`}>
        {o ? t(`out.${o}` as any) : upcoming ? t("out.upcoming") : t("out.pending")}
      </span>
    </div>
  );
}

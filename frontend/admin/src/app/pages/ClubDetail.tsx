/**
 * Club page (/home/clubs/:id), light and real data only: logo or initials, name, location, head coach,
 * founded year (only when entered), contact, about; titles the club's fighters hold (from Champions);
 * the club's fighters in the shared compact list with "Register a fighter for this club"; the club's
 * upcoming bouts and latest results. No ratings, no invented champions or years.
 * English + Khmer. See claude/updates/admin-fighters-clubs.md.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, CalendarDays, Crown, Mail, MapPin, Pencil, Phone, Plus, User } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { formatDay, useT } from "../i18n/program";
import { Initials, LangSwitch } from "../components/program/shared";
import { FighterTable } from "../components/fighters/FighterTable";
import { hasResult, isRealPhoto, isUnverified, outcomeFor, withEventNames } from "../components/fighters/fighterUtils";

const dayOf = (v?: string | null) => (v ? new Date(String(v).slice(0, 10) + "T00:00:00Z").getTime() : NaN);

export function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const permissions = usePermissions();
  const [data, setData] = useState<{ club: any; fighters: any[]; bouts: any[]; classes: any[]; titles: any[] } | null | undefined>(undefined);

  const load = () => {
    setData(undefined);
    Promise.all([
      api.clubs.get(id!),
      api.fighters.list(undefined, id!),
      api.matches.list().catch(() => []),
      api.settingsLists.list("weight-classes").catch(() => []),
      api.champions.list().catch(() => []),
      api.events.list().catch(() => []),
    ])
      .then(([club, fighters, bouts, classes, titles, events]) => setData({ club, fighters, bouts: withEventNames(bouts, events), classes, titles }))
      .catch(() => setData(null));
  };
  useEffect(load, [id]);

  const view = useMemo(() => {
    if (!data) return null;
    const ids = new Set(data.fighters.map((f) => f.id));
    const clubBouts = data.bouts.filter((b) => ids.has(b.fighter_a_id) || ids.has(b.fighter_b_id));
    const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
    return {
      active: data.fighters.filter((f) => !isUnverified(f.status) && (f.status ?? "Active") === "Active").length,
      titles: data.titles.filter((c) => c.current_holder_id && ids.has(c.current_holder_id)),
      upcoming: clubBouts.filter((b) => !hasResult(b) && dayOf(b.date) >= today).sort((a, b) => dayOf(a.date) - dayOf(b.date)).slice(0, 5),
      results: clubBouts.filter(hasResult).sort((a, b) => dayOf(b.date) - dayOf(a.date)).slice(0, 5),
      ids,
    };
  }, [data]);

  if (data === undefined) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;
  if (data === null || !view)
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-4">
        <p className="text-slate-700">{t("club.loadFailed")}</p>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={load} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
          <Link to="/home/clubs" className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 inline-flex items-center">{t("club.back")}</Link>
        </div>
      </div>
    );

  const { club } = data;
  const logo = isRealPhoto(club.logo_url) ? club.logo_url : null;
  const register = `/home/fighters/kunkhmer/new?clubId=${club.id}`;
  const canRegister = permissions.hasPermission("fighters.create");
  const facts = [
    club.location ? <span key="l" className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" aria-hidden /> {club.location}</span> : null,
    club.head_coach ? <span key="c" className="inline-flex items-center gap-1.5"><User className="w-4 h-4" aria-hidden /> {t("club.coach", { name: club.head_coach })}</span> : null,
    club.established ? <span key="e" className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4" aria-hidden /> {t("club.since", { year: club.established })}</span> : null,
  ].filter(Boolean);
  const boutLine = (b: any) => `${b.fighter_a_name || "—"} ${t("club.vs")} ${b.fighter_b_name || "—"}`;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between gap-3">
        <Link to="/home/clubs" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4" aria-hidden /> {t("club.back")}
        </Link>
        <LangSwitch />
      </div>

      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 flex flex-col md:flex-row md:items-start gap-5 shadow-sm">
        {logo ? (
          <img src={logo} alt="" className="w-20 h-20 rounded-2xl object-contain bg-white border border-slate-200 shrink-0" />
        ) : (
          <Initials name={club.name} size="w-20 h-20 text-2xl" tone="bg-primary/10 text-primary" />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 break-words">{club.name}</h1>
            {club.status && club.status !== "active" && <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-semibold">{t(club.status === "inactive" ? "club.inactive" : "club.pending")}</span>}
          </div>
          {club.name_khmer && <p lang="km" className="text-lg text-slate-700">{club.name_khmer}</p>}
          {facts.length > 0 && <p className="flex flex-wrap gap-x-5 gap-y-1 text-base text-slate-600">{facts}</p>}
          <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-700 pt-1">
            <span><strong className="text-slate-900">{view.active}</strong> {t("club.activeFighters")}</span>
            {view.titles.length > 0 && <span><strong className="text-slate-900">{view.titles.length}</strong> {t("club.titlesHeld")}</span>}
            {view.upcoming.length > 0 && <span><strong className="text-slate-900">{view.upcoming.length}</strong> {t("club.upcomingBouts")}</span>}
          </p>
        </div>
        {permissions.hasPermission("clubs.edit") && (
          <Link to={`/home/clubs/${club.id}/edit`} className="shrink-0 inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary">
            <Pencil className="w-4 h-4" aria-hidden /> {t("club.edit")}
          </Link>
        )}
      </section>

      {(club.description || club.phone || club.email) && (
        <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-5">
          {club.description ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-slate-900 mb-2">{t("club.about")}</h2>
              <p className="text-base text-slate-700 whitespace-pre-line">{club.description}</p>
            </section>
          ) : <span className="hidden md:block" />}
          {(club.phone || club.email) && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
              <h2 className="text-lg font-bold text-slate-900">{t("club.contact")}</h2>
              {club.phone && <a href={`tel:${club.phone}`} className="flex items-center gap-2 text-base text-primary hover:underline"><Phone className="w-4 h-4" aria-hidden /> {club.phone}</a>}
              {club.email && <a href={`mailto:${club.email}`} className="flex items-center gap-2 text-base text-primary hover:underline break-all"><Mail className="w-4 h-4" aria-hidden /> {club.email}</a>}
            </section>
          )}
        </div>
      )}

      {/* Fighters */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">{t("club.fighters", { n: data.fighters.length })}</h2>
          {canRegister && data.fighters.length > 0 && (
            <Link to={register} className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">
              <Plus className="w-4 h-4" aria-hidden /> {t("club.register")}
            </Link>
          )}
        </div>
        <FighterTable
          fighters={data.fighters}
          bouts={data.bouts}
          classes={data.classes}
          showClub={false}
          canEdit={permissions.hasPermission("fighters.edit")}
          empty={canRegister ? <Link to={register} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold"><Plus className="w-4 h-4" aria-hidden /> {t("club.register")}</Link> : null}
        />
      </section>

      {/* Titles held */}
      {view.titles.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Crown className="w-5 h-5 text-amber-600" aria-hidden /> {t("club.titles")}</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {view.titles.map((c) => (
              <li key={c.id}>
                <Link to={`/home/champion/${c.id}`} className="block rounded-xl border border-amber-200 bg-amber-50/40 p-4 hover:border-amber-300">
                  <p className="text-base font-semibold text-slate-900">{c.title_name}</p>
                  <p className="text-sm text-slate-600">{c.current_holder_name_db || c.current_holder_name}{Number(c.defense_count) > 0 ? ` · ${t("club.defenses", { n: c.defense_count })}` : ""}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Bouts */}
      {(view.upcoming.length > 0 || view.results.length > 0) && (
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { key: "up", title: t("club.upcoming"), rows: view.upcoming },
            { key: "res", title: t("club.results"), rows: view.results },
          ].map((s) => (
            <section key={s.key} className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">{s.title}</h2>
              {s.rows.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">{t("club.nothing")}</p>
              ) : (
                <ul className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
                  {s.rows.map((b) => {
                    const mine = view.ids.has(b.fighter_a_id) ? b.fighter_a_id : b.fighter_b_id;
                    const o = outcomeFor(b, mine);
                    return (
                      <li key={b.id}>
                        <button type="button" onClick={() => navigate(`/home/events/${b.event_id}`)} className="w-full text-left p-4 hover:bg-slate-50 flex items-center justify-between gap-3">
                          <span className="min-w-0">
                            <span className="block text-base font-semibold text-slate-900 break-words">{boutLine(b)}</span>
                            <span className="block text-sm text-slate-600">{formatDay(b.date, lang, false)}{b.event_name ? ` · ${b.event_name}` : ""}</span>
                          </span>
                          {o && <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${o === "win" ? "bg-emerald-50 text-emerald-700" : o === "loss" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>{t(`out.${o}` as any)}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

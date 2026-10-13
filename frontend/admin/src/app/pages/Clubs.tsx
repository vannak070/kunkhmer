/**
 * Clubs (/home/clubs): the federation's gyms and training camps in one compact list — logo or initials, name (and
 * Khmer name), association, place, head coach, number of fighters, status — with search, an Active / Inactive filter,
 * a visible "Edit" button, and Delete (only for a club without fighters) behind a confirmation. English + Khmer.
 * See claude/updates/admin-step3-simple-pages.md.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Building2, MapPin, MoreHorizontal, Pencil, Plus, Search, Trash2, User } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { useT } from "../i18n/program";
import { ConfirmDialog, Initials, LangSwitch } from "../components/program/shared";
import { isRealPhoto } from "../components/fighters/fighterUtils";

type Filter = "all" | "active" | "inactive";

export function Clubs() {
  const { t, lang } = useT();
  const permissions = usePermissions();
  const manage = permissions.hasPermission("clubs.manage");
  const [clubs, setClubs] = useState<any[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [menu, setMenu] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setFailed(false);
    api.clubs.list().then(setClubs).catch(() => setFailed(true));
  };
  useEffect(load, []);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (clubs ?? [])
      .filter((c) => filter === "all" || (c.status || "active").toLowerCase() === filter)
      .filter((c) => !s || [c.name, c.name_khmer, c.location, c.association, c.association_khmer, c.head_coach].some((x) => x && String(x).toLowerCase().includes(s)))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [clubs, q, filter]);

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await api.clubs.delete(toDelete.id);
      toast.success(t("cl.deleted", { name: toDelete.name }));
      setClubs((prev) => (prev ?? []).filter((c) => c.id !== toDelete.id));
      setToDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  const tab = (key: Filter, label: string) => (
    <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`h-10 px-4 rounded-xl text-sm font-semibold border ${filter === key ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
      {label}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden><Building2 className="w-6 h-6" /></span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("cl.title")}</h1>
            <p className="text-base text-slate-600 mt-1">{t("cl.lead")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LangSwitch />
          {manage && (
            <Link to="/home/clubs/new" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">
              <Plus className="w-4 h-4" aria-hidden /> {t("cl.add")}
            </Link>
          )}
        </div>
      </header>

      {failed ? (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4">
          <p className="text-amber-900">{t("cl.loadFailed")}</p>
          <button type="button" onClick={load} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
        </div>
      ) : !clubs ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>
      ) : clubs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
          <p className="text-base text-slate-700">{t("cl.none")}</p>
          {manage && <Link to="/home/clubs/new" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold"><Plus className="w-4 h-4" aria-hidden /> {t("cl.add")}</Link>}
        </div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="flex gap-2">{[tab("all", t("f.origin.all")), tab("active", t("cl.active")), tab("inactive", t("cl.inactive"))]}</div>
            <label className="relative block flex-1">
              <span className="sr-only">{t("cl.search")}</span>
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("cl.search")} className="w-full h-11 rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </label>
          </div>
          <p className="text-sm text-slate-600">{t("cl.count", { n: rows.length })}</p>

          {rows.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">{t("cl.noResults")}</p>
          ) : (
            <ul className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
              {rows.map((c) => {
                const logo = isRealPhoto(c.logo_url) ? c.logo_url : null;
                const association = lang === "km" && c.association_khmer ? c.association_khmer : c.association;
                const inactive = (c.status || "active").toLowerCase() === "inactive";
                const n = Number(c.fighters_count ?? 0);
                return (
                  <li key={c.id} className="flex items-center gap-3 p-4 hover:bg-slate-50">
                    <Link to={`/home/clubs/${c.id}`} className="flex flex-1 min-w-0 items-center gap-4">
                      {logo ? <img src={logo} alt="" className="w-14 h-14 rounded-xl object-contain bg-white border border-slate-200 shrink-0" /> : <Initials name={c.name} size="w-14 h-14 text-lg" tone="bg-primary/10 text-primary" />}
                      <span className="min-w-0 space-y-0.5">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold text-slate-900 break-words">{c.name}</span>
                          {inactive && <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs font-semibold">{t("cl.inactive")}</span>}
                        </span>
                        {c.name_khmer && c.name_khmer !== c.name && <span lang="km" className="block text-sm text-slate-600 break-words">{c.name_khmer}</span>}
                        {association && <span lang={lang} className="block text-sm text-slate-600 break-words">{association}</span>}
                        <span className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-slate-600">
                          {c.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="break-words">{c.location}</span></span>}
                          {c.head_coach && <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5 shrink-0" aria-hidden />{c.head_coach}</span>}
                          <span className="font-medium text-slate-700">{t("cl.fighters", { n })}</span>
                        </span>
                      </span>
                    </Link>
                    {manage && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Link to={`/home/clubs/${c.id}/edit`} aria-label={`${t("common.edit")} — ${c.name}`} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                          <Pencil className="w-4 h-4" aria-hidden /> <span className="hidden sm:inline">{t("common.edit")}</span>
                        </Link>
                        <div className="relative">
                          <button type="button" onClick={() => setMenu(menu === c.id ? null : c.id)} aria-expanded={menu === c.id} aria-label={t("common.more")} className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-primary">
                            <MoreHorizontal className="w-5 h-5" aria-hidden />
                          </button>
                          {menu === c.id && (
                            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white shadow-lg z-20 py-1" onMouseLeave={() => setMenu(null)}>
                              {n > 0 ? (
                                <p className="px-4 py-3 text-sm text-slate-600">{t("cl.hasFighters", { n })}</p>
                              ) : (
                                <button type="button" onClick={() => { setMenu(null); setToDelete(c); }} className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 inline-flex items-center gap-2">
                                  <Trash2 className="w-4 h-4" aria-hidden /> {t("cl.delete")}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={t("cl.deleteTitle", { name: toDelete?.name ?? "" })}
        text={t("cl.deleteText")}
        confirmLabel={t("cl.delete")}
        danger
        busy={busy}
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}

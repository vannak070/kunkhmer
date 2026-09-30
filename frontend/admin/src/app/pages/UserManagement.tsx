/**
 * Staff accounts (Super Admin): who can sign in to the management system and what they can do.
 * Real data from /api/users. Deactivate is the normal way to remove access (history stays);
 * "Delete permanently" is for mistakes and duplicates. You can't deactivate, demote or delete yourself.
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  AlertTriangle, ChevronDown, Info, KeyRound, Pencil, Search, ShieldCheck, Trash2, UserMinus,
  UserPlus, UserRoundCheck, Users as UsersIcon, Wand2,
} from "lucide-react";
import { api } from "../utils/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { APPROVALS_ENABLED } from "../config/features";

interface StaffUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  clubId: string | null;
  status: string;
  lastLogin: string | null;
  createdAt: string | null;
}

interface Club { id: string; name: string }

/** Roles the API accepts, with a plain-language description for the picker and the guide. */
const ROLES: { value: string; description: string; tone: string }[] = [
  { value: "Super Admin", description: "Full access, including staff accounts and system settings.", tone: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "KKF Officer", description: APPROVALS_ENABLED ? "Federation staff: verify fighters, record results and titles, manage news and partners." : "Federation staff: run events, fight cards, bouts, fighters, results and titles; manage news and partners.", tone: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "Organizer", description: APPROVALS_ENABLED ? "Creates and runs events, fight cards and matches." : "Read-only for now: sees events, fight cards and fighters (KKF staff run the program).", tone: "bg-amber-50 text-amber-800 border-amber-200" },
  { value: "Club/Gym", description: APPROVALS_ENABLED ? "Tied to one club: manages that club's fighters and responds to its matches." : "Tied to one club. Read-only for now: sees events, fight cards and fighters.", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "Referee", description: "Match official account (no editing access yet).", tone: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "Judge", description: "Match official account (no editing access yet).", tone: "bg-slate-100 text-slate-700 border-slate-200" },
];
const roleTone = (role: string) => ROLES.find((r) => r.value === role)?.tone ?? "bg-slate-100 text-slate-700 border-slate-200";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function timeAgo(value: string | null): string {
  if (!value) return "Never";
  const then = new Date(value).getTime();
  if (isNaN(then)) return "—";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

// ─── Add / edit form ────────────────────────────────────────────────────────

interface FormState {
  fullName: string;
  username: string;
  email: string;
  role: string;
  clubId: string;
  password: string;
  active: boolean;
}

const emptyForm: FormState = { fullName: "", username: "", email: "", role: "KKF Officer", clubId: "", password: "", active: true };

function UserDialog({ open, user, isSelf, clubs, onClose, onSaved, onDelete }: {
  open: boolean;
  user: StaffUser | null;
  isSelf: boolean;
  clubs: Club[];
  onClose: () => void;
  onSaved: (u: StaffUser) => void;
  onDelete: (u: StaffUser) => void;
}) {
  const editing = Boolean(user);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setShowPassword(false);
    setForm(user
      ? { fullName: user.fullName, username: user.username, email: user.email, role: user.role, clubId: user.clubId ?? "", password: "", active: user.status === "Active" }
      : { ...emptyForm, password: generatePassword() });
  }, [open, user]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.fullName.trim()) e.fullName = "Enter their full name.";
    if (!form.username.trim()) e.username = "Choose a username they will sign in with.";
    else if (/\s/.test(form.username.trim())) e.username = "Usernames can't contain spaces.";
    if (!EMAIL.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (form.role === "Club/Gym" && !form.clubId) e.clubId = "Pick the club this account belongs to.";
    if (!editing && form.password.length < MIN_PASSWORD) e.password = `At least ${MIN_PASSWORD} characters.`;
    if (editing && form.password && form.password.length < MIN_PASSWORD) e.password = `At least ${MIN_PASSWORD} characters.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      fullName: form.fullName.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      role: form.role,
      clubId: form.role === "Club/Gym" ? form.clubId : null,
    };
    try {
      let saved: StaffUser;
      if (editing && user) {
        if (!isSelf) body.status = form.active ? "Active" : "Inactive";
        if (isSelf) delete body.role;
        if (form.password) body.password = form.password;
        saved = await api.auth.updateUser(user.id, body);
        toast.success(`${saved.fullName} was updated`);
      } else {
        saved = await api.auth.createUser({ ...body, password: form.password, status: "Active" });
        toast.success(`${saved.fullName} can now sign in`, { description: `Username: ${saved.username}. Share the password with them privately.` });
      }
      onSaved(saved);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const field = "w-full h-11 px-3 rounded-xl border bg-white text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";
  const border = (k: keyof FormState) => (errors[k] ? "border-red-400" : "border-slate-300");
  const Err = ({ k }: { k: keyof FormState }) => (errors[k] ? <p className="mt-1 text-xs text-red-600">{errors[k]}</p> : null);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{editing ? `Edit ${user?.fullName}` : "Add a staff member"}</DialogTitle>
          <DialogDescription>
            {editing ? "Change their details, role or access." : "They'll sign in to the management system with the username and password below."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="u-name">Full name</label>
            <input id="u-name" className={`${field} ${border("fullName")}`} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="e.g. Sok Dara" />
            <Err k="fullName" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="u-username">Username</label>
              <input id="u-username" className={`${field} ${border("username")}`} value={form.username} onChange={(e) => set("username", e.target.value)} autoComplete="off" placeholder="e.g. dara.sok" />
              <Err k="username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="u-email">Email</label>
              <input id="u-email" type="email" className={`${field} ${border("email")}`} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@kkf.gov.kh" />
              <Err k="email" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="u-role">Role</label>
            <div className="relative">
              <select id="u-role" disabled={isSelf} className={`${field} ${border("role")} appearance-none pr-10 disabled:bg-slate-50 disabled:text-slate-500`} value={form.role} onChange={(e) => set("role", e.target.value)}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.value}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {isSelf ? "You can't change your own role." : ROLES.find((r) => r.value === form.role)?.description}
            </p>
          </div>

          {form.role === "Club/Gym" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="u-club">Club</label>
              <div className="relative">
                <select id="u-club" className={`${field} ${border("clubId")} appearance-none pr-10`} value={form.clubId} onChange={(e) => set("clubId", e.target.value)}>
                  <option value="">Select a club…</option>
                  {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden />
              </div>
              <Err k="clubId" />
            </div>
          )}

          {editing && !showPassword ? (
            <button type="button" onClick={() => { setShowPassword(true); set("password", generatePassword()); }} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4">
              <KeyRound className="w-4 h-4" aria-hidden />
              Reset their password
            </button>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="u-password">{editing ? "New password" : "Password"}</label>
              <div className="flex gap-2">
                <input id="u-password" className={`${field} ${border("password")} font-mono`} value={form.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" />
                <button type="button" onClick={() => set("password", generatePassword())} title="Generate a strong password" className="h-11 px-3 rounded-xl border border-slate-300 hover:border-primary text-slate-600 hover:text-primary inline-flex items-center gap-1.5 text-sm shrink-0">
                  <Wand2 className="w-4 h-4" aria-hidden /> New
                </button>
              </div>
              <Err k="password" />
              <p className="mt-1 text-xs text-slate-500">
                {editing ? "They'll be signed out and must use this new password." : "Copy it now and share it with them privately; they can change it on their Profile page."}
              </p>
            </div>
          )}

          {editing && (
            <label className={`flex items-start gap-3 rounded-xl border p-3 ${isSelf ? "bg-slate-50 border-slate-200" : "border-slate-200 cursor-pointer"}`}>
              <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#0A3D91]" checked={form.active} disabled={isSelf} onChange={(e) => set("active", e.target.checked)} />
              <span>
                <span className="block text-sm font-medium text-slate-800">Can sign in</span>
                <span className="block text-xs text-slate-500">{isSelf ? "You can't deactivate your own account." : "Untick to deactivate: they're signed out and can't sign in, but their history stays."}</span>
              </span>
            </label>
          )}

          <DialogFooter className="gap-2 sm:gap-2 pt-2 flex-col-reverse sm:flex-row sm:justify-between">
            {editing && user && !isSelf ? (
              <button type="button" onClick={() => onDelete(user)} className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4" aria-hidden /> Delete permanently
              </button>
            ) : <span />}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving} className="h-11 px-5 rounded-xl bg-primary hover:bg-[#083073] disabled:opacity-60 text-white text-sm font-semibold">
                {saving ? "Saving…" : editing ? "Save changes" : "Add staff member"}
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Confirm dialog ─────────────────────────────────────────────────────────

function Confirm({ open, title, body, confirmLabel, danger, busy, onConfirm, onClose }: {
  open: boolean; title: string; body: React.ReactNode; confirmLabel: string; danger?: boolean; busy?: boolean;
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {danger && <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden />}
            {title}
          </DialogTitle>
          <DialogDescription asChild><div className="text-sm text-slate-600 space-y-2">{body}</div></DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="button" disabled={busy} onClick={onConfirm} className={`h-11 px-5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-[#083073]"}`}>
            {busy ? "Working…" : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "active" | "inactive";

export function UserManagement() {
  const me = api.auth.getCurrentUser() as StaffUser | null;
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const [users, setUsers] = useState<StaffUser[] | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [showGuide, setShowGuide] = useState(false);
  const [dialog, setDialog] = useState<{ open: boolean; user: StaffUser | null }>({ open: false, user: null });
  const [confirm, setConfirm] = useState<{ kind: "deactivate" | "reactivate" | "delete"; user: StaffUser } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoadError(null);
    api.auth.listUsers().then(setUsers).catch((e) => setLoadError(e instanceof Error ? e.message : "Could not load staff accounts."));
  };

  useEffect(() => {
    load();
    api.clubs.list().then((c: any[]) => setClubs((c || []).map((x) => ({ id: x.id, name: x.name })))).catch(() => setClubs([]));
  }, []);

  // Old deep links (/user-management/new, /:id, /:id/edit) open the matching dialog.
  useEffect(() => {
    if (!users) return;
    if (location.pathname.endsWith("/new")) setDialog({ open: true, user: null });
    else if (userId) {
      const u = users.find((x) => x.id === userId);
      if (u) setDialog({ open: true, user: u });
    }
  }, [users, userId, location.pathname]);

  const closeDialog = () => {
    setDialog({ open: false, user: null });
    if (location.pathname !== "/home/user-management") navigate("/home/user-management", { replace: true });
  };

  const counts = useMemo(() => ({
    all: users?.length ?? 0,
    active: users?.filter((u) => u.status === "Active").length ?? 0,
    inactive: users?.filter((u) => u.status !== "Active").length ?? 0,
  }), [users]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (users ?? []).filter((u) =>
      (role === "all" || u.role === role) &&
      (status === "all" || (status === "active" ? u.status === "Active" : u.status !== "Active")) &&
      (!q || [u.fullName, u.username, u.email].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [users, query, role, status]);

  const clubName = (id: string | null) => (id ? clubs.find((c) => c.id === id)?.name : null);

  const upsert = (saved: StaffUser) => {
    setUsers((list) => {
      const rest = (list ?? []).filter((u) => u.id !== saved.id);
      return [saved, ...rest].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    });
    closeDialog();
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    const { kind, user } = confirm;
    try {
      if (kind === "delete") {
        await api.auth.deleteUser(user.id);
        setUsers((l) => (l ?? []).filter((u) => u.id !== user.id));
        toast.success(`${user.fullName} was deleted`);
        closeDialog();
      } else {
        const saved = await api.auth.updateUser(user.id, { status: kind === "deactivate" ? "Inactive" : "Active" });
        setUsers((l) => (l ?? []).map((u) => (u.id === saved.id ? saved : u)));
        toast.success(kind === "deactivate" ? `${user.fullName} can no longer sign in` : `${user.fullName} can sign in again`);
      }
      setConfirm(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const StatusPill = ({ u }: { u: StaffUser }) =>
    u.status === "Active" ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active</span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Deactivated</span>
    );

  const Actions = ({ u }: { u: StaffUser }) => {
    const self = u.id === me?.id;
    return (
      <div className="flex items-center justify-end gap-1">
        <button type="button" onClick={() => setDialog({ open: true, user: u })} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
          <Pencil className="w-4 h-4" aria-hidden /> Edit
        </button>
        {!self && (u.status === "Active" ? (
          <button type="button" onClick={() => setConfirm({ kind: "deactivate", user: u })} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700">
            <UserMinus className="w-4 h-4" aria-hidden /> Deactivate
          </button>
        ) : (
          <button type="button" onClick={() => setConfirm({ kind: "reactivate", user: u })} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50">
            <UserRoundCheck className="w-4 h-4" aria-hidden /> Reactivate
          </button>
        ))}
      </div>
    );
  };

  const Person = ({ u }: { u: StaffUser }) => (
    <div className="flex items-center gap-3 min-w-0">
      <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${u.status === "Active" ? "bg-[#eef3fb] text-primary" : "bg-slate-100 text-slate-400"}`}>{initials(u.fullName)}</span>
      <div className="min-w-0">
        <p className="font-semibold text-slate-900 truncate">
          {u.fullName}
          {u.id === me?.id && <span className="ml-2 align-middle text-[11px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">You</span>}
        </p>
        <p className="text-xs text-slate-500 truncate">@{u.username} · {u.email}</p>
      </div>
    </div>
  );

  const filterBtn = (key: StatusFilter, label: string) => (
    <button
      type="button"
      onClick={() => setStatus(key)}
      aria-pressed={status === key}
      className={`h-10 px-4 rounded-xl text-sm font-medium border transition ${status === key ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}
    >
      {label} <span className={status === key ? "text-white/70" : "text-slate-400"}>{counts[key]}</span>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <UsersIcon className="w-7 h-7 text-primary" aria-hidden /> Staff accounts
          </h1>
          <p className="text-slate-600 mt-1">People who can sign in to the management system, and what each of them can do.</p>
        </div>
        <button type="button" onClick={() => setDialog({ open: true, user: null })} className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-[#083073] text-white font-semibold shadow-sm">
          <UserPlus className="w-5 h-5" aria-hidden /> Add staff member
        </button>
      </header>

      {/* Roles guide */}
      <section className="rounded-2xl border border-[#d5e0f3] bg-[#f5f8fd]">
        <button type="button" onClick={() => setShowGuide((s) => !s)} aria-expanded={showGuide} className="w-full flex items-center gap-3 px-5 py-3.5 text-left">
          <Info className="w-5 h-5 text-primary shrink-0" aria-hidden />
          <span className="flex-1 text-sm font-medium text-slate-800">What can each role do?</span>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showGuide ? "rotate-180" : ""}`} aria-hidden />
        </button>
        {showGuide && (
          <ul className="grid sm:grid-cols-2 gap-3 px-5 pb-5">
            {ROLES.map((r) => (
              <li key={r.value} className="rounded-xl bg-white border border-slate-200 p-3">
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md border ${r.tone}`}>{r.value}</span>
                <p className="mt-1.5 text-sm text-slate-600">{r.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, username or email" aria-label="Search staff" className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
        </div>
        <div className="relative">
          <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role" className="h-10 w-full lg:w-48 pl-3 pr-9 rounded-xl border border-slate-200 bg-white text-sm appearance-none outline-none focus:border-primary">
            <option value="all">All roles</option>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.value}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {filterBtn("all", "All")}
          {filterBtn("active", "Active")}
          {filterBtn("inactive", "Deactivated")}
        </div>
      </div>

      {/* List */}
      {loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700 font-medium">{loadError}</p>
          <button type="button" onClick={load} className="mt-3 h-10 px-4 rounded-xl bg-white border border-red-200 text-sm font-medium text-red-700">Try again</button>
        </div>
      ) : !users ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-medium text-slate-800">No staff accounts match these filters.</p>
          <button type="button" onClick={() => { setQuery(""); setRole("all"); setStatus("all"); }} className="mt-2 text-sm font-medium text-primary hover:underline">Clear filters</button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Person</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Last sign-in</th>
                  <th className="px-5 py-3 text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 max-w-[320px]"><Person u={u} /></td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md border ${roleTone(u.role)}`}>{u.role}</span>
                      {u.role === "Club/Gym" && <p className="text-xs text-slate-500 mt-1 truncate max-w-[180px]">{clubName(u.clubId) ?? "No club set"}</p>}
                    </td>
                    <td className="px-5 py-3.5"><StatusPill u={u} /></td>
                    <td className="px-5 py-3.5 text-slate-600">{timeAgo(u.lastLogin)}</td>
                    <td className="px-5 py-3.5"><Actions u={u} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phone cards */}
          <ul className="md:hidden space-y-3">
            {visible.map((u) => (
              <li key={u.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <Person u={u} />
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md border ${roleTone(u.role)}`}>{u.role}</span>
                  <StatusPill u={u} />
                  <span className="text-xs text-slate-500">Last sign-in: {timeAgo(u.lastLogin)}</span>
                </div>
                <div className="border-t border-slate-100 pt-2"><Actions u={u} /></div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" aria-hidden /> Showing {visible.length} of {counts.all} accounts. Only Super Admins can see this page.</p>
        </>
      )}

      <UserDialog
        open={dialog.open}
        user={dialog.user}
        isSelf={dialog.user?.id === me?.id}
        clubs={clubs}
        onClose={closeDialog}
        onSaved={upsert}
        onDelete={(u) => setConfirm({ kind: "delete", user: u })}
      />

      <Confirm
        open={confirm?.kind === "deactivate"}
        title={`Deactivate ${confirm?.user.fullName ?? ""}?`}
        body={<><p>They'll be signed out right away and won't be able to sign in.</p><p>Their history stays, and you can reactivate them at any time.</p></>}
        confirmLabel="Deactivate"
        danger
        busy={busy}
        onConfirm={runConfirm}
        onClose={() => setConfirm(null)}
      />
      <Confirm
        open={confirm?.kind === "reactivate"}
        title={`Reactivate ${confirm?.user.fullName ?? ""}?`}
        body={<p>They'll be able to sign in again with their existing password.</p>}
        confirmLabel="Reactivate"
        busy={busy}
        onConfirm={runConfirm}
        onClose={() => setConfirm(null)}
      />
      <Confirm
        open={confirm?.kind === "delete"}
        title={`Delete ${confirm?.user.fullName ?? ""} permanently?`}
        body={<><p>This removes the account for good and can't be undone.</p><p>To keep their history, <strong>deactivate</strong> them instead.</p></>}
        confirmLabel="Delete permanently"
        danger
        busy={busy}
        onConfirm={runConfirm}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}

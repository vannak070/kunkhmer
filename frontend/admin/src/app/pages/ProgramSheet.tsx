/**
 * Program sheet (/events/:id/sheet): the official program of one match (a show) as KKF issues it — letterhead, the
 * broadcaster and sponsor logos, the match title, date, time and venue, the bout table (red corner · weight · blue corner)
 * and room for the signature and stamp, which KKF adds by hand after printing. It is printed from the browser
 * (Print → Save as PDF), A4. Version = 1 + the number of recorded changes (replacements, postponement…).
 * claude/features/weekly-program.md (step 3)
 */
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { api } from "../utils/api";
import { khmerDigits } from "../i18n/program";
import kkfLogo from "../../assets/modern_logo.webp";

const KM_MONTHS = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
/** The labels as they appear on KKF's printed programs. */
const LABEL_KM: Record<string, string> = {
  friendly: "គូមិត្តភាព",
  international: "គូអន្តរជាតិ",
  youth: "គូថ្នាលគុនខ្មែរ",
  qualifier: "គូវគ្គជម្រុះ",
  final: "វគ្គផ្តាច់ព្រ័ត្រ",
  prize: "គូដណ្តើមពាន និងប្រាក់លាន",
};
const KM_WEEKDAYS = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];

const km = (n: number | string) => khmerDigits(n);
/** "19:00" → "១៩:០០" and the part of day ("ព្រឹក" before noon, "រសៀល" until 17:00, "យប់" after). */
const kmTime = (time: string) => {
  const hour = Number(time.slice(0, 2));
  const part = hour < 12 ? "ព្រឹក" : hour < 17 ? "រសៀល" : "យប់";
  return `${km(time)} ${part}`;
};
const enWeight = (kg: number | string) => String(Number(kg)).replace(".", ",");

function Corner({ fighter, red, from }: { fighter: any; red?: boolean; from?: number | null }) {
  // An empty corner: "winner of bout N" when it waits for a result, otherwise left blank like the paper sheets.
  if (!fighter) return <td className="cell corner">{from ? <p className="club">អ្នកឈ្នះគូទី {km(from)}</p> : null}</td>;
  const foreign = fighter.nationality && fighter.nationality !== "Cambodian";
  const club = fighter.club;
  return (
    <td className="cell corner">
      {foreign ? (
        <>
          <p className="name latin">{String(fighter.name).toUpperCase()}</p>
          <p className="country">({String(fighter.nationality).toUpperCase()})</p>
          {club?.name && <p className="club">{club.name_khmer || club.name}</p>}
        </>
      ) : (
        <>
          <p className="name">{fighter.name_khmer || fighter.name}</p>
          {fighter.name_khmer && fighter.name && fighter.name !== fighter.name_khmer && <p className="en">{fighter.name}</p>}
          {club && <p className="club">{club.name_khmer || club.name}</p>}
          {club?.association_khmer || club?.association ? <p className="club">{club.association_khmer || club.association}</p> : null}
        </>
      )}
      <span className="sr-only">{red ? "red" : "blue"}</span>
    </td>
  );
}

export function ProgramSheet() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ event: any; bouts: any[]; changes: any[] } | null>(null);
  const [failed, setFailed] = useState(false);
  const signedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    if (!id || !signedIn) return;
    Promise.all([api.events.get(id), api.matches.listForEvent(id), api.events.changes(id).catch(() => [])])
      .then(([event, bouts, changes]) => setData({ event, bouts, changes }))
      .catch(() => setFailed(true));
  }, [id, signedIn]);

  if (!signedIn) return <Navigate to="/login" replace />;
  if (failed) return <p className="p-8 text-center text-slate-700">The program couldn't be loaded. <Link className="underline" to="/home/matches">Back to matches</Link></p>;
  if (!data) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const { event, bouts, changes } = data;
  const live = bouts.filter((b) => b.status !== "Cancelled").sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  // Version: 1 + the changes to the program itself (withdrawals, replacements, filled corners, cancelled bouts, postponement).
  const PROGRAM_CHANGES = ["withdraw", "replace", "fill", "cancel_bout", "postpone"];
  const version = 1 + (Array.isArray(changes) ? changes.filter((c: any) => PROGRAM_CHANGES.includes(c.kind)).length : 0);
  const numberOf = new Map(live.map((b, i) => [b.id, i + 1]));
  // A tournament draw prints its list of fighters ("សមាសភាពចាប់ឆ្នោត") above its first bout.
  const drawFighters = (drawId: string) =>
    live.filter((b) => b.draw_id === drawId && !b.slot_a_from && !b.slot_b_from).flatMap((b) => [b.fighter_a, b.fighter_b]).filter(Boolean);
  const firstOfDraw = new Set<string>();
  const seenDraws = new Set<string>();
  for (const b of live) if (b.draw_id && !seenDraws.has(b.draw_id)) { seenDraws.add(b.draw_id); firstOfDraw.add(b.id); }
  const d = new Date(`${String(event.date).slice(0, 10)}T00:00:00Z`);
  const dateKm = `ថ្ងៃ${KM_WEEKDAYS[d.getUTCDay()]} ទី${km(d.getUTCDate())} ខែ${KM_MONTHS[d.getUTCMonth()]} ឆ្នាំ${km(d.getUTCFullYear())}`;
  const station = event.broadcast_station;
  const sponsor = event.main_sponsor;
  const missing = live.filter((b) => !b.fighter_a || !b.fighter_b).length;
  const printed = new Date();

  return (
    <div className="sheet-root bg-slate-100 min-h-screen py-6 print:bg-white print:py-0">
      <style>{`
        .sheet { font-family: "Kantumruy Pro", "Noto Sans Khmer", system-ui, sans-serif; color: #111; width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 12mm 14mm; box-sizing: border-box; }
        .sheet h1, .sheet h2, .sheet p { margin: 0; }
        .head { display: grid; grid-template-columns: 1fr 2fr 1fr; align-items: start; gap: 8px; }
        .head img { max-height: 26mm; max-width: 100%; object-fit: contain; }
        .crown { text-align: center; font-weight: 700; line-height: 1.5; color: #24336f; }
        .fed { margin-top: 2mm; font-weight: 700; color: #24336f; }
        .title { text-align: center; margin-top: 3mm; font-weight: 700; line-height: 1.6; }
        .title .show { color: #b92034; }
        table.bouts { width: 100%; border-collapse: collapse; margin-top: 5mm; font-size: 11pt; }
        table.bouts th { background: #24336f; color: #fff; padding: 2mm; border: 1px solid #111; font-weight: 700; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        table.bouts th.red { background: #d11a2a; }
        .cell { border: 1px solid #111; padding: 2mm; text-align: center; vertical-align: middle; }
        .cell p { line-height: 1.45; }
        .num { width: 22mm; font-size: 10pt; }
        .num .no { font-weight: 700; }
        .tag { color: #c1121f; }
        .weight { width: 34mm; font-weight: 700; }
        .name { font-weight: 700; font-size: 12.5pt; }
        .name.latin { font-size: 11.5pt; }
        .en, .country, .club { font-size: 9.5pt; }
        .country { font-weight: 600; }
        tr { break-inside: avoid; }
        .foot { display: flex; justify-content: flex-end; margin-top: 10mm; }
        .sign { width: 80mm; text-align: center; line-height: 1.7; }
        .stampspace { height: 28mm; }
        .meta { margin-top: 8mm; font-size: 8.5pt; color: #555; display: flex; justify-content: space-between; }
        @page { size: A4; margin: 0; }
        @media print { .no-print { display: none !important; } .sheet { margin: 0; padding: 12mm 14mm; width: auto; min-height: auto; } body { background: #fff; } }
      `}</style>

      <div className="no-print max-w-[210mm] mx-auto mb-4 px-3 flex flex-wrap items-center gap-3">
        <Link to={`/home/events/${event.id}`} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700"><ArrowLeft className="w-4 h-4" aria-hidden /> Back</Link>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90"><Printer className="w-4 h-4" aria-hidden /> Print / Save as PDF</button>
        <p className="text-sm text-slate-600">Version {version} · KKF signs and stamps the printed paper by hand.</p>
        {missing > 0 && <p className="w-full text-sm font-semibold text-amber-800">{missing} bout{missing === 1 ? "" : "s"} still without both fighters — they print with an empty corner.</p>}
      </div>

      <article className="sheet" lang="km">
        <div className="crown">
          <h1>ព្រះរាជាណាចក្រកម្ពុជា</h1>
          <h2>ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
        </div>
        <div className="head" style={{ marginTop: "4mm" }}>
          <div><img src={kkfLogo} alt="KKF" /><p className="fed">សហព័ន្ធកីឡាប្រដាល់គុនខ្មែរ</p></div>
          <div />
          <div style={{ textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "4mm" }}>
            {station?.logo_url && <img src={station.logo_url} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
            {sponsor?.logo_url && <img src={sponsor.logo_url} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
          </div>
        </div>

        <div className="title">
          <p>កម្មវិធី</p>
          <p>ប្រកួតកីឡាប្រដាល់ <span className="show">{event.name}</span></p>
          <p>{event.location}{station?.name ? ` · ${station.name}` : ""}</p>
          <p>{dateKm}{event.start_time ? ` វេលាម៉ោង ${kmTime(event.start_time)}` : ""}</p>
        </div>

        <table className="bouts">
          <thead>
            <tr>
              <th>គូទី</th>
              <th className="red">បង្គោលក្រហម</th>
              <th>ទម្ងន់ WEIGHT</th>
              <th>បង្គោលខៀវ</th>
            </tr>
          </thead>
          <tbody>
            {live.length === 0 && <tr><td className="cell" colSpan={4}>—</td></tr>}
            {live.map((b, i) => {
              const foreign = [b.fighter_a, b.fighter_b].some((f) => f && f.nationality && f.nationality !== "Cambodian");
              const women = [b.fighter_a, b.fighter_b].some((f) => f?.gender === "Female");
              const drawRow = firstOfDraw.has(b.id) ? (
                <tr key={`draw-${b.draw_id}`}>
                  <td className="cell num"><p className="tag">សមាសភាពចាប់ឆ្នោត</p></td>
                  <td className="cell" colSpan={3} style={{ textAlign: "left" }}>
                    <p>បេក្ខជនក្នុងប្រភេទទម្ងន់ <span className="tag">{enWeight(b.agreed_weight)} KG</span></p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 6mm" }}>
                      {drawFighters(b.draw_id).map((f: any, k: number) => (
                        <p key={f.id} className="club">{km(k + 1)}- {f.nationality && f.nationality !== "Cambodian" ? `${String(f.name).toUpperCase()} (${String(f.nationality).toUpperCase()})` : f.name_khmer || f.name}{f.club ? ` (${f.club.name_khmer || f.club.name})` : ""}</p>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : null;
              return [drawRow,
                <tr key={b.id}>
                  <td className="cell num">
                    <p className="no">{km(i + 1)} ({km(b.rounds)}ទឹក)</p>
                    {b.is_title_match ? <p className="tag">គូជើងឯក</p> : b.bout_label ? <p className={b.bout_label === "international" || b.bout_label === "prize" || b.bout_label === "final" ? "tag" : ""}>{LABEL_KM[b.bout_label] ?? ""}</p> : foreign ? <p className="tag">គូអន្តរជាតិ</p> : null}
                  </td>
                  <Corner fighter={b.fighter_a} red from={b.slot_a_from ? numberOf.get(b.slot_a_from) : null} />
                  <td className="cell weight">
                    {b.rule_set === "mas_fight" ? (
                      <p className="tag">MAS FIGHT</p>
                    ) : (
                      <>
                        <p>គុនខ្មែរ{women ? <span className="tag"> (នារី)</span> : null}</p>
                        <p>KUN KHMER</p>
                      </>
                    )}
                    <p className={b.rule_set === "mas_fight" ? "tag" : ""}>{enWeight(b.agreed_weight)} KG</p>
                  </td>
                  <Corner fighter={b.fighter_b} from={b.slot_b_from ? numberOf.get(b.slot_b_from) : null} />
                </tr>,
              ];
            })}
          </tbody>
        </table>

        <div className="foot">
          <div className="sign">
            <p>រាជធានីភ្នំពេញ ថ្ងៃទី......... ខែ......... ឆ្នាំ.........</p>
            <p>សហព័ន្ធកីឡាប្រដាល់គុនខ្មែរ</p>
            <div className="stampspace" />
          </div>
        </div>
        <p className="meta"><span>កំណែទី {km(version)}</span><span>បោះពុម្ព {km(printed.getDate())}/{km(printed.getMonth() + 1)}/{km(printed.getFullYear())}</span></p>
      </article>
    </div>
  );
}

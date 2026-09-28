/** A fighter's recorded bouts (newest first) for the fighter profile, with recent form. */
import { useState } from "react";
import { Link } from "react-router";
import { Calendar, History, Trophy } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";
import { fightHistory, type FanData } from "../../data/fanData";
import { getFighterSlug } from "../../data/masterData";
import { isRealImage } from "../../data/partners";
import { FighterAvatar } from "../event/EventParts";
import { FormGuide, OutcomeBadge, useResultText } from "./FanWidgets";

const PREVIEW_ROWS = 5;

export function FightHistory({ data, fighterId }: { data: FanData; fighterId: string }) {
  const { t, localName, formatDate } = useI18n();
  const resultText = useResultText();
  const [expanded, setExpanded] = useState(false);
  const history = fightHistory(data, fighterId);
  const rows = expanded ? history : history.slice(0, PREVIEW_ROWS);

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="kk-heading text-xl md:text-2xl text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--kk-blue)]" aria-hidden />{t("history.title")}
          </h2>
          <p className="text-sm text-gray-600">{t("history.subtitle")}</p>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="kk-label text-gray-500">{t("history.form")}</span>
            <FormGuide form={history.slice(0, 5).map((h) => h.outcome)} label={false} />
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-600">{t("history.empty")}</p>
      ) : (
        <>
          <ol className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
            {rows.map(({ bout, outcome, opponent }) => (
              <li key={bout.id} className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 hover:bg-gray-50/70">
                <OutcomeBadge outcome={outcome} />
                <Link to={`/fighters/${getFighterSlug(opponent)}`} className="kk-focus flex items-center gap-3 min-w-0 flex-1 group">
                  <FighterAvatar f={{ ...opponent, image: isRealImage(opponent.image) ? opponent.image : undefined }} corner={bout.fighterA.id === opponent.id ? "red" : "blue"} size="sm" className="hidden sm:inline-flex" />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 group-hover:text-[var(--kk-blue)] truncate">{localName(opponent.name, opponent.nameKhmer)}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {bout.isTitle && <Trophy className="inline w-3 h-3 mr-1 text-amber-500 -mt-0.5" aria-label={t("matches.titleBout")} />}
                      {bout.eventName || bout.cardName}
                    </p>
                  </div>
                </Link>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{resultText(bout)}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                    <Calendar className="w-3 h-3" aria-hidden />
                    {formatDate(bout.date)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          {history.length > PREVIEW_ROWS && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="kk-focus w-full h-11 text-sm font-semibold text-[var(--kk-blue)] rounded-xl border border-gray-200 bg-white hover:border-[var(--kk-blue)]/40"
            >
              {expanded ? t("history.showLess") : t("history.showAll", { n: history.length })}
            </button>
          )}
        </>
      )}
    </section>
  );
}

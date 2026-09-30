/**
 * English / Khmer text for the Program screens (fight nights, fight cards, bouts, officials, weigh-in,
 * results). The choice is remembered per browser and shared with the Help page. KKF reviews the Khmer.
 * See claude/updates/program-officer-friendly.md.
 */
import { useSyncExternalStore } from "react";

export type Lang = "en" | "km";

const KEY = "kkf_admin_lang";
const HELP_KEY = "kkf_help_lang";

function read(): Lang {
  try {
    const v = localStorage.getItem(KEY) ?? localStorage.getItem(HELP_KEY);
    return v === "km" ? "km" : "en";
  } catch {
    return "en";
  }
}

let current: Lang = read();
const listeners = new Set<() => void>();

export function setLang(lang: Lang) {
  current = lang;
  try {
    localStorage.setItem(KEY, lang);
    localStorage.setItem(HELP_KEY, lang);
  } catch {}
  listeners.forEach((l) => l());
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
}

const EN = {
  // Shared
  "lang.switch": "ខ្មែរ",
  "lang.switchLabel": "Show in Khmer",
  "common.back": "Back",
  "common.save": "Save",
  "common.saving": "Saving…",
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.open": "Open",
  "common.edit": "Edit",
  "common.change": "Change",
  "common.more": "More",
  "common.loading": "Loading…",
  "common.notSet": "Not set",
  "common.red": "Red corner",
  "common.blue": "Blue corner",
  "common.vs": "vs",
  "common.kg": "{n} kg",
  "common.round": "Round {n}",
  "common.rounds": "{n} rounds",
  "common.titleFight": "Title fight",
  "common.error": "Something went wrong. Please try again.",
  "common.saved": "Saved.",

  // Status
  "status.Draft": "Not published",
  "status.Published": "Published",
  "status.Completed": "Completed",
  "status.Cancelled": "Cancelled",

  // Program tabs
  "program.title": "Program",
  "program.subtitle": "Fight nights, bouts, officials, weigh-ins, results and titles.",
  "program.tab.overview": "Overview",
  "program.tab.fightNights": "Fight nights",
  "program.tab.champions": "Champions",

  "ov.published": "{n} published",
  "ov.notPublished": "{n} not published yet",
  "ov.fightCards": "Fight cards",
  "ov.bouts": "{n} bouts",
  "ov.withResult": "{n} with a result",
  "ov.belts": "Championship belts",
  "ov.held": "{n} held",
  "ov.vacant": "{n} vacant",
  "ov.next": "Next fight night",
  "ov.last": "Last fight night",
  "ov.nextUp": "Next up",
  "ov.finished": "Finished",
  "ov.results": "Results: {done} of {total}",
  "ov.open": "Open fight night",
  "ov.noUpcoming": "No upcoming fight night",
  "ov.activeChamps": "Champions",
  "ov.noHolders": "No title holders yet",
  "ov.browse": "All championship belts",
  "ov.attention": "Needs attention",
  "ov.allTodos": "All to-dos",
  "ov.moreTodos": "{n} more on the dashboard.",
  "ov.quick": "Quick actions",
  "ov.newNightHint": "Name, date and venue are enough to start.",
  "ov.newTitle": "Add a title belt",
  "ov.newTitleHint": "Title name and weight class.",
  // Fight nights list
  "list.new": "New fight night",
  "list.search": "Search by name or venue",
  "list.upcoming": "Upcoming",
  "list.past": "Past",
  "list.all": "All",
  "list.empty": "No fight nights here yet.",
  "list.emptyHint": "Create a fight night to start: name, date and venue are enough.",
  "list.bouts": "{n} bouts",
  "list.bout": "1 bout",
  "list.noBouts": "No bouts yet",
  "list.next": "Next: {step}",
  "list.done": "All done",
  "next.card": "add a fight card",
  "next.bouts": "add bouts",
  "next.officials": "assign officials",
  "next.publish": "publish",
  "next.weighin": "weigh-in",
  "next.results": "record results ({done} of {total})",
  "next.wait": "ready for fight night",

  // Fight night page
  "night.back": "Fight nights",
  "night.name": "Name",
  "night.notFound": "This fight night could not be found.",
  "card.tapHint": "Tap a bout to see all its details.",
  "night.editDetails": "Edit details",
  "night.broadcaster": "TV / stream",
  "night.sponsor": "Main sponsor",
  "night.venue": "Venue",
  "night.date": "Date",
  "night.poster": "Poster",
  "night.cancel": "Cancel fight night",
  "night.cancelTitle": "Cancel this fight night?",
  "night.cancelText": "Fans will see it as cancelled. You can publish it again later.",
  "night.cancelled": "Fight night cancelled.",
  "night.delete": "Delete fight night",
  "night.deleteTitle": "Delete this fight night?",
  "night.deleteText": "This removes the fight night with all its fight cards and bouts. It can't be undone.",
  "night.deleted": "Fight night deleted.",
  "night.cancelledBanner": "This fight night is cancelled.",
  "night.addCard": "Add fight card",
  "night.addCardHint": "Most fight nights have one fight card. Add another only for a second night or week.",
  "night.cardName": "Fight card name",
  "night.cardDate": "Date",
  "night.cardAdded": "Fight card added.",
  "night.noCards": "No fight card yet. Add one, then add the bouts.",
  "night.saved": "Details saved.",

  // Fight card section
  "card.addBout": "Add bout",
  "card.officials": "Assign officials",
  "card.weighin": "Weigh-in",
  "card.results": "Results",
  "card.share": "Share poster",
  "card.delete": "Delete fight card",
  "card.deleteTitle": "Delete this fight card?",
  "card.deleteText": "This removes the fight card and all its bouts. It can't be undone.",
  "card.deleted": "Fight card deleted.",
  "card.noBouts": "No bouts yet. Press “Add bout” to pair two fighters.",
  "card.col.bout": "Bout",
  "card.col.officials": "Officials",
  "card.col.weighin": "Weigh-in",
  "card.col.result": "Result",
  "card.officialsOk": "Assigned",
  "card.officialsMissing": "Missing",
  "card.notWeighed": "Not yet",
  "card.weighedOk": "Both passed",
  "card.weighedOver": "Over weight",
  "card.weighedHalf": "1 of 2",
  "card.noResult": "Not yet",
  "card.draw": "Draw",
  "card.noContest": "No contest",
  "card.won": "{name} won",

  // Next steps
  "steps.title": "Next steps",
  "steps.done": "{done} of {total} done",
  "steps.next": "Next",
  "steps.details": "Fight night details",
  "steps.detailsDone": "Name, date and venue are set.",
  "steps.detailsTodo": "Add the name, date and venue.",
  "steps.card": "Fight card",
  "steps.cardDone": "{n} fight card(s).",
  "steps.cardTodo": "Add the fight card.",
  "steps.bouts": "Bouts",
  "steps.boutsDone": "{n} bout(s) on the card.",
  "steps.boutsTodo": "Pair the fighters: who meets whom, weight and rounds.",
  "steps.officials": "Officials",
  "steps.officialsDone": "Every bout has a referee and 3 judges.",
  "steps.officialsTodo": "{done} of {total} bouts have a referee and 3 judges.",
  "steps.publish": "Publish",
  "steps.publishDone": "Published — fans can see this fight night.",
  "steps.publishTodo": "Fans can't see it yet. Publish when the fight card is ready.",
  "steps.publishAction": "Publish fight night",
  "steps.published": "Published — fans can now see it.",
  "steps.weighin": "Weigh-in",
  "steps.weighinDone": "Every fighter has been weighed.",
  "steps.weighinTodo": "{done} of {total} bouts weighed in.",
  "steps.results": "Results",
  "steps.resultsDone": "Every result is recorded.",
  "steps.resultsTodo": "{done} of {total} results recorded.",
  "steps.resultsLater": "After fight night ({n} bouts).",
  "steps.after": "After the bouts are added.",
  "steps.addBouts": "Add bouts",
  "steps.addCard": "Add fight card",

  // Weigh-in
  "weigh.title": "Weigh-in",
  "weigh.intro": "Type each fighter's weight in kg. A fighter passes if they are at most 1 kg over the agreed weight. The weight is saved on the bout; the fighter's profile isn't changed.",
  "weigh.agreed": "Agreed weight: {kg}",
  "weigh.pass": "Pass",
  "weigh.over": "Over by {kg}",
  "weigh.none": "Not weighed",
  "weigh.saveBout": "Save weights",
  "weigh.saved": "Weights saved.",
  "weigh.invalid": "Enter a weight between 20 and 200 kg.",
  "weigh.progress": "{done} of {total} bouts weighed in",

  // Results
  "res.title": "Results",
  "res.intro": "For each bout, choose the winner, how the fight ended and the round, then save. Fighter records and title belts update automatically.",
  "res.beforeNight": "Fight night is on {date}. Record results after the bouts.",
  "res.winner": "Winner",
  "res.method": "How it ended",
  "res.round": "Round",
  "res.pickWinner": "Choose the winner first.",
  "res.pickMethod": "Choose how the fight ended.",
  "res.pickRound": "Choose the round.",
  "res.save": "Save result",
  "res.saved": "Result saved: {text}",
  "res.progress": "{done} of {total} results recorded",
  "res.method.KO": "Knockout (KO)",
  "res.method.TKO": "Referee stopped the fight (TKO)",
  "res.method.Decision": "Judges' decision",
  "res.method.Disqualification": "Disqualification",
  "res.titleConfirmTitle": "Change the winner of a title fight?",
  "res.titleConfirmText": "The belt moves to the new winner, and later title fights for this belt are applied again in order.",
  "res.titleConfirm": "Yes, change the winner",
  "res.readOnly": "Only KKF staff can record results.",
} as const;

export type TextKey = keyof typeof EN;

const KM: Record<TextKey, string> = {
  "lang.switch": "English",
  "lang.switchLabel": "Show in English",
  "common.back": "ត្រឡប់ក្រោយ",
  "common.save": "រក្សាទុក",
  "common.saving": "កំពុងរក្សាទុក…",
  "common.cancel": "បោះបង់",
  "common.close": "បិទ",
  "common.open": "បើក",
  "common.edit": "កែប្រែ",
  "common.change": "ផ្លាស់ប្តូរ",
  "common.more": "ផ្សេងៗ",
  "common.loading": "កំពុងផ្ទុក…",
  "common.notSet": "មិនទាន់កំណត់",
  "common.red": "ជ្រុងក្រហម",
  "common.blue": "ជ្រុងខៀវ",
  "common.vs": "ទល់នឹង",
  "common.kg": "{n} គ.ក",
  "common.round": "ទឹកទី {n}",
  "common.rounds": "{n} ទឹក",
  "common.titleFight": "ប្រកួតដណ្តើមខ្សែក្រវាត់",
  "common.error": "មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។",
  "common.saved": "បានរក្សាទុក។",

  "status.Draft": "មិនទាន់ផ្សព្វផ្សាយ",
  "status.Published": "បានផ្សព្វផ្សាយ",
  "status.Completed": "បានបញ្ចប់",
  "status.Cancelled": "បានលុបចោល",

  "program.title": "កម្មវិធីប្រកួត",
  "program.subtitle": "រាត្រីប្រកួត គូប្រកួត មន្ត្រីប្រកួត ការថ្លឹងទម្ងន់ លទ្ធផល និងខ្សែក្រវាត់។",
  "program.tab.overview": "ទិដ្ឋភាពទូទៅ",
  "program.tab.fightNights": "រាត្រីប្រកួត",
  "program.tab.champions": "ម្ចាស់ជើងឯក",

  "ov.published": "បានផ្សព្វផ្សាយ {n}",
  "ov.notPublished": "មិនទាន់ផ្សព្វផ្សាយ {n}",
  "ov.fightCards": "កម្មវិធីប្រកួត",
  "ov.bouts": "{n} គូ",
  "ov.withResult": "មានលទ្ធផល {n}",
  "ov.belts": "ខ្សែក្រវាត់ជើងឯក",
  "ov.held": "មានម្ចាស់ {n}",
  "ov.vacant": "ទំនេរ {n}",
  "ov.next": "រាត្រីប្រកួតបន្ទាប់",
  "ov.last": "រាត្រីប្រកួតចុងក្រោយ",
  "ov.nextUp": "បន្ទាប់",
  "ov.finished": "បានបញ្ចប់",
  "ov.results": "លទ្ធផល៖ {done} នៃ {total}",
  "ov.open": "បើករាត្រីប្រកួត",
  "ov.noUpcoming": "មិនទាន់មានរាត្រីប្រកួតខាងមុខ",
  "ov.activeChamps": "ម្ចាស់ជើងឯក",
  "ov.noHolders": "មិនទាន់មានម្ចាស់ខ្សែក្រវាត់",
  "ov.browse": "ខ្សែក្រវាត់ជើងឯកទាំងអស់",
  "ov.attention": "ត្រូវយកចិត្តទុកដាក់",
  "ov.allTodos": "កិច្ចការទាំងអស់",
  "ov.moreTodos": "មាន {n} ទៀតនៅលើផ្ទាំងគ្រប់គ្រង។",
  "ov.quick": "សកម្មភាពរហ័ស",
  "ov.newNightHint": "ឈ្មោះ កាលបរិច្ឆេទ និងទីកន្លែង គឺគ្រប់គ្រាន់ដើម្បីចាប់ផ្តើម។",
  "ov.newTitle": "បន្ថែមខ្សែក្រវាត់",
  "ov.newTitleHint": "ឈ្មោះខ្សែក្រវាត់ និងថ្នាក់ទម្ងន់។",
  "list.new": "បង្កើតរាត្រីប្រកួតថ្មី",
  "list.search": "ស្វែងរកតាមឈ្មោះ ឬទីកន្លែង",
  "list.upcoming": "នាពេលខាងមុខ",
  "list.past": "កន្លងមក",
  "list.all": "ទាំងអស់",
  "list.empty": "មិនទាន់មានរាត្រីប្រកួតនៅទីនេះទេ។",
  "list.emptyHint": "បង្កើតរាត្រីប្រកួតដើម្បីចាប់ផ្តើម៖ ឈ្មោះ កាលបរិច្ឆេទ និងទីកន្លែង គឺគ្រប់គ្រាន់។",
  "list.bouts": "{n} គូ",
  "list.bout": "១ គូ",
  "list.noBouts": "មិនទាន់មានគូប្រកួត",
  "list.next": "បន្ទាប់៖ {step}",
  "list.done": "រួចរាល់ទាំងអស់",
  "next.card": "បន្ថែមកម្មវិធីប្រកួត",
  "next.bouts": "បន្ថែមគូប្រកួត",
  "next.officials": "ចាត់តាំងមន្ត្រីប្រកួត",
  "next.publish": "ផ្សព្វផ្សាយ",
  "next.weighin": "ថ្លឹងទម្ងន់",
  "next.results": "កត់ត្រាលទ្ធផល ({done} នៃ {total})",
  "next.wait": "រួចរាល់សម្រាប់រាត្រីប្រកួត",

  "night.back": "រាត្រីប្រកួត",
  "night.name": "ឈ្មោះ",
  "night.notFound": "រកមិនឃើញរាត្រីប្រកួតនេះទេ។",
  "card.tapHint": "ចុចលើគូប្រកួតដើម្បីមើលព័ត៌មានលម្អិត។",
  "night.editDetails": "កែព័ត៌មាន",
  "night.broadcaster": "ទូរទស្សន៍ / ផ្សាយផ្ទាល់",
  "night.sponsor": "អ្នកឧបត្ថម្ភចម្បង",
  "night.venue": "ទីកន្លែង",
  "night.date": "កាលបរិច្ឆេទ",
  "night.poster": "ផ្ទាំងរូបភាព",
  "night.cancel": "លុបចោលរាត្រីប្រកួត",
  "night.cancelTitle": "លុបចោលរាត្រីប្រកួតនេះ?",
  "night.cancelText": "អ្នកគាំទ្រនឹងឃើញថាវាត្រូវបានលុបចោល។ អ្នកអាចផ្សព្វផ្សាយវាម្តងទៀតនៅពេលក្រោយ។",
  "night.cancelled": "បានលុបចោលរាត្រីប្រកួត។",
  "night.delete": "លុបរាត្រីប្រកួត",
  "night.deleteTitle": "លុបរាត្រីប្រកួតនេះ?",
  "night.deleteText": "វានឹងលុបរាត្រីប្រកួត រួមទាំងកម្មវិធីប្រកួត និងគូប្រកួតទាំងអស់។ មិនអាចត្រឡប់វិញបានទេ។",
  "night.deleted": "បានលុបរាត្រីប្រកួត។",
  "night.cancelledBanner": "រាត្រីប្រកួតនេះត្រូវបានលុបចោល។",
  "night.addCard": "បន្ថែមកម្មវិធីប្រកួត",
  "night.addCardHint": "រាត្រីប្រកួតភាគច្រើនមានកម្មវិធីប្រកួតតែមួយ។ បន្ថែមមួយទៀតសម្រាប់តែយប់ ឬសប្តាហ៍ទីពីរប៉ុណ្ណោះ។",
  "night.cardName": "ឈ្មោះកម្មវិធីប្រកួត",
  "night.cardDate": "កាលបរិច្ឆេទ",
  "night.cardAdded": "បានបន្ថែមកម្មវិធីប្រកួត។",
  "night.noCards": "មិនទាន់មានកម្មវិធីប្រកួត។ បន្ថែមមួយ បន្ទាប់មកបន្ថែមគូប្រកួត។",
  "night.saved": "បានរក្សាទុកព័ត៌មាន។",

  "card.addBout": "បន្ថែមគូប្រកួត",
  "card.officials": "ចាត់តាំងមន្ត្រីប្រកួត",
  "card.weighin": "ថ្លឹងទម្ងន់",
  "card.results": "លទ្ធផល",
  "card.share": "ចែករំលែកផ្ទាំងរូបភាព",
  "card.delete": "លុបកម្មវិធីប្រកួត",
  "card.deleteTitle": "លុបកម្មវិធីប្រកួតនេះ?",
  "card.deleteText": "វានឹងលុបកម្មវិធីប្រកួត និងគូប្រកួតទាំងអស់របស់វា។ មិនអាចត្រឡប់វិញបានទេ។",
  "card.deleted": "បានលុបកម្មវិធីប្រកួត។",
  "card.noBouts": "មិនទាន់មានគូប្រកួត។ ចុច «បន្ថែមគូប្រកួត» ដើម្បីផ្គូផ្គងអ្នកប្រដាល់ពីរនាក់។",
  "card.col.bout": "គូប្រកួត",
  "card.col.officials": "មន្ត្រីប្រកួត",
  "card.col.weighin": "ថ្លឹងទម្ងន់",
  "card.col.result": "លទ្ធផល",
  "card.officialsOk": "បានចាត់តាំង",
  "card.officialsMissing": "ខ្វះ",
  "card.notWeighed": "មិនទាន់",
  "card.weighedOk": "ជាប់ទាំងពីរ",
  "card.weighedOver": "លើសទម្ងន់",
  "card.weighedHalf": "១ នៃ ២",
  "card.noResult": "មិនទាន់",
  "card.draw": "ស្មើ",
  "card.noContest": "មិនរាប់លទ្ធផល",
  "card.won": "{name} ឈ្នះ",

  "steps.title": "ជំហានបន្ទាប់",
  "steps.done": "បានធ្វើ {done} នៃ {total}",
  "steps.next": "បន្ទាប់",
  "steps.details": "ព័ត៌មានរាត្រីប្រកួត",
  "steps.detailsDone": "ឈ្មោះ កាលបរិច្ឆេទ និងទីកន្លែង រួចរាល់។",
  "steps.detailsTodo": "បញ្ចូលឈ្មោះ កាលបរិច្ឆេទ និងទីកន្លែង។",
  "steps.card": "កម្មវិធីប្រកួត",
  "steps.cardDone": "កម្មវិធីប្រកួត {n}។",
  "steps.cardTodo": "បន្ថែមកម្មវិធីប្រកួត។",
  "steps.bouts": "គូប្រកួត",
  "steps.boutsDone": "មាន {n} គូនៅលើកម្មវិធី។",
  "steps.boutsTodo": "ផ្គូផ្គងអ្នកប្រដាល់៖ អ្នកណាជួបអ្នកណា ទម្ងន់ និងចំនួនទឹក។",
  "steps.officials": "មន្ត្រីប្រកួត",
  "steps.officialsDone": "គូនីមួយៗមានអាជ្ញាកណ្តាល និងចៅក្រម ៣ នាក់។",
  "steps.officialsTodo": "{done} នៃ {total} គូ មានអាជ្ញាកណ្តាល និងចៅក្រម ៣ នាក់។",
  "steps.publish": "ផ្សព្វផ្សាយ",
  "steps.publishDone": "បានផ្សព្វផ្សាយ — អ្នកគាំទ្រអាចមើលឃើញរាត្រីប្រកួតនេះ។",
  "steps.publishTodo": "អ្នកគាំទ្រមិនទាន់មើលឃើញទេ។ ផ្សព្វផ្សាយនៅពេលកម្មវិធីប្រកួតរួចរាល់។",
  "steps.publishAction": "ផ្សព្វផ្សាយរាត្រីប្រកួត",
  "steps.published": "បានផ្សព្វផ្សាយ — អ្នកគាំទ្រអាចមើលឃើញហើយ។",
  "steps.weighin": "ថ្លឹងទម្ងន់",
  "steps.weighinDone": "អ្នកប្រដាល់ទាំងអស់បានថ្លឹងទម្ងន់រួច។",
  "steps.weighinTodo": "{done} នៃ {total} គូ បានថ្លឹងទម្ងន់។",
  "steps.results": "លទ្ធផល",
  "steps.resultsDone": "បានកត់ត្រាលទ្ធផលទាំងអស់។",
  "steps.resultsTodo": "បានកត់ត្រាលទ្ធផល {done} នៃ {total}។",
  "steps.resultsLater": "បន្ទាប់ពីរាត្រីប្រកួត ({n} គូ)។",
  "steps.after": "បន្ទាប់ពីបន្ថែមគូប្រកួត។",
  "steps.addBouts": "បន្ថែមគូប្រកួត",
  "steps.addCard": "បន្ថែមកម្មវិធីប្រកួត",

  "weigh.title": "ថ្លឹងទម្ងន់",
  "weigh.intro": "បញ្ចូលទម្ងន់អ្នកប្រដាល់ម្នាក់ៗជាគីឡូក្រាម។ អ្នកប្រដាល់ជាប់ ប្រសិនបើលើសទម្ងន់ព្រមព្រៀងមិនលើស ១ គីឡូក្រាម។ ទម្ងន់ត្រូវបានរក្សាទុកលើគូប្រកួត ហើយមិនប្តូរប្រវត្តិរូបអ្នកប្រដាល់ទេ។",
  "weigh.agreed": "ទម្ងន់ព្រមព្រៀង៖ {kg}",
  "weigh.pass": "ជាប់",
  "weigh.over": "លើស {kg}",
  "weigh.none": "មិនទាន់ថ្លឹង",
  "weigh.saveBout": "រក្សាទុកទម្ងន់",
  "weigh.saved": "បានរក្សាទុកទម្ងន់។",
  "weigh.invalid": "សូមបញ្ចូលទម្ងន់ចន្លោះ ២០ ដល់ ២០០ គីឡូក្រាម។",
  "weigh.progress": "{done} នៃ {total} គូ បានថ្លឹងទម្ងន់",

  "res.title": "លទ្ធផល",
  "res.intro": "សម្រាប់គូនីមួយៗ សូមជ្រើសអ្នកឈ្នះ របៀបបញ្ចប់ការប្រកួត និងទឹក រួចរក្សាទុក។ កំណត់ត្រាអ្នកប្រដាល់ និងខ្សែក្រវាត់ធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិ។",
  "res.beforeNight": "រាត្រីប្រកួតគឺនៅ {date}។ សូមកត់ត្រាលទ្ធផលបន្ទាប់ពីការប្រកួត។",
  "res.winner": "អ្នកឈ្នះ",
  "res.method": "របៀបបញ្ចប់",
  "res.round": "ទឹក",
  "res.pickWinner": "សូមជ្រើសអ្នកឈ្នះជាមុនសិន។",
  "res.pickMethod": "សូមជ្រើសរបៀបបញ្ចប់ការប្រកួត។",
  "res.pickRound": "សូមជ្រើសទឹក។",
  "res.save": "រក្សាទុកលទ្ធផល",
  "res.saved": "បានរក្សាទុកលទ្ធផល៖ {text}",
  "res.progress": "បានកត់ត្រាលទ្ធផល {done} នៃ {total}",
  "res.method.KO": "ផ្តួលសន្លប់ (KO)",
  "res.method.TKO": "អាជ្ញាកណ្តាលបញ្ឈប់ការប្រកួត (TKO)",
  "res.method.Decision": "ការសម្រេចរបស់ចៅក្រម",
  "res.method.Disqualification": "ដកសិទ្ធិ",
  "res.titleConfirmTitle": "ប្តូរអ្នកឈ្នះនៃការប្រកួតដណ្តើមខ្សែក្រវាត់?",
  "res.titleConfirmText": "ខ្សែក្រវាត់នឹងផ្ទេរទៅអ្នកឈ្នះថ្មី ហើយការប្រកួតដណ្តើមខ្សែក្រវាត់នេះពេលក្រោយនឹងត្រូវអនុវត្តឡើងវិញតាមលំដាប់។",
  "res.titleConfirm": "បាទ/ចាស ប្តូរអ្នកឈ្នះ",
  "res.readOnly": "មានតែបុគ្គលិក KKF ទេ ដែលអាចកត់ត្រាលទ្ធផលបាន។",
};

const KM_DIGITS = "០១២៣៤៥៦៧៨៩";
export const khmerDigits = (s: string | number) => String(s).replace(/\d/g, (d) => KM_DIGITS[Number(d)]);
const KM_MONTHS = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];

/** Date of a fight night (stored as a date, shown in UTC so the day never shifts). */
export function formatDay(value: string | null | undefined, lang: Lang, withWeekday = true): string {
  if (!value) return "";
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (isNaN(d.getTime())) return value;
  if (lang === "km") return `${khmerDigits(d.getUTCDate())} ${KM_MONTHS[d.getUTCMonth()]} ${khmerDigits(d.getUTCFullYear())}`;
  return d.toLocaleDateString("en-GB", { ...(withWeekday ? { weekday: "short" } : {}), day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function useT() {
  const lang = useLang();
  const dict = lang === "km" ? KM : EN;
  const t = (key: TextKey, vars: Record<string, string | number> = {}) =>
    dict[key].replace(/\{(\w+)\}/g, (_, k) => {
      const v = vars[k];
      if (v === undefined) return `{${k}}`;
      return lang === "km" && typeof v === "number" ? khmerDigits(v) : String(v);
    });
  return { t, lang };
}

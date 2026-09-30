/**
 * Help (Phase 5): how the management system works, in English and Khmer — the real
 * steps built in Phases 3–4, what the signed-in role does, and common questions.
 * Replaces the old "Process Flow" page. The language choice is remembered per browser.
 */
import { useState } from "react";
import { Link } from "react-router";
import { BookOpen, ChevronRight, HelpCircle, Languages, UserRound } from "lucide-react";
import { api } from "../utils/api";
import { APPROVALS_ENABLED } from "../config/features";

type Lang = "en" | "km";
type Text = Record<Lang, string>;

const LANG_KEY = "kkf_help_lang";
const readLang = (): Lang => {
  try {
    return localStorage.getItem(LANG_KEY) === "km" ? "km" : "en";
  } catch {
    return "en";
  }
};

const UI = {
  title: { en: "Help", km: "ជំនួយ" },
  intro: {
    en: "How the Kun Khmer management system works, and what you can do with your account.",
    km: "របៀបដែលប្រព័ន្ធគ្រប់គ្រងគុនខ្មែរដំណើរការ និងអ្វីដែលអ្នកអាចធ្វើបានជាមួយគណនីរបស់អ្នក។",
  },
  journey: { en: "From event to result", km: "ពីព្រឹត្តិការណ៍ ដល់លទ្ធផល" },
  fighters: { en: "Fighters", km: "អ្នកប្រដាល់" },
  yourRole: { en: "Your role", km: "តួនាទីរបស់អ្នក" },
  faq: { en: "Common questions", km: "សំណួរដែលសួរញឹកញាប់" },
  who: { en: "Who", km: "អ្នកធ្វើ" },
  open: { en: "Open", km: "បើក" },
  contact: {
    en: "Still stuck? Ask a KKF Super Admin — they manage accounts and settings.",
    km: "នៅតែមានបញ្ហា? សូមសួរ Super Admin របស់ KKF ដែលគ្រប់គ្រងគណនី និងការកំណត់។",
  },
} satisfies Record<string, Text>;

const APPROVAL_STEPS: { who: Text; title: Text; body: Text }[] = [
  {
    who: { en: "Organizer", km: "អ្នករៀបចំ" },
    title: { en: "Create the event", km: "បង្កើតព្រឹត្តិការណ៍" },
    body: {
      en: "Name, date, venue, broadcaster and sponsors. A new event is a draft that fans can't see. Submit it to KKF when it's ready.",
      km: "ឈ្មោះ កាលបរិច្ឆេទ ទីកន្លែង ស្ថានីយផ្សាយ និងអ្នកឧបត្ថម្ភ។ ព្រឹត្តិការណ៍ថ្មីជាសេចក្តីព្រាង ដែលអ្នកគាំទ្រមើលមិនឃើញ។ ដាក់ជូន KKF នៅពេលរួចរាល់។",
    },
  },
  {
    who: { en: "KKF", km: "KKF" },
    title: { en: "Approve and publish", km: "អនុម័ត និងផ្សព្វផ្សាយ" },
    body: {
      en: "KKF approves the event or sends it back with a comment. Once approved, the organizer publishes it and fans can see it. KKF staff can publish directly.",
      km: "KKF អនុម័តព្រឹត្តិការណ៍ ឬបញ្ជូនត្រឡប់វិញជាមួយមតិយោបល់។ ក្រោយអនុម័ត អ្នករៀបចំផ្សព្វផ្សាយ ហើយអ្នកគាំទ្រអាចមើលឃើញ។ បុគ្គលិក KKF អាចផ្សព្វផ្សាយដោយផ្ទាល់។",
    },
  },
  {
    who: { en: "Organizer or KKF", km: "អ្នករៀបចំ ឬ KKF" },
    title: { en: "Fight cards and bouts", km: "កម្មវិធីប្រកួត និងគូប្រកួត" },
    body: {
      en: "Add a fight card for each fight night, then its bouts: two verified fighters, weight, rounds and gloves. A rule preset fills the usual settings.",
      km: "បន្ថែមកម្មវិធីប្រកួតសម្រាប់យប់ប្រកួតនីមួយៗ បន្ទាប់មកគូប្រកួត៖ អ្នកប្រដាល់ពីរនាក់ដែលបានផ្ទៀងផ្ទាត់ ទម្ងន់ ចំនួនទឹក និងស្រោមដៃ។ ច្បាប់គំរូបំពេញការកំណត់ទូទៅ។",
    },
  },
  {
    who: { en: "Clubs", km: "ក្លឹប" },
    title: { en: "Clubs accept the bout", km: "ក្លឹបទទួលយកគូប្រកួត" },
    body: {
      en: "Each new bout goes to both fighters' clubs on Match Proposals. They accept, or decline with a reason — then the organizer changes the fighter. Fans see a bout only after both clubs accept.",
      km: "គូប្រកួតថ្មីនីមួយៗ ត្រូវបានផ្ញើទៅក្លឹបរបស់អ្នកប្រដាល់ទាំងពីរ នៅទំព័រ «សំណើគូប្រកួត»។ ក្លឹបទទួលយក ឬបដិសេធដោយផ្តល់មូលហេតុ — ពេលនោះអ្នករៀបចំប្តូរអ្នកប្រដាល់។ អ្នកគាំទ្រមើលឃើញគូប្រកួត លុះត្រាតែក្លឹបទាំងពីរទទួលយក។",
    },
  },
  {
    who: { en: "KKF", km: "KKF" },
    title: { en: "Referee and judges", km: "អាជ្ញាកណ្តាល និងចៅក្រម" },
    body: {
      en: "KKF assigns a referee and judges to each bout. The list shows how many bouts each official already has that night. Officials see their bouts under My bouts.",
      km: "KKF ចាត់តាំងអាជ្ញាកណ្តាល និងចៅក្រមសម្រាប់គូប្រកួតនីមួយៗ។ បញ្ជីបង្ហាញថាមន្ត្រីម្នាក់ៗមានគូប្រកួតប៉ុន្មានរួចហើយនៅយប់នោះ។ មន្ត្រីមើលគូប្រកួតរបស់ខ្លួននៅ «គូប្រកួតរបស់ខ្ញុំ»។",
    },
  },
  {
    who: { en: "Organizer or KKF", km: "អ្នករៀបចំ ឬ KKF" },
    title: { en: "Weigh-in", km: "ថ្លឹងទម្ងន់" },
    body: {
      en: "Record each fighter's weight on the fight card. A fighter within 1 kg of the agreed weight passes.",
      km: "កត់ត្រាទម្ងន់អ្នកប្រដាល់ម្នាក់ៗនៅលើកម្មវិធីប្រកួត។ អ្នកប្រដាល់ដែលមានទម្ងន់ខុសពីទម្ងន់ព្រមព្រៀងមិនលើស ១ គីឡូក្រាម គឺជាប់។",
    },
  },
  {
    who: { en: "KKF", km: "KKF" },
    title: { en: "Results", km: "លទ្ធផល" },
    body: {
      en: "KKF records the winner, method and round. Fighter records, title holders and the fan site update, and fans who follow the fighters are notified.",
      km: "KKF កត់ត្រាអ្នកឈ្នះ វិធីឈ្នះ និងទឹក។ កំណត់ត្រាអ្នកប្រដាល់ ម្ចាស់ខ្សែក្រវាត់ និងគេហទំព័រអ្នកគាំទ្រ ត្រូវបានធ្វើបច្ចុប្បន្នភាព ហើយអ្នកគាំទ្រដែលតាមដានអ្នកប្រដាល់ទទួលបានការជូនដំណឹង។",
    },
  },
];

const KKF: Text = { en: "KKF", km: "KKF" };

/** Officer-run flow (approvals off, config/features.ts): KKF staff do every step. */
const OFFICER_STEPS: { who: Text; title: Text; body: Text }[] = [
  {
    who: KKF,
    title: { en: "Create the event", km: "បង្កើតព្រឹត្តិការណ៍" },
    body: {
      en: "Name, date, venue, broadcaster and sponsors. A new event is a draft that fans can't see.",
      km: "ឈ្មោះ កាលបរិច្ឆេទ ទីកន្លែង ស្ថានីយផ្សាយ និងអ្នកឧបត្ថម្ភ។ ព្រឹត្តិការណ៍ថ្មីជាសេចក្តីព្រាង ដែលអ្នកគាំទ្រមើលមិនឃើញ។",
    },
  },
  {
    who: KKF,
    title: { en: "Fight cards and bouts", km: "កម្មវិធីប្រកួត និងគូប្រកួត" },
    body: {
      en: "Add a fight card for each fight night, then its bouts: two active fighters, weight, rounds and gloves. A rule preset fills the usual settings. A bout is confirmed as soon as you add it.",
      km: "បន្ថែមកម្មវិធីប្រកួតសម្រាប់យប់ប្រកួតនីមួយៗ បន្ទាប់មកគូប្រកួត៖ អ្នកប្រដាល់សកម្មពីរនាក់ ទម្ងន់ ចំនួនទឹក និងស្រោមដៃ។ ច្បាប់គំរូបំពេញការកំណត់ទូទៅ។ គូប្រកួតត្រូវបានបញ្ជាក់ភ្លាមៗ នៅពេលអ្នកបន្ថែម។",
    },
  },
  APPROVAL_STEPS[4], // Referee and judges
  {
    who: KKF,
    title: { en: "Publish", km: "ផ្សព្វផ្សាយ" },
    body: {
      en: "When the fight card is ready, publish the event. Fans then see the event and its bouts.",
      km: "នៅពេលកម្មវិធីប្រកួតរួចរាល់ សូមផ្សព្វផ្សាយព្រឹត្តិការណ៍។ បន្ទាប់មកអ្នកគាំទ្រមើលឃើញព្រឹត្តិការណ៍ និងគូប្រកួតរបស់វា។",
    },
  },
  { ...APPROVAL_STEPS[5], who: KKF }, // Weigh-in
  APPROVAL_STEPS[6], // Results
];

const STEPS = APPROVALS_ENABLED ? APPROVAL_STEPS : OFFICER_STEPS;

const OFFICER_FIGHTER_FLOW: Text = {
  en: "KKF staff register fighters. A fighter you add is active straight away: it can be put in a bout and shown to fans. A fighter saved as Draft stays hidden until you activate it.",
  km: "បុគ្គលិក KKF ចុះឈ្មោះអ្នកប្រដាល់។ អ្នកប្រដាល់ដែលអ្នកបន្ថែម ក្លាយជាសកម្មភ្លាមៗ៖ អាចដាក់ក្នុងគូប្រកួត និងបង្ហាញជូនអ្នកគាំទ្របាន។ អ្នកប្រដាល់ដែលរក្សាទុកជាសេចក្តីព្រាង នៅតែលាក់ រហូតដល់អ្នកធ្វើឱ្យសកម្ម។",
};

const APPROVAL_FIGHTER_FLOW: Text = {
  en: "Clubs register their own fighters (KKF staff can too). KKF verifies each new fighter or sends it back with a reason; the club fixes it and it comes back to KKF. Only verified fighters can be put in a bout or shown to fans.",
  km: "ក្លឹបចុះឈ្មោះអ្នកប្រដាល់របស់ខ្លួន (បុគ្គលិក KKF ក៏អាចធ្វើបាន)។ KKF ផ្ទៀងផ្ទាត់អ្នកប្រដាល់ថ្មីនីមួយៗ ឬបញ្ជូនត្រឡប់វិញដោយផ្តល់មូលហេតុ ហើយក្លឹបកែតម្រូវរួចបញ្ជូនមកវិញ។ មានតែអ្នកប្រដាល់ដែលបានផ្ទៀងផ្ទាត់ទេ ដែលអាចដាក់ក្នុងគូប្រកួត ឬបង្ហាញជូនអ្នកគាំទ្រ។",
};

const FIGHTER_FLOW = APPROVALS_ENABLED ? APPROVAL_FIGHTER_FLOW : OFFICER_FIGHTER_FLOW;

type RoleKey = "Super Admin" | "KKF Officer" | "Organizer" | "Club/Gym" | "Official";
const ROLE_NAMES: Record<RoleKey, Text> = {
  "Super Admin": { en: "Super Admin", km: "Super Admin" },
  "KKF Officer": { en: "KKF Officer", km: "មន្ត្រី KKF" },
  Organizer: { en: "Organizer", km: "អ្នករៀបចំ" },
  "Club/Gym": { en: "Club / Gym", km: "ក្លឹប" },
  Official: { en: "Referee / Judge", km: "អាជ្ញាកណ្តាល / ចៅក្រម" },
};

const APPROVAL_KKF_TASKS: { text: Text; to?: string }[] = [
  { text: { en: "Approve events or send them back with a comment.", km: "អនុម័តព្រឹត្តិការណ៍ ឬបញ្ជូនត្រឡប់វិញជាមួយមតិយោបល់។" }, to: "/home" },
  { text: { en: "Verify new fighters, or send them back to the club.", km: "ផ្ទៀងផ្ទាត់អ្នកប្រដាល់ថ្មី ឬបញ្ជូនត្រឡប់ទៅក្លឹបវិញ។" }, to: "/home/fighters?status=waiting" },
  { text: { en: "Assign referees and judges; keep the Officials list up to date.", km: "ចាត់តាំងអាជ្ញាកណ្តាល និងចៅក្រម ហើយធ្វើបច្ចុប្បន្នភាពបញ្ជីមន្ត្រី។" }, to: "/home/officials" },
  { text: { en: "Answer a bout for a club (for example after a phone call).", km: "ឆ្លើយគូប្រកួតជំនួសក្លឹប (ឧទាហរណ៍ ក្រោយការហៅទូរស័ព្ទ)។" }, to: "/home/match-proposals" },
  { text: { en: "Record results; manage clubs, partners, news and videos.", km: "កត់ត្រាលទ្ធផល គ្រប់គ្រងក្លឹប ដៃគូ ព័ត៌មាន និងវីដេអូ។" } },
];

const OFFICER_KKF_TASKS: { text: Text; to?: string }[] = [
  { text: { en: "Create events, fight cards and bouts, then publish the event.", km: "បង្កើតព្រឹត្តិការណ៍ កម្មវិធីប្រកួត និងគូប្រកួត រួចផ្សព្វផ្សាយព្រឹត្តិការណ៍។" }, to: "/home/program?tab=events" },
  { text: { en: "Register fighters (they're active at once) and keep their profiles up to date.", km: "ចុះឈ្មោះអ្នកប្រដាល់ (សកម្មភ្លាមៗ) ហើយធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបរបស់ពួកគេ។" }, to: "/home/fighters/kunkhmer" },
  APPROVAL_KKF_TASKS[2], // Assign referees and judges
  APPROVAL_KKF_TASKS[4], // Record results; clubs, partners, news, videos
];

const KKF_TASKS = APPROVALS_ENABLED ? APPROVAL_KKF_TASKS : OFFICER_KKF_TASKS;

const READ_ONLY_TASKS: { text: Text; to?: string }[] = [
  { text: { en: "Your account is read-only for now: you can view events, fight cards and fighters. KKF staff make the changes.", km: "គណនីរបស់អ្នកអាចមើលបានតែប៉ុណ្ណោះនៅពេលនេះ៖ អ្នកអាចមើលព្រឹត្តិការណ៍ កម្មវិធីប្រកួត និងអ្នកប្រដាល់។ បុគ្គលិក KKF ជាអ្នកធ្វើការផ្លាស់ប្តូរ។" }, to: "/home/program?tab=events" },
  { text: { en: "Ask KKF to add or change anything.", km: "សូមស្នើ KKF ដើម្បីបន្ថែម ឬផ្លាស់ប្តូរអ្វីមួយ។" } },
];

const ROLE_TASKS: Record<RoleKey, { text: Text; to?: string }[]> = {
  "Super Admin": [
    ...KKF_TASKS,
    { text: { en: "Create and manage staff, organizer and club accounts.", km: "បង្កើត និងគ្រប់គ្រងគណនីបុគ្គលិក អ្នករៀបចំ និងក្លឹប។" }, to: "/home/user-management" },
    { text: { en: "Edit the settings lists: weight classes, venues, bout rules and gloves.", km: "កែសម្រួលបញ្ជីការកំណត់៖ ថ្នាក់ទម្ងន់ ទីកន្លែង ច្បាប់ប្រកួត និងស្រោមដៃ។" }, to: "/home/settings" },
  ],
  "KKF Officer": [
    ...KKF_TASKS,
    { text: { en: "View the settings lists (only the Super Admin changes them).", km: "មើលបញ្ជីការកំណត់ (មានតែ Super Admin ទេដែលអាចកែប្រែ)។" }, to: "/home/settings" },
  ],
  Organizer: !APPROVALS_ENABLED ? READ_ONLY_TASKS : [
    { text: { en: "Create your events and submit them to KKF; publish them once approved.", km: "បង្កើតព្រឹត្តិការណ៍របស់អ្នក ហើយដាក់ជូន KKF រួចផ្សព្វផ្សាយក្រោយពេលអនុម័ត។" }, to: "/home/program?tab=events" },
    { text: { en: "Add fight cards and bouts to your own events.", km: "បន្ថែមកម្មវិធីប្រកួត និងគូប្រកួតទៅព្រឹត្តិការណ៍របស់អ្នក។" } },
    { text: { en: "Follow club answers; change the fighter when a club declines.", km: "តាមដានចម្លើយក្លឹប ហើយប្តូរអ្នកប្រដាល់នៅពេលក្លឹបបដិសេធ។" }, to: "/home/match-proposals" },
    { text: { en: "You can't register fighters, assign officials or record results — KKF does.", km: "អ្នកមិនអាចចុះឈ្មោះអ្នកប្រដាល់ ចាត់តាំងមន្ត្រី ឬកត់ត្រាលទ្ធផលបានទេ — KKF ជាអ្នកធ្វើ។" } },
  ],
  "Club/Gym": !APPROVALS_ENABLED ? READ_ONLY_TASKS : [
    { text: { en: "Register your fighters; KKF verifies them before they can fight.", km: "ចុះឈ្មោះអ្នកប្រដាល់របស់អ្នក ហើយ KKF ផ្ទៀងផ្ទាត់មុនពេលពួកគេអាចប្រកួត។" }, to: "/home/fighters/kunkhmer/new" },
    { text: { en: "Fix fighters KKF sent back — saving sends them to KKF again.", km: "កែតម្រូវអ្នកប្រដាល់ដែល KKF បញ្ជូនត្រឡប់ — ការរក្សាទុកនឹងបញ្ជូនទៅ KKF ម្តងទៀត។" }, to: "/home" },
    { text: { en: "Accept or decline bouts for your fighters, with a reason when you decline.", km: "ទទួលយក ឬបដិសេធគូប្រកួតសម្រាប់អ្នកប្រដាល់របស់អ្នក ដោយផ្តល់មូលហេតុនៅពេលបដិសេធ។" }, to: "/home/match-proposals" },
  ],
  Official: [
    { text: { en: "See the bouts KKF assigned you: date, venue, fighters and rules.", km: "មើលគូប្រកួតដែល KKF បានចាត់តាំងអ្នក៖ កាលបរិច្ឆេទ ទីកន្លែង អ្នកប្រដាល់ និងច្បាប់។" }, to: "/home/my-bouts" },
    { text: { en: "Ask KKF if an assignment needs to change.", km: "សូមសួរ KKF ប្រសិនបើការចាត់តាំងត្រូវការផ្លាស់ប្តូរ។" } },
  ],
};

const ALL_FAQ: { q: Text; a: Text; roles?: RoleKey[]; approvalsOnly?: boolean }[] = [
  {
    q: { en: "Why can't fans see a bout?", km: "ហេតុអ្វីអ្នកគាំទ្រមើលមិនឃើញគូប្រកួត?" },
    a: {
      en: APPROVALS_ENABLED
        ? "Fans see a bout only when its event is published and both clubs accepted it (or it already has a result)."
        : "Fans see a bout once its event is published (or once the bout has a result).",
      km: APPROVALS_ENABLED
        ? "អ្នកគាំទ្រមើលឃើញគូប្រកួត លុះត្រាតែព្រឹត្តិការណ៍ត្រូវបានផ្សព្វផ្សាយ ហើយក្លឹបទាំងពីរបានទទួលយក (ឬមានលទ្ធផលរួចហើយ)។"
        : "អ្នកគាំទ្រមើលឃើញគូប្រកួត នៅពេលព្រឹត្តិការណ៍ត្រូវបានផ្សព្វផ្សាយ (ឬនៅពេលគូប្រកួតមានលទ្ធផលរួចហើយ)។",
    },
    roles: ["Super Admin", "KKF Officer", "Organizer", "Club/Gym"],
  },
  {
    q: { en: "Why can't I pick a fighter for a bout?", km: "ហេតុអ្វីខ្ញុំមិនអាចជ្រើសអ្នកប្រដាល់សម្រាប់គូប្រកួតបាន?" },
    a: {
      en: APPROVALS_ENABLED
        ? "Only fighters KKF has verified can be matched. Look for fighters waiting for verification on the Fighters page."
        : "Only active fighters can be matched. Draft fighters are marked on the Fighters page — open one and press Activate.",
      km: APPROVALS_ENABLED
        ? "មានតែអ្នកប្រដាល់ដែល KKF បានផ្ទៀងផ្ទាត់ទេ ដែលអាចផ្គូផ្គងបាន។ សូមមើលអ្នកប្រដាល់ដែលកំពុងរង់ចាំការផ្ទៀងផ្ទាត់នៅទំព័រ «អ្នកប្រដាល់»។"
        : "មានតែអ្នកប្រដាល់សកម្មទេ ដែលអាចផ្គូផ្គងបាន។ អ្នកប្រដាល់ជាសេចក្តីព្រាង មានសម្គាល់នៅទំព័រ «អ្នកប្រដាល់» — សូមបើកម្នាក់ ហើយចុច «Activate»។",
    },
    roles: ["Super Admin", "KKF Officer", "Organizer"],
  },
  {
    q: { en: "KKF sent something back. What now?", km: "KKF បានបញ្ជូនអ្វីមួយត្រឡប់មកវិញ។ ត្រូវធ្វើអ្វីបន្ទាប់?" },
    a: {
      en: "The reason is shown on the event or fighter and on your dashboard. Make the change and submit (event) or save (fighter) — it goes back to KKF.",
      km: "មូលហេតុត្រូវបានបង្ហាញនៅលើព្រឹត្តិការណ៍ ឬអ្នកប្រដាល់ និងនៅលើផ្ទាំងគ្រប់គ្រងរបស់អ្នក។ កែតម្រូវ ហើយដាក់ជូន (ព្រឹត្តិការណ៍) ឬរក្សាទុក (អ្នកប្រដាល់) — វានឹងត្រឡប់ទៅ KKF វិញ។",
    },
    roles: ["Organizer", "Club/Gym"],
    approvalsOnly: true,
  },
  {
    q: { en: "A weight class, venue or glove brand is missing.", km: "ខ្វះថ្នាក់ទម្ងន់ ទីកន្លែង ឬម៉ាកស្រោមដៃ។" },
    a: {
      en: "The Super Admin adds it under System Settings. Events and bouts already saved keep their values.",
      km: "Super Admin បន្ថែមវានៅក្នុង «ការកំណត់ប្រព័ន្ធ»។ ព្រឹត្តិការណ៍ និងគូប្រកួតដែលបានរក្សាទុករួច នៅរក្សាតម្លៃដដែល។",
    },
  },
  {
    q: { en: "I forgot my password.", km: "ខ្ញុំភ្លេចពាក្យសម្ងាត់។" },
    a: {
      en: "Ask a KKF Super Admin to set a new one. You can change it yourself later under My profile.",
      km: "សូមស្នើ Super Admin របស់ KKF កំណត់ពាក្យសម្ងាត់ថ្មី។ អ្នកអាចប្តូរវាដោយខ្លួនឯងនៅពេលក្រោយ នៅ «ប្រវត្តិរូបរបស់ខ្ញុំ»។",
    },
  },
];

const FAQ = ALL_FAQ.filter((f) => APPROVALS_ENABLED || !f.approvalsOnly);

function roleKey(apiRole?: string): RoleKey | null {
  if (apiRole === "Referee" || apiRole === "Judge") return "Official";
  return apiRole && apiRole in ROLE_NAMES ? (apiRole as RoleKey) : null;
}

export function Help() {
  const [lang, setLangState] = useState<Lang>(readLang);
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* the choice just isn't remembered */
    }
  };
  const t = (x: Text) => x[lang];
  const role = roleKey(api.auth.getCurrentUser()?.role);
  const officialOnly = role === "Official";
  const faqs = FAQ.filter((f) => !f.roles || (role && f.roles.includes(role)));
  const khmer = lang === "km" ? "font-['Kantumruy_Pro',sans-serif] leading-relaxed" : "";

  return (
    <div className={`p-4 md:p-8 max-w-4xl mx-auto space-y-8 ${khmer}`} lang={lang === "km" ? "km" : "en"}>
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" aria-hidden /> {t(UI.title)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">{t(UI.intro)}</p>
        </div>
        <div role="group" aria-label="Language" className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 shrink-0">
          <Languages className="w-4 h-4 text-slate-400 mx-1.5" aria-hidden />
          {(["en", "km"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
              className={`h-8 px-3 rounded-lg text-sm font-semibold ${l === "km" ? "font-['Kantumruy_Pro',sans-serif]" : ""} ${lang === l ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              {l === "en" ? "English" : "ខ្មែរ"}
            </button>
          ))}
        </div>
      </header>

      {role && (
        <section aria-labelledby="role-title" className="rounded-2xl border border-primary/20 bg-[#f5f8fd] p-5">
          <h2 id="role-title" className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
            <UserRound className="w-5 h-5 text-primary" aria-hidden /> {t(UI.yourRole)}: {t(ROLE_NAMES[role])}
          </h2>
          <ul className="space-y-2">
            {ROLE_TASKS[role].map((task, i) => (
              <li key={i} className="flex items-start justify-between gap-3 text-sm text-slate-700">
                <span className="flex gap-2"><span className="text-primary font-bold">•</span>{t(task.text)}</span>
                {task.to && (
                  <Link to={task.to} className="inline-flex items-center gap-0.5 shrink-0 text-primary font-semibold hover:underline">
                    {t(UI.open)} <ChevronRight className="w-4 h-4" aria-hidden />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!officialOnly && (
        <section aria-labelledby="journey-title" className="space-y-3">
          <h2 id="journey-title" className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" aria-hidden /> {t(UI.journey)}
          </h2>
          <ol className="space-y-3">
            {STEPS.map((s, i) => (
              <li key={i} className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-4">
                <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {t(s.title)} <span className="ml-1 text-xs font-semibold text-slate-500">· {t(UI.who)}: {t(s.who)}</span>
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{t(s.body)}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-900">{t(UI.fighters)}</p>
            <p className="text-sm text-slate-600 mt-1">{t(FIGHTER_FLOW)}</p>
          </div>
        </section>
      )}

      <section aria-labelledby="faq-title" className="space-y-3">
        <h2 id="faq-title" className="text-lg font-semibold text-slate-900">{t(UI.faq)}</h2>
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {faqs.map((f, i) => (
            <details key={i} className="group p-4">
              <summary className="cursor-pointer list-none font-semibold text-slate-900 flex items-center justify-between gap-3">
                {t(f.q)}
                <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-90 shrink-0" aria-hidden />
              </summary>
              <p className="text-sm text-slate-600 mt-2">{t(f.a)}</p>
            </details>
          ))}
        </div>
        <p className="text-sm text-slate-500">{t(UI.contact)}</p>
      </section>
    </div>
  );
}

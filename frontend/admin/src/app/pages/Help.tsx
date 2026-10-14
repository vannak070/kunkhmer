/**
 * Help: how the management system works, in English and Khmer — the words (Match, Bout, Titles), the steps of a match
 * from creation to settlement, what the signed-in role does, and common questions. Uses the admin's language button.
 * Rewritten for Matches, match day, withdrawals, sign-off and the week view: claude/updates/help-page-matches.md.
 */
import { Link } from "react-router";
import { BookOpen, ChevronRight, HelpCircle, UserRound } from "lucide-react";
import { api } from "../utils/api";
import { useT } from "../i18n/program";
import { LangSwitch } from "../components/program/shared";

type Text = { en: string; km: string };

const UI = {
  title: { en: "Help", km: "ជំនួយ" },
  intro: {
    en: "How the Kun Khmer management system works, and what you can do with your account.",
    km: "របៀបដែលប្រព័ន្ធគ្រប់គ្រងគុនខ្មែរដំណើរការ និងអ្វីដែលអ្នកអាចធ្វើបានជាមួយគណនីរបស់អ្នក។",
  },
  words: { en: "Words used here", km: "ពាក្យដែលប្រើនៅទីនេះ" },
  journey: { en: "A match from start to finish", km: "ការប្រកួតមួយ ពីដើមដល់ចប់" },
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

const KKF: Text = { en: "KKF", km: "KKF" };

/** The words, so every screen and every conversation means the same thing. */
const WORDS: { term: Text; meaning: Text }[] = [
  { term: { en: "Match", km: "ការប្រកួត" }, meaning: { en: "One day of fights: a date, a venue and a TV station. Fans see it as one event.", km: "ថ្ងៃប្រកួតមួយ៖ កាលបរិច្ឆេទ ទីកន្លែង និងស្ថានីយទូរទស្សន៍។ អ្នកគាំទ្រឃើញវាជាព្រឹត្តិការណ៍មួយ។" } },
  { term: { en: "Bout", km: "គូប្រកួត" }, meaning: { en: "One fight between two fighters (red corner and blue corner).", km: "ការប្រកួតមួយរវាងអ្នកប្រដាល់ពីរនាក់ (ជ្រុងក្រហម និងជ្រុងខៀវ)។" } },
  { term: { en: "Fight card", km: "កម្មវិធីប្រកួត" }, meaning: { en: "The list of bouts of a match. Most matches have one, so the page only shows it when there are two.", km: "បញ្ជីគូប្រកួតរបស់ការប្រកួត។ ភាគច្រើនមានតែមួយ ដូច្នេះទំព័របង្ហាញវាតែនៅពេលមានពីរប៉ុណ្ណោះ។" } },
  { term: { en: "Title", km: "ខ្សែក្រវាត់ជើងឯក" }, meaning: { en: "A championship belt and its champion. A title bout decides who holds it.", km: "ខ្សែក្រវាត់ជើងឯក និងម្ចាស់ជើងឯករបស់វា។ ការប្រកួតដណ្ដើមខ្សែក្រវាត់កំណត់ថាអ្នកណាកាន់វា។" } },
  { term: { en: "Sign-off", km: "ការបញ្ជាក់ចុងក្រោយ" }, meaning: { en: "KKF confirms a match is finished: the results become official and are locked.", km: "KKF បញ្ជាក់ថាការប្រកួតបានបញ្ចប់៖ លទ្ធផលក្លាយជាផ្លូវការ និងត្រូវបានចាក់សោ។" } },
];

const STEPS: { who: Text; title: Text; body: Text }[] = [
  {
    who: { en: "KKF or Organizer", km: "KKF ឬអ្នករៀបចំ" },
    title: { en: "Create the match", km: "បង្កើតការប្រកួត" },
    body: {
      en: "Press New match: a name, a date, a venue and the TV station are enough — the start time and sponsors can come later. You can also start from a saved show (Start from a show) or copy last week's match from the Week tab. A new match is a draft: fans can't see it.",
      km: "ចុច «ការប្រកួតថ្មី»៖ ឈ្មោះ កាលបរិច្ឆេទ ទីកន្លែង និងស្ថានីយទូរទស្សន៍ គឺគ្រប់គ្រាន់ — ម៉ោងចាប់ផ្តើម និងអ្នកឧបត្ថម្ភអាចបន្ថែមពេលក្រោយ។ អ្នកក៏អាចចាប់ផ្តើមពីកម្មវិធីដែលបានរក្សាទុក ឬចម្លងការប្រកួតសប្តាហ៍មុនពីផ្ទាំង «សប្តាហ៍»។ ការប្រកួតថ្មីជាសេចក្តីព្រាង៖ អ្នកគាំទ្រមើលមិនឃើញ។",
    },
  },
  {
    who: { en: "Organizer sends, KKF confirms", km: "អ្នករៀបចំផ្ញើ KKF បញ្ជាក់" },
    title: { en: "Agree", km: "ព្រមព្រៀង" },
    body: {
      en: "The match page lists what is agreed offline first: the match details, the sponsors and any title belts. The organizer presses Send to KKF; KKF presses Confirm (KKF staff can confirm directly). A match can only be published once its details are confirmed.",
      km: "ទំព័រការប្រកួតរាយបញ្ជីអ្វីដែលព្រមព្រៀងគ្នានៅក្រៅប្រព័ន្ធជាមុន៖ ព័ត៌មានការប្រកួត អ្នកឧបត្ថម្ភ និងខ្សែក្រវាត់ (បើមាន)។ អ្នករៀបចំចុច «ផ្ញើទៅ KKF» ហើយ KKF ចុច «បញ្ជាក់» (បុគ្គលិក KKF អាចបញ្ជាក់ដោយផ្ទាល់)។ ការប្រកួតអាចផ្សព្វផ្សាយបាន លុះត្រាតែព័ត៌មានរបស់វាត្រូវបានបញ្ជាក់។",
    },
  },
  {
    who: KKF,
    title: { en: "Add the bouts", km: "បន្ថែមគូប្រកួត" },
    body: {
      en: "Press Add bouts: choose the red and the blue fighter (fighters near the agreed weight come first), the weight, the rules and the gloves. As soon as both fighters are chosen the KKF rules are checked, in plain words, with a button to fix each problem. Add several bouts saves time on a long card. A corner can stay empty (“to be announced” or “winner of bout 3”), and a foreign guest fighter needs no birth date.",
      km: "ចុច «បន្ថែមគូប្រកួត»៖ ជ្រើសអ្នកប្រដាល់ជ្រុងក្រហម និងជ្រុងខៀវ (អ្នកដែលមានទម្ងន់ជិតទម្ងន់ព្រមព្រៀងមកមុន) ទម្ងន់ ច្បាប់ និងស្រោមដៃ។ ពេលជ្រើសអ្នកប្រដាល់ទាំងពីររួច ច្បាប់ KKF ត្រូវបានពិនិត្យភ្លាមៗ ជាពាក្យសាមញ្ញ ជាមួយប៊ូតុងដើម្បីកែបញ្ហានីមួយៗ។ «បន្ថែមគូប្រកួតច្រើន» សន្សំពេលនៅពេលមានគូច្រើន។ ជ្រុងមួយអាចទុកទំនេរ (“នឹងប្រកាស” ឬ “អ្នកឈ្នះគូទី ៣”) ហើយអ្នកប្រដាល់បរទេសអញ្ជើញមិនត្រូវការថ្ងៃខែឆ្នាំកំណើតទេ។",
    },
  },
  {
    who: KKF,
    title: { en: "Referee and judges", km: "អាជ្ញាកណ្តាល និងចៅក្រម" },
    body: {
      en: "Assign a referee and three judges to each bout. The list shows how many bouts each official already has that day. Officials see their bouts under My bouts.",
      km: "ចាត់តាំងអាជ្ញាកណ្តាលម្នាក់ និងចៅក្រមបីនាក់សម្រាប់គូប្រកួតនីមួយៗ។ បញ្ជីបង្ហាញថាមន្ត្រីម្នាក់ៗមានគូប្រកួតប៉ុន្មានរួចហើយនៅថ្ងៃនោះ។ មន្ត្រីមើលគូប្រកួតរបស់ខ្លួននៅ «គូប្រកួតរបស់ខ្ញុំ»។",
    },
  },
  {
    who: KKF,
    title: { en: "Publish", km: "ផ្សព្វផ្សាយ" },
    body: {
      en: "When the card is ready, press Publish. Fans then see the match and its bouts. A match with no bouts, or whose details are not confirmed yet, can't be published — the page says why.",
      km: "នៅពេលកម្មវិធីរួចរាល់ ចុច «ផ្សព្វផ្សាយ»។ បន្ទាប់មកអ្នកគាំទ្រមើលឃើញការប្រកួត និងគូប្រកួតរបស់វា។ ការប្រកួតដែលគ្មានគូប្រកួត ឬព័ត៌មានមិនទាន់បានបញ្ជាក់ មិនអាចផ្សព្វផ្សាយបានទេ — ទំព័រប្រាប់មូលហេតុ។",
    },
  },
  {
    who: KKF,
    title: { en: "Match day", km: "ថ្ងៃប្រកួត" },
    body: {
      en: "On the day press Start match day. It shows one bout at a time with big buttons, made for a phone: first the weigh-in (a fighter within 1 kg of the agreed weight passes), then the result — who won, how, which round. Saving moves you to the next bout. Match day needs an internet connection.",
      km: "នៅថ្ងៃប្រកួតចុច «ចាប់ផ្តើមថ្ងៃប្រកួត»។ វាបង្ហាញគូប្រកួតម្តងមួយ ជាមួយប៊ូតុងធំ សម្រាប់ទូរស័ព្ទ៖ ដំបូងថ្លឹងទម្ងន់ (អ្នកប្រដាល់ដែលមានទម្ងន់ខុសពីទម្ងន់ព្រមព្រៀងមិនលើស ១ គីឡូក្រាម គឺជាប់) បន្ទាប់មកលទ្ធផល — អ្នកណាឈ្នះ ដោយរបៀបណា ទឹកទីប៉ុន្មាន។ ការរក្សាទុកនាំអ្នកទៅគូបន្ទាប់។ ថ្ងៃប្រកួតត្រូវការអ៊ីនធឺណិត។",
    },
  },
  {
    who: { en: "KKF (Organizer before match day)", km: "KKF (អ្នករៀបចំមុនថ្ងៃប្រកួត)" },
    title: { en: "If the plan changes", km: "បើផែនការផ្លាស់ប្តូរ" },
    body: {
      en: "A fighter can't fight: press Withdraw a fighter and give the reason. The bout stays on the card as “Replacement needed” until you choose a replacement who also passes the KKF rules — or cancel the bout. To move the match to another date press Postpone (the rules are checked again for every bout); Cancel match needs a reason. Fans only see “Postponed” or “Cancelled”, never the reason. Everything is listed under Changes on the match page.",
      km: "អ្នកប្រដាល់ម្នាក់មិនអាចប្រកួតបាន៖ ចុច «ដកកីឡាករ» ហើយផ្តល់មូលហេតុ។ គូប្រកួតនៅតែមានក្នុងកម្មវិធីជា “ត្រូវការអ្នកជំនួស” រហូតដល់អ្នកជ្រើសអ្នកជំនួសដែលជាប់ច្បាប់ KKF ដែរ — ឬលុបចោលគូនោះ។ ដើម្បីប្តូរការប្រកួតទៅថ្ងៃផ្សេង ចុច «ពន្យារពេល» (ច្បាប់ត្រូវបានពិនិត្យម្តងទៀតសម្រាប់គូនីមួយៗ)។ «លុបចោលការប្រកួត» ត្រូវការមូលហេតុ។ អ្នកគាំទ្រឃើញតែ “បានពន្យារពេល” ឬ “បានលុបចោល” មិនឃើញមូលហេតុទេ។ អ្វីៗទាំងអស់មានក្នុង «ការផ្លាស់ប្ដូរ» នៅលើទំព័រការប្រកួត។",
    },
  },
  {
    who: KKF,
    title: { en: "Results", km: "លទ្ធផល" },
    body: {
      en: "KKF records the winner, the method and the round. Fighter records, title holders and the fan site update, and fans who follow the fighters are notified.",
      km: "KKF កត់ត្រាអ្នកឈ្នះ វិធីឈ្នះ និងទឹក។ កំណត់ត្រាអ្នកប្រដាល់ ម្ចាស់ខ្សែក្រវាត់ និងគេហទំព័រអ្នកគាំទ្រ ត្រូវបានធ្វើបច្ចុប្បន្នភាព ហើយអ្នកគាំទ្រដែលតាមដានអ្នកប្រដាល់ត្រូវបានជូនដំណឹង។",
    },
  },
  {
    who: KKF,
    title: { en: "After the match", km: "ក្រោយការប្រកួត" },
    body: {
      en: "If someone disputes a result, record the dispute on the bout and resolve it later. When every result is in and no dispute is open, press Sign off: the results become official and are locked (only a Super Admin can correct one, with a reason). Then tick the broadcaster and each sponsor as settled.",
      km: "ប្រសិនបើមាននរណាម្នាក់ជំទាស់លទ្ធផល សូមកត់ត្រាការជំទាស់នៅលើគូប្រកួត ហើយដោះស្រាយនៅពេលក្រោយ។ នៅពេលលទ្ធផលទាំងអស់មាន ហើយគ្មានការជំទាស់ដែលនៅបើក ចុច «បញ្ជាក់ចុងក្រោយ»៖ លទ្ធផលក្លាយជាផ្លូវការ និងត្រូវបានចាក់សោ (មានតែ Super Admin ទេដែលអាចកែ ដោយមានមូលហេតុ)។ បន្ទាប់មកធីកស្ថានីយផ្សាយ និងអ្នកឧបត្ថម្ភម្នាក់ៗថាបានទូទាត់។",
    },
  },
  {
    who: KKF,
    title: { en: "The week and the program sheet", km: "សប្តាហ៍ និងសន្លឹកកម្មវិធី" },
    body: {
      en: "Matches › Week shows every match of the week by TV station and day, and flags clashes: a fighter booked twice, two shows at the same studio, a fighter over weight. Open a match and press Program sheet to print the official sheet; sign and stamp it by hand.",
      km: "«ការប្រកួត › សប្តាហ៍» បង្ហាញរាល់ការប្រកួតក្នុងសប្តាហ៍តាមស្ថានីយ និងថ្ងៃ ហើយសម្គាល់ការជាន់គ្នា៖ អ្នកប្រដាល់ត្រូវបានកក់ពីរដង កម្មវិធីពីរនៅស្ទូឌីយោតែមួយ អ្នកប្រដាល់លើសទម្ងន់។ បើកការប្រកួតមួយ ហើយចុច «សន្លឹកកម្មវិធី» ដើម្បីបោះពុម្ពសន្លឹកផ្លូវការ ហើយចុះហត្ថលេខា និងបោះត្រាដោយដៃ។",
    },
  },
];

const FIGHTER_FLOW: Text = {
  en: "KKF staff register fighters. A fighter you add is active straight away: it can be put in a bout and shown to fans. A fighter saved as Draft stays hidden until you activate it. When you type a name that looks like a fighter already registered (even spelled differently, or in Khmer), you are asked to check first. A foreign guest fighter only needs a name.",
  km: "បុគ្គលិក KKF ចុះឈ្មោះអ្នកប្រដាល់។ អ្នកប្រដាល់ដែលអ្នកបន្ថែម ក្លាយជាសកម្មភ្លាមៗ៖ អាចដាក់ក្នុងគូប្រកួត និងបង្ហាញជូនអ្នកគាំទ្រ។ អ្នកប្រដាល់ដែលរក្សាទុកជាសេចក្តីព្រាង នៅលាក់រហូតដល់អ្នកធ្វើឲ្យសកម្ម។ នៅពេលអ្នកវាយឈ្មោះដែលមើលទៅដូចអ្នកប្រដាល់ដែលបានចុះឈ្មោះរួចហើយ (សូម្បីសរសេរខុសគ្នា ឬជាភាសាខ្មែរ) អ្នកនឹងត្រូវបានស្នើឲ្យពិនិត្យមុន។ អ្នកប្រដាល់បរទេសអញ្ជើញ ត្រូវការតែឈ្មោះប៉ុណ្ណោះ។",
};

type RoleKey = "Super Admin" | "KKF Officer" | "Organizer" | "Club/Gym" | "Official";
const ROLE_NAMES: Record<RoleKey, Text> = {
  "Super Admin": { en: "Super Admin", km: "Super Admin" },
  "KKF Officer": { en: "KKF Officer", km: "មន្ត្រី KKF" },
  Organizer: { en: "Organizer", km: "អ្នករៀបចំ" },
  "Club/Gym": { en: "Club / Gym", km: "ក្លឹប" },
  Official: { en: "Referee / Judge", km: "អាជ្ញាកណ្តាល / ចៅក្រម" },
};

type Task = { text: Text; to?: string };

const KKF_TASKS: Task[] = [
  { text: { en: "Create matches, add bouts, assign officials and publish.", km: "បង្កើតការប្រកួត បន្ថែមគូប្រកួត ចាត់តាំងមន្ត្រី និងផ្សព្វផ្សាយ។" }, to: "/home/matches" },
  { text: { en: "Run match day: weigh in the fighters and record each result, one bout at a time.", km: "ដំណើរការថ្ងៃប្រកួត៖ ថ្លឹងទម្ងន់អ្នកប្រដាល់ និងកត់ត្រាលទ្ធផលម្តងមួយគូ។" } },
  { text: { en: "Withdraw or replace a fighter, postpone or cancel a match when the plan changes.", km: "ដក ឬជំនួសអ្នកប្រដាល់ ពន្យារពេល ឬលុបចោលការប្រកួតនៅពេលផែនការផ្លាស់ប្តូរ។" } },
  { text: { en: "Sign off a finished match, record disputes and the settlement.", km: "បញ្ជាក់ចុងក្រោយការប្រកួតដែលបានបញ្ចប់ កត់ត្រាការជំទាស់ និងការទូទាត់។" } },
  { text: { en: "See the week at a glance and print the program sheet.", km: "មើលសប្តាហ៍ទាំងមូលក្នុងមួយភ្លែត និងបោះពុម្ពសន្លឹកកម្មវិធី។" }, to: "/home/matches?tab=week" },
  { text: { en: "Register fighters (active at once) and keep their profiles up to date.", km: "ចុះឈ្មោះអ្នកប្រដាល់ (សកម្មភ្លាមៗ) ហើយធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបរបស់ពួកគេ។" }, to: "/home/fighters" },
  { text: { en: "Keep Titles, Clubs and the Officials list up to date.", km: "ធ្វើបច្ចុប្បន្នភាពខ្សែក្រវាត់ ក្លឹប និងបញ្ជីមន្ត្រី។" }, to: "/home/titles" },
];

const ROLE_TASKS: Record<RoleKey, Task[]> = {
  "Super Admin": [
    ...KKF_TASKS,
    { text: { en: "Create and manage staff, organizer and club accounts.", km: "បង្កើត និងគ្រប់គ្រងគណនីបុគ្គលិក អ្នករៀបចំ និងក្លឹប។" }, to: "/home/user-management" },
    { text: { en: "Edit the settings lists (weight classes, venues, bout rules, gloves, shows) and the KKF matching rules. Correct a signed-off result, with a reason.", km: "កែសម្រួលបញ្ជីការកំណត់ (ថ្នាក់ទម្ងន់ ទីកន្លែង ច្បាប់ប្រកួត ស្រោមដៃ កម្មវិធី) និងច្បាប់ផ្គូផ្គង KKF។ កែលទ្ធផលដែលបានបញ្ជាក់ចុងក្រោយ ដោយមានមូលហេតុ។" }, to: "/home/settings" },
  ],
  "KKF Officer": [
    ...KKF_TASKS,
    { text: { en: "View the settings lists (only the Super Admin changes them).", km: "មើលបញ្ជីការកំណត់ (មានតែ Super Admin ទេដែលអាចកែប្រែ)។" }, to: "/home/settings" },
  ],
  Organizer: [
    { text: { en: "Create your broadcaster's matches (New match), then send the details, sponsors and titles to KKF to confirm.", km: "បង្កើតការប្រកួតរបស់ស្ថានីយអ្នក (ការប្រកួតថ្មី) រួចផ្ញើព័ត៌មាន អ្នកឧបត្ថម្ភ និងខ្សែក្រវាត់ទៅ KKF ដើម្បីបញ្ជាក់។" }, to: "/home/events/new" },
    { text: { en: "Follow your matches: bouts, officials and results are shown to you; KKF adds them.", km: "តាមដានការប្រកួតរបស់អ្នក៖ គូប្រកួត មន្ត្រី និងលទ្ធផលត្រូវបានបង្ហាញជូនអ្នក KKF ជាអ្នកបន្ថែមវា។" }, to: "/home/matches" },
    { text: { en: "Before match day you can withdraw a fighter, postpone or cancel your match; from match day only KKF can.", km: "មុនថ្ងៃប្រកួតអ្នកអាចដកអ្នកប្រដាល់ ពន្យារពេល ឬលុបចោលការប្រកួតរបស់អ្នក ចាប់ពីថ្ងៃប្រកួតមានតែ KKF ទេ។" } },
    { text: { en: "You can't register fighters, assign officials or record results — KKF does.", km: "អ្នកមិនអាចចុះឈ្មោះអ្នកប្រដាល់ ចាត់តាំងមន្ត្រី ឬកត់ត្រាលទ្ធផលបានទេ — KKF ជាអ្នកធ្វើ។" } },
  ],
  "Club/Gym": [
    { text: { en: "Your account is read-only for now: you can view matches, bouts and fighters. KKF staff make the changes.", km: "គណនីរបស់អ្នកអាចមើលបានតែប៉ុណ្ណោះនៅពេលនេះ៖ អ្នកអាចមើលការប្រកួត គូប្រកួត និងអ្នកប្រដាល់។ បុគ្គលិក KKF ជាអ្នកធ្វើការផ្លាស់ប្តូរ។" }, to: "/home/matches" },
    { text: { en: "Ask KKF to add or change anything.", km: "សូមស្នើ KKF ដើម្បីបន្ថែម ឬផ្លាស់ប្តូរអ្វីមួយ។" } },
  ],
  Official: [
    { text: { en: "See the bouts KKF assigned you: date, venue, fighters and rules.", km: "មើលគូប្រកួតដែល KKF បានចាត់តាំងអ្នក៖ កាលបរិច្ឆេទ ទីកន្លែង អ្នកប្រដាល់ និងច្បាប់។" }, to: "/home/my-bouts" },
    { text: { en: "Ask KKF if an assignment needs to change.", km: "សូមសួរ KKF ប្រសិនបើការចាត់តាំងត្រូវការផ្លាស់ប្តូរ។" } },
  ],
};

const ALL_FAQ: { q: Text; a: Text; roles?: RoleKey[] }[] = [
  {
    q: { en: "Why can't fans see a bout?", km: "ហេតុអ្វីអ្នកគាំទ្រមើលមិនឃើញគូប្រកួត?" },
    a: {
      en: "Fans see a bout once its match is published. They don't see a bout that is cancelled or waiting for a replacement. Results show as “Official” once KKF has signed the match off.",
      km: "អ្នកគាំទ្រមើលឃើញគូប្រកួត នៅពេលការប្រកួតត្រូវបានផ្សព្វផ្សាយ។ ពួកគេមិនឃើញគូដែលត្រូវបានលុបចោល ឬកំពុងរង់ចាំអ្នកជំនួសទេ។ លទ្ធផលបង្ហាញជា “ផ្លូវការ” នៅពេល KKF បានបញ្ជាក់ចុងក្រោយការប្រកួត។",
    },
    roles: ["Super Admin", "KKF Officer", "Organizer", "Club/Gym"],
  },
  {
    q: { en: "A red box says two fighters can't fight yet. What do I do?", km: "ប្រអប់ក្រហមប្រាប់ថាអ្នកប្រដាល់ទាំងពីរមិនទាន់អាចប្រកួតបាន។ ត្រូវធ្វើអ្វី?" },
    a: {
      en: "The box says what breaks a KKF rule. Use its button: choose another fighter, or open the fighter's page (for example to update the medical status). The Add bout button stays off until nothing blocks. A yellow note is only a warning: you can still add the bout. Only the Super Admin can switch a rule off or change its limit, in Settings › Matching rules.",
      km: "ប្រអប់នោះប្រាប់ថាអ្វីបំពានច្បាប់ KKF។ ប្រើប៊ូតុងរបស់វា៖ ជ្រើសអ្នកប្រដាល់ផ្សេង ឬបើកទំព័ររបស់អ្នកប្រដាល់ (ឧទាហរណ៍ដើម្បីធ្វើបច្ចុប្បន្នភាពស្ថានភាពពេទ្យ)។ ប៊ូតុង «បន្ថែមគូប្រកួត» នៅបិទ រហូតដល់គ្មានអ្វីរារាំង។ កំណត់ចំណាំពណ៌លឿងគ្រាន់តែជាការព្រមាន៖ អ្នកនៅតែអាចបន្ថែមគូបាន។ មានតែ Super Admin ទេដែលអាចបិទច្បាប់ ឬប្តូរកម្រិតរបស់វា នៅ «ការកំណត់ › ច្បាប់ផ្គូផ្គង»។",
    },
    roles: ["Super Admin", "KKF Officer", "Organizer"],
  },
  {
    q: { en: "Why can't I pick a fighter for a bout?", km: "ហេតុអ្វីខ្ញុំមិនអាចជ្រើសអ្នកប្រដាល់សម្រាប់គូប្រកួតបាន?" },
    a: {
      en: "Only active fighters can be matched. The list shows fighters within 2 kg of the agreed weight first — turn on Show all weights to see everyone. Draft fighters are marked on the Fighters page: open one and press Activate.",
      km: "មានតែអ្នកប្រដាល់សកម្មទេ ដែលអាចផ្គូផ្គងបាន។ បញ្ជីបង្ហាញអ្នកប្រដាល់ដែលមានទម្ងន់ក្នុង ២ គីឡូក្រាមពីទម្ងន់ព្រមព្រៀងមុន — បើក «បង្ហាញគ្រប់ទម្ងន់» ដើម្បីឃើញគ្រប់គ្នា។ អ្នកប្រដាល់ជាសេចក្តីព្រាងមានសម្គាល់នៅទំព័រ «អ្នកប្រដាល់» — សូមបើកម្នាក់ ហើយចុច «ធ្វើឲ្យសកម្ម»។",
    },
    roles: ["Super Admin", "KKF Officer", "Organizer"],
  },
  {
    q: { en: "A fighter can't fight any more. What now?", km: "អ្នកប្រដាល់ម្នាក់មិនអាចប្រកួតបានទៀត។ ត្រូវធ្វើអ្វីបន្ទាប់?" },
    a: {
      en: "Open the bout and press Withdraw a fighter (it is also on Match day). Give the reason; you can also mark the fighter as injured. Then choose a replacement — the KKF rules are checked for them too — or cancel the bout. Until then the bout shows “Replacement needed” and can't be weighed in or get a result.",
      km: "បើកគូប្រកួត ហើយចុច «ដកកីឡាករ» (មានក្នុងថ្ងៃប្រកួតផងដែរ)។ ផ្តល់មូលហេតុ អ្នកក៏អាចសម្គាល់អ្នកប្រដាល់ថាមានរបួស។ បន្ទាប់មកជ្រើសអ្នកជំនួស — ច្បាប់ KKF ត្រូវបានពិនិត្យសម្រាប់ពួកគេដែរ — ឬលុបចោលគូនោះ។ ដរាបណានោះ គូប្រកួតបង្ហាញ “ត្រូវការអ្នកជំនួស” ហើយមិនអាចថ្លឹងទម្ងន់ ឬមានលទ្ធផលបានទេ។",
    },
    roles: ["Super Admin", "KKF Officer", "Organizer"],
  },
  {
    q: { en: "I can't change a result. Why?", km: "ខ្ញុំមិនអាចកែលទ្ធផលបានទេ។ ហេតុអ្វី?" },
    a: {
      en: "After KKF signs a match off, its results are locked. Only a Super Admin can correct one, and has to give a reason (kept in the match history); a Super Admin can also reopen the match.",
      km: "បន្ទាប់ពី KKF បញ្ជាក់ចុងក្រោយការប្រកួត លទ្ធផលរបស់វាត្រូវបានចាក់សោ។ មានតែ Super Admin ទេដែលអាចកែ ហើយត្រូវផ្តល់មូលហេតុ (រក្សាទុកក្នុងប្រវត្តិការប្រកួត)។ Super Admin ក៏អាចបើកការប្រកួតឡើងវិញបានដែរ។",
    },
    roles: ["Super Admin", "KKF Officer"],
  },
  {
    q: { en: "Where did “Program” and “Champions” go?", km: "«កម្មវិធី» និង «ម្ចាស់ជើងឯក» ទៅណាហើយ?" },
    a: {
      en: "Program is now Matches (Upcoming, Week, Past, Needs attention). Champions is now Titles, in the menu next to Clubs.",
      km: "«កម្មវិធី» ឥឡូវជា «ការប្រកួត» (ខាងមុខ សប្តាហ៍ កន្លងមក ត្រូវយកចិត្តទុកដាក់)។ «ម្ចាស់ជើងឯក» ឥឡូវជា «ខ្សែក្រវាត់ជើងឯក» នៅក្នុងម៉ឺនុយក្បែរ «ក្លឹប»។",
    },
    roles: ["Super Admin", "KKF Officer", "Organizer"],
  },
  {
    q: { en: "A weight class, venue, glove brand or show is missing.", km: "ខ្វះថ្នាក់ទម្ងន់ ទីកន្លែង ម៉ាកស្រោមដៃ ឬកម្មវិធី។" },
    a: {
      en: "The Super Admin adds it under System Settings. Matches and bouts already saved keep their values.",
      km: "Super Admin បន្ថែមវានៅក្នុង «ការកំណត់ប្រព័ន្ធ»។ ការប្រកួត និងគូប្រកួតដែលបានរក្សាទុករួច នៅរក្សាតម្លៃដដែល។",
    },
  },
  {
    q: { en: "How do I use this on my phone?", km: "ខ្ញុំប្រើវានៅលើទូរស័ព្ទយ៉ាងដូចម្តេច?" },
    a: {
      en: "Open the admin in your phone's browser and follow the Install card on the Dashboard: on Android press Install; on iPhone press Share, then Add to Home Screen. It then opens like an app. It needs an internet connection to load and save data.",
      km: "បើកផ្ទាំងគ្រប់គ្រងក្នុងកម្មវិធីរុករកនៃទូរស័ព្ទរបស់អ្នក ហើយធ្វើតាមកាត «ដំឡើង» នៅលើផ្ទាំងគ្រប់គ្រង៖ លើ Android ចុច «ដំឡើង» លើ iPhone ចុច «ចែករំលែក» បន្ទាប់មក «បន្ថែមទៅអេក្រង់ដើម»។ បន្ទាប់មកវាបើកដូចកម្មវិធី។ វាត្រូវការអ៊ីនធឺណិតដើម្បីផ្ទុក និងរក្សាទុកទិន្នន័យ។",
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

function roleKey(apiRole?: string): RoleKey | null {
  if (apiRole === "Referee" || apiRole === "Judge") return "Official";
  return apiRole && apiRole in ROLE_NAMES ? (apiRole as RoleKey) : null;
}

export function Help() {
  const { lang } = useT();
  const t = (x: Text) => x[lang];
  const role = roleKey(api.auth.getCurrentUser()?.role);
  const officialOnly = role === "Official";
  const faqs = ALL_FAQ.filter((f) => !f.roles || (role && f.roles.includes(role)));

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8" lang={lang}>
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" aria-hidden /> {t(UI.title)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">{t(UI.intro)}</p>
        </div>
        <span className="shrink-0"><LangSwitch /></span>
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
        <>
          <section aria-labelledby="words-title" className="space-y-3">
            <h2 id="words-title" className="text-lg font-semibold text-slate-900">{t(UI.words)}</h2>
            <dl className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
              {WORDS.map((w, i) => (
                <div key={i} className="p-4 sm:grid sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="font-semibold text-slate-900">{t(w.term)}</dt>
                  <dd className="text-sm text-slate-600 mt-1 sm:mt-0">{t(w.meaning)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="journey-title" className="space-y-3">
            <h2 id="journey-title" className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" aria-hidden /> {t(UI.journey)}
            </h2>
            <ol className="space-y-3">
              {STEPS.map((s, i) => (
                <li key={i} className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">{lang === "km" ? khmerNumber(i + 1) : i + 1}</span>
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
        </>
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

const khmerNumber = (n: number) => String(n).replace(/\d/g, (d) => "០១២៣៤៥៦៧៨៩"[Number(d)]);

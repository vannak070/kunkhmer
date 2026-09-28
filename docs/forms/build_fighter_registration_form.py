"""
Builds KKF_Fighter_Registration_Form.xlsx — the Excel form clubs fill in so KKF
staff can register their fighters in the management system.

    python3 docs/forms/build_fighter_registration_form.py

Columns follow the admin's Register Fighter page. The weight classes on the
"Lists" sheet are copied from System Settings (the 14 official classes on
2026-09-28); if KKF changes them, update WEIGHT_CLASSES here and rebuild.
"""
from pathlib import Path

from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

OUT = Path(__file__).with_name("KKF_Fighter_Registration_Form.xlsx")
ROWS = 50  # fighters per file
FIRST, EXAMPLE_ROW = 4, 3
LAST = FIRST + ROWS - 1

FONT = "Arial"
NAVY = "0A3D91"
INPUT_FILL = PatternFill("solid", fgColor="FFF9DB")   # club fills in
AUTO_FILL = PatternFill("solid", fgColor="EDEFF3")    # calculated
KKF_FILL = PatternFill("solid", fgColor="E3ECFA")     # for KKF staff
EXAMPLE_FILL = PatternFill("solid", fgColor="F4F4F4")
HEADER_FILL = PatternFill("solid", fgColor=NAVY)
THIN = Side(style="thin", color="C9CED6")
BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical="center")
CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)

# (name, upper limit kg or None for the open top class) — System Settings, 2026-09-28
WEIGHT_CLASSES = [
    ("Under 45 kg", 45), ("45 kg - 47 kg", 47), ("48 kg - 49 kg", 49), ("50 kg - 52 kg", 52),
    ("53 kg - 55 kg", 55), ("56 kg - 58 kg", 58), ("59 kg - 61 kg", 61), ("62 kg - 64 kg", 64),
    ("65 kg - 67 kg", 67), ("68 kg - 70 kg", 70), ("71 kg - 73 kg", 73), ("74 kg - 76 kg", 76),
    ("77 kg - 80 kg", 80), ("Over 80 kg", None),
]
PROVINCES = [
    "Banteay Meanchey / បន្ទាយមានជ័យ", "Battambang / បាត់ដំបង", "Kampong Cham / កំពង់ចាម",
    "Kampong Chhnang / កំពង់ឆ្នាំង", "Kampong Speu / កំពង់ស្ពឺ", "Kampong Thom / កំពង់ធំ",
    "Kampot / កំពត", "Kandal / កណ្ដាល", "Kep / កែប", "Koh Kong / កោះកុង", "Kratie / ក្រចេះ",
    "Mondulkiri / មណ្ឌលគិរី", "Oddar Meanchey / ឧត្ដរមានជ័យ", "Pailin / ប៉ៃលិន",
    "Phnom Penh / ភ្នំពេញ", "Preah Sihanouk / ព្រះសីហនុ", "Preah Vihear / ព្រះវិហារ",
    "Prey Veng / ព្រៃវែង", "Pursat / ពោធិ៍សាត់", "Ratanakiri / រតនគិរី", "Siem Reap / សៀមរាប",
    "Stung Treng / ស្ទឹងត្រែង", "Svay Rieng / ស្វាយរៀង", "Takeo / តាកែវ", "Tbong Khmum / ត្បូងឃ្មុំ",
]
GENDERS = ["Male / ប្រុស", "Female / ស្រី"]
NATIONALITIES = ["Cambodian / ខ្មែរ", "Thai / ថៃ", "Vietnamese / វៀតណាម", "Lao / ឡាវ",
                 "Myanmar / មីយ៉ាន់ម៉ា", "Other / ផ្សេងៗ"]
LEVELS = ["Professional / អាជីព", "Amateur / ស្ម័គ្រចិត្ត"]
ID_TYPES = ["National ID / អត្តសញ្ញាណប័ណ្ណ", "Passport / លិខិតឆ្លងដែន",
            "Birth certificate / សំបុត្រកំណើត", "Other / ផ្សេងៗ"]
YES_NO = ["Yes / បាទ/ចាស", "No / ទេ"]

# key, header (EN / KM), width, kind, required, example value
# kind: text | list:<name> | date | number:<min>:<max> | int:<min>:<max> | auto | kkf
COLUMNS = [
    ("no", "No.\nល.រ", 6, "auto", False, None),
    ("name_en", "Name (English) *\nឈ្មោះ (អង់គ្លេស)", 24, "text", True, "Sok Dara"),
    ("name_km", "Name (Khmer) *\nឈ្មោះ (ខ្មែរ)", 22, "text", True, "សុខ ដារ៉ា"),
    ("alias", "Nickname\nឈ្មោះហៅក្រៅ", 16, "text", False, "Tiger"),
    ("gender", "Gender *\nភេទ", 15, "list:Gender", True, "Male / ប្រុស"),
    ("dob", "Date of birth *\n(DD/MM/YYYY)\nថ្ងៃខែឆ្នាំកំណើត", 15, "date", True, "2003-05-14"),
    ("age", "Age\n(automatic)\nអាយុ", 9, "auto", False, None),
    ("pob", "Place of birth\nទីកន្លែងកំណើត", 20, "text", False, "Kampong Cham"),
    ("nationality", "Nationality *\nសញ្ជាតិ", 18, "list:Nationality", True, "Cambodian / ខ្មែរ"),
    ("province", "Province\nខេត្ត", 24, "list:Province", False, "Kampong Cham / កំពង់ចាម"),
    ("weight", "Weight (kg) *\nទម្ងន់ (គ.ក)", 11, "number:40:150", True, 60.5),
    ("weight_class", "Weight class\n(automatic)\nថ្នាក់ទម្ងន់", 16, "auto", False, None),
    ("height", "Height (cm) *\nកម្ពស់ (ស.ម)", 11, "number:100:220", True, 172),
    ("style", "Fighting style\nរចនាបថប្រកួត", 16, "text", False, "Kun Khmer"),
    ("level", "Professional / Amateur\nអាជីព / ស្ម័គ្រចិត្ត", 20, "list:Level", False, "Professional / អាជីព"),
    ("wins", "Wins\nឈ្នះ", 8, "int:0:500", False, 12),
    ("losses", "Losses\nចាញ់", 8, "int:0:500", False, 3),
    ("draws", "Draws\nស្មើ", 8, "int:0:500", False, 1),
    ("record", "Record W-L-D\n(automatic)\nកំណត់ត្រា", 13, "auto", False, None),
    ("id_type", "ID type\nប្រភេទឯកសារ", 22, "list:IdType", False, "National ID / អត្តសញ្ញាណប័ណ្ណ"),
    ("id_number", "ID / passport number\nលេខឯកសារ", 18, "text", False, "010203040"),
    ("id_expiry", "ID expiry\n(DD/MM/YYYY)\nថ្ងៃផុតកំណត់", 14, "date", False, "2030-01-31"),
    ("phone", "Phone\nលេខទូរស័ព្ទ", 15, "text", False, "012 345 678"),
    ("emergency_name", "Emergency contact name\nឈ្មោះអ្នកទំនាក់ទំនងបន្ទាន់", 22, "text", False, "Sok Chea"),
    ("emergency_relation", "Relationship\nត្រូវជា", 14, "text", False, "Father / ឪពុក"),
    ("emergency_phone", "Emergency phone\nទូរស័ព្ទបន្ទាន់", 15, "text", False, "097 123 4567"),
    ("medical_check", "Last medical check\n(DD/MM/YYYY)\nការពិនិត្យសុខភាពចុងក្រោយ", 15, "date", False, "2026-08-20"),
    ("medical_notes", "Medical conditions / allergies\nជំងឺ / អាឡែហ្ស៊ី", 24, "text", False, "None / គ្មាន"),
    ("notes", "Notes\nកំណត់សម្គាល់", 24, "text", False, ""),
    ("kkf_entered", "Registered in system\n(KKF use)\nបានចុះក្នុងប្រព័ន្ធ", 16, "kkf", False, None),
]
COL = {c[0]: get_column_letter(i + 1) for i, c in enumerate(COLUMNS)}


def font(**kw):
    return Font(name=FONT, **kw)


def build_lists(wb):
    ws = wb.create_sheet("Lists")
    ws.sheet_state = "hidden"
    lists = {
        "Gender": GENDERS, "Nationality": NATIONALITIES, "Province": PROVINCES,
        "Level": LEVELS, "IdType": ID_TYPES, "YesNo": YES_NO,
    }
    ranges = {}
    for i, (name, values) in enumerate(lists.items()):
        col = get_column_letter(i + 1)
        ws[f"{col}1"] = name
        ws[f"{col}1"].font = font(bold=True)
        for r, v in enumerate(values, start=2):
            ws[f"{col}{r}"] = v
        ranges[name] = f"Lists!${col}$2:${col}${len(values) + 1}"
    # Weight classes: name + upper limit (the open top class has none).
    ws["H1"], ws["I1"] = "Weight class", "Up to (kg)"
    ws["H1"].font = ws["I1"].font = font(bold=True)
    for r, (name, upto) in enumerate(WEIGHT_CLASSES, start=2):
        ws[f"H{r}"] = name
        if upto is not None:
            ws[f"I{r}"] = upto
    ws["K1"] = "Source: KKF System Settings → Weight classes, 2026-09-28."
    last_bounded = len([w for w in WEIGHT_CLASSES if w[1] is not None]) + 1
    ranges["WeightNames"] = f"Lists!$H$2:$H${len(WEIGHT_CLASSES) + 1}"
    ranges["WeightLimits"] = f"Lists!$I$2:$I${last_bounded}"
    for c in "ABCDEFHI":
        ws.column_dimensions[c].width = 30
    return ranges


def build_instructions(wb):
    ws = wb.active
    ws.title = "Instructions"
    ws.sheet_view.showGridLines = False
    ws.column_dimensions["A"].width = 4
    ws.column_dimensions["B"].width = 62
    ws.column_dimensions["C"].width = 62
    ws["B2"] = "Kun Khmer Federation — Fighter Registration Form"
    ws["B2"].font = font(bold=True, size=16, color=NAVY)
    ws["B3"] = "សហព័ន្ធគុនខ្មែរ — ទម្រង់ចុះឈ្មោះអ្នកប្រដាល់"
    ws["B3"].font = font(bold=True, size=14, color=NAVY)
    rows = [
        ("How to fill in this form", "របៀបបំពេញទម្រង់នេះ", True),
        ("1. Fill in the Club sheet once (your club and contact person).",
         "១. បំពេញសន្លឹក Club ម្តង (ក្លឹប និងអ្នកទំនាក់ទំនង)។", False),
        ("2. On the Fighters sheet, use one row per fighter. Row 3 is an example — leave it as it is.",
         "២. នៅសន្លឹក Fighters សរសេរអ្នកប្រដាល់ម្នាក់ក្នុងមួយជួរ។ ជួរទី ៣ ជាឧទាហរណ៍ — សូមកុំកែ។", False),
        ("3. Columns marked * are required. Choose from the drop-down list where there is one.",
         "៣. ជួរឈរដែលមានសញ្ញា * ត្រូវតែបំពេញ។ សូមជ្រើសពីបញ្ជីជម្រើស នៅកន្លែងដែលមាន។", False),
        ("4. Dates as DD/MM/YYYY (e.g. 14/05/2003). Weight in kilograms, height in centimetres.",
         "៤. កាលបរិច្ឆេទជាទម្រង់ ថ្ងៃ/ខែ/ឆ្នាំ (ឧ. 14/05/2003)។ ទម្ងន់ជាគីឡូក្រាម កម្ពស់ជាសង់ទីម៉ែត្រ។", False),
        ("5. Grey columns (age, weight class, record) fill in automatically — don't type in them.",
         "៥. ជួរឈរពណ៌ប្រផេះ (អាយុ ថ្នាក់ទម្ងន់ កំណត់ត្រា) បំពេញដោយស្វ័យប្រវត្តិ — សូមកុំសរសេរ។", False),
        ("6. Record: wins, losses and draws so far. KKF will check them.",
         "៦. កំណត់ត្រា៖ ចំនួនឈ្នះ ចាញ់ និងស្មើ រហូតមកដល់ពេលនេះ។ KKF នឹងពិនិត្យផ្ទៀងផ្ទាត់។", False),
        ("7. Photos are not needed in this form.",
         "៧. មិនចាំបាច់ភ្ជាប់រូបថតក្នុងទម្រង់នេះទេ។", False),
        ("8. Save the file and send it to KKF. KKF registers the fighters and decides their grade.",
         "៨. រក្សាទុកឯកសារ ហើយផ្ញើទៅ KKF។ KKF ចុះឈ្មោះអ្នកប្រដាល់ និងកំណត់កម្រិតរបស់ពួកគេ។", False),
        ("", "", False),
        ("Colours", "ពណ៌", True),
        ("Yellow cells — the club fills these in.", "ក្រឡាពណ៌លឿង — ក្លឹបជាអ្នកបំពេញ។", False),
        ("Grey cells — calculated automatically.", "ក្រឡាពណ៌ប្រផេះ — គណនាដោយស្វ័យប្រវត្តិ។", False),
        ("Blue cells — for KKF staff only.", "ក្រឡាពណ៌ខៀវ — សម្រាប់បុគ្គលិក KKF ប៉ុណ្ណោះ។", False),
        ("Red cells — a required value is missing in a row you started.",
         "ក្រឡាពណ៌ក្រហម — ខ្វះព័ត៌មានដែលត្រូវតែបំពេញ ក្នុងជួរដែលអ្នកបានចាប់ផ្តើម។", False),
        ("", "", False),
        ("Privacy", "ភាពឯកជន", True),
        ("This file holds personal details (ID, phone, medical). Send it only to KKF and don't share it elsewhere.",
         "ឯកសារនេះមានព័ត៌មានផ្ទាល់ខ្លួន (អត្តសញ្ញាណ ទូរស័ព្ទ សុខភាព)។ សូមផ្ញើទៅ KKF តែប៉ុណ្ណោះ ហើយកុំចែករំលែកទៅកន្លែងផ្សេង។", False),
    ]
    fills = {11: INPUT_FILL, 12: AUTO_FILL, 13: KKF_FILL, 14: PatternFill("solid", fgColor="FDE2E2")}
    for i, (en, km, heading) in enumerate(rows):
        r = 5 + i
        ws[f"B{r}"], ws[f"C{r}"] = en, km
        for c in "BC":
            cell = ws[f"{c}{r}"]
            cell.font = font(bold=heading, size=12 if heading else 11, color=NAVY if heading else "222222")
            cell.alignment = WRAP
            if i in fills:
                cell.fill = fills[i]
        ws.row_dimensions[r].height = 22 if heading or not en else 34


def build_club(wb):
    ws = wb.create_sheet("Club")
    ws.sheet_view.showGridLines = False
    ws.column_dimensions["A"].width = 4
    ws.column_dimensions["B"].width = 42
    ws.column_dimensions["C"].width = 46
    ws.column_dimensions["D"].width = 34
    ws["B2"] = "Club details / ព័ត៌មានក្លឹប"
    ws["B2"].font = font(bold=True, size=14, color=NAVY)
    fields = [
        ("Club name (English) *\nឈ្មោះក្លឹប (អង់គ្លេស)", "Sok Dara Kun Khmer Club"),
        ("Club name (Khmer) *\nឈ្មោះក្លឹប (ខ្មែរ)", "ក្លឹបគុនខ្មែរ សុខ ដារ៉ា"),
        ("Province *\nខេត្ត", "Kampong Cham / កំពង់ចាម"),
        ("Head coach\nគ្រូបង្វឹកជាន់ខ្ពស់", "Chan Vuthy"),
        ("Contact person *\nអ្នកទំនាក់ទំនង", "Sok Dara"),
        ("Contact phone *\nលេខទូរស័ព្ទទំនាក់ទំនង", "012 345 678"),
        ("Email\nអ៊ីមែល", "club@example.com"),
        ("Date sent (DD/MM/YYYY)\nកាលបរិច្ឆេទផ្ញើ", "28/09/2026"),
    ]
    ws["B3"] = "Fill in the yellow cells. The grey column shows an example. / សូមបំពេញក្រឡាពណ៌លឿង។ ជួរឈរពណ៌ប្រផេះជាឧទាហរណ៍។"
    ws["C4"], ws["D4"] = "Your club / ក្លឹបរបស់អ្នក", "Example / ឧទាហរណ៍"
    ws["C4"].font = ws["D4"].font = font(bold=True, size=10, color=NAVY)
    ws["B3"].font = font(italic=True, size=10, color="555555")
    province_dv = DataValidation(type="list", formula1="=Lists!$C$2:$C$26", allow_blank=True)
    date_dv = DataValidation(type="date", operator="between", formula1="DATE(2020,1,1)", formula2="DATE(2100,12,31)",
                             allow_blank=True, error="Please enter a date, e.g. 14/05/2026.", errorTitle="Date")
    ws.add_data_validation(province_dv)
    ws.add_data_validation(date_dv)
    for i, (label, example) in enumerate(fields):
        r = 5 + i
        ws[f"B{r}"] = label
        ws[f"B{r}"].font = font(bold=True, size=11)
        ws[f"B{r}"].alignment = WRAP
        cell = ws[f"C{r}"]
        cell.fill = INPUT_FILL
        cell.border = BOX
        cell.alignment = WRAP
        cell.font = font(size=11)
        exc = ws[f"D{r}"]
        exc.value = example or None
        exc.font = font(size=10, italic=True, color="777777")
        exc.alignment = WRAP
        ws.row_dimensions[r].height = 34
        if "Province" in label:
            province_dv.add(cell)
        if "Date sent" in label:
            date_dv.add(cell)
            cell.number_format = "DD/MM/YYYY"
        if label.startswith("Contact phone"):
            cell.number_format = "@"


def build_fighters(wb, ranges):
    ws = wb.create_sheet("Fighters")
    ws.freeze_panes = "D4"
    ws["A1"] = "Fighters / អ្នកប្រដាល់ — one row per fighter; * = required / ម្នាក់ក្នុងមួយជួរ; * = ត្រូវតែបំពេញ"
    ws["A1"].font = font(bold=True, size=13, color=NAVY)
    ws.row_dimensions[1].height = 24
    ws.row_dimensions[2].height = 58

    validations = {}

    def dv_for(kind):
        if kind in validations:
            return validations[kind]
        if kind.startswith("list:"):
            name = kind.split(":")[1]
            dv = DataValidation(type="list", formula1=f"={ranges[name]}", allow_blank=True,
                                error="Please choose from the list.", errorTitle="Choose from the list")
            if name == "Nationality":
                dv.showErrorMessage = False  # other nationalities may be typed
        elif kind == "date":
            dv = DataValidation(type="date", operator="between", formula1="DATE(1950,1,1)", formula2="DATE(2100,12,31)",
                                allow_blank=True, error="Please enter a date as DD/MM/YYYY, e.g. 14/05/2003.",
                                errorTitle="Date")
        elif kind.startswith("number:") or kind.startswith("int:"):
            t, lo, hi = kind.split(":")
            dv = DataValidation(type="decimal" if t == "number" else "whole", operator="between",
                                formula1=lo, formula2=hi, allow_blank=True,
                                error=f"Please enter a number from {lo} to {hi}.", errorTitle="Number")
        elif kind == "kkf":
            dv = DataValidation(type="list", formula1=f"={ranges['YesNo']}", allow_blank=True)
        else:
            return None
        ws.add_data_validation(dv)
        validations[kind] = dv
        return dv

    for i, (key, header, width, kind, required, example) in enumerate(COLUMNS):
        col = get_column_letter(i + 1)
        ws.column_dimensions[col].width = width
        h = ws[f"{col}2"]
        h.value = header
        h.font = font(bold=True, color="FFFFFF", size=10)
        h.fill = HEADER_FILL if kind not in ("auto", "kkf") else PatternFill("solid", fgColor="5B6B85" if kind == "auto" else "2F5FAF")
        h.alignment = CENTER
        h.border = BOX

        fill = AUTO_FILL if kind == "auto" else KKF_FILL if kind == "kkf" else INPUT_FILL
        dv = dv_for(kind)
        for r in range(EXAMPLE_ROW, LAST + 1):
            cell = ws[f"{col}{r}"]
            cell.border = BOX
            cell.alignment = Alignment(vertical="center", wrap_text=kind == "text")
            cell.fill = EXAMPLE_FILL if r == EXAMPLE_ROW and kind not in ("auto",) else fill
            cell.font = font(size=10, italic=r == EXAMPLE_ROW, color="777777" if r == EXAMPLE_ROW else "000000")
            if kind == "date":
                cell.number_format = "DD/MM/YYYY"
            elif kind.startswith("number:"):
                cell.number_format = "0.0"
            elif kind == "text" and key in ("phone", "emergency_phone", "id_number"):
                cell.number_format = "@"  # keep leading zeros
            if dv is not None and r >= FIRST:
                dv.add(cell)

        # Example row values
        ex = ws[f"{col}{EXAMPLE_ROW}"]
        if example not in (None, ""):
            if kind == "date":
                y, m, d = (int(x) for x in example.split("-"))
                from datetime import date
                ex.value = date(y, m, d)
            else:
                ex.value = example

    # Row numbers and automatic columns (example row included).
    for r in range(EXAMPLE_ROW, LAST + 1):
        ws[f"{COL['no']}{r}"] = "e.g." if r == EXAMPLE_ROW else r - FIRST + 1
        ws[f"{COL['no']}{r}"].alignment = CENTER
        dob, w, wins, losses, draws = (f"{COL[k]}{r}" for k in ("dob", "weight", "wins", "losses", "draws"))
        ws[f"{COL['age']}{r}"] = f'=IF({dob}="","",DATEDIF({dob},TODAY(),"Y"))'
        ws[f"{COL['weight_class']}{r}"] = (
            f'=IF({w}="","",INDEX({ranges["WeightNames"]},COUNTIF({ranges["WeightLimits"]},"<"&{w})+1))'
        )
        ws[f"{COL['record']}{r}"] = (
            f'=IF(AND({wins}="",{losses}="",{draws}=""),"",N({wins})&"-"&N({losses})&"-"&N({draws}))'
        )
        for k in ("age", "weight_class", "record"):
            ws[f"{COL[k]}{r}"].alignment = CENTER

    # Red highlight: a required cell left empty in a row that has anything filled in.
    first_col, last_input = COL["name_en"], COL["notes"]
    red = PatternFill("solid", fgColor="FDE2E2")
    for key, _h, _w, kind, required, _e in COLUMNS:
        if required:
            c = COL[key]
            ws.conditional_formatting.add(
                f"{c}{FIRST}:{c}{LAST}",
                FormulaRule(formula=[f'AND(COUNTA(${first_col}{FIRST}:${last_input}{FIRST})>0,{c}{FIRST}="")'], fill=red),
            )

    ws[f"{COL['weight_class']}2"].comment = Comment(
        "Worked out from the weight using KKF's 14 official weight classes "
        "(System Settings, 2026-09-28): the class with the lowest upper limit at or above the weight.",
        "KKF",
    )
    ws[f"{COL['record']}2"].comment = Comment("Wins-Losses-Draws, as entered in the system.", "KKF")
    ws[f"{COL['kkf_entered']}2"].comment = Comment("KKF staff: set to Yes once the fighter is registered in the system.", "KKF")
    ws.auto_filter.ref = f"A2:{COL['kkf_entered']}{LAST}"
    ws.print_title_rows = "2:2"
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True


def main():
    wb = Workbook()
    build_instructions(wb)
    ranges = build_lists(wb)
    build_club(wb)
    build_fighters(wb, ranges)
    # Sheet order: Instructions, Club, Fighters, (Lists hidden)
    wb.move_sheet("Lists", offset=2)
    wb.active = wb.sheetnames.index("Instructions")
    # openpyxl stores no calculated values; make Excel work out every formula on opening.
    wb.calculation.fullCalcOnLoad = True
    wb.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()

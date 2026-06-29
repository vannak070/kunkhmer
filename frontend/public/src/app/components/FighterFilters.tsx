import { Filter, Weight, Building2, Award, ChevronDown, X, ChevronUp } from "lucide-react";

interface FighterFiltersProps {
  fighters: Array<{ weight: string; gym: string }>;
  fighterFilter: "all" | "weight" | "club" | "grade";
  setFighterFilter: (filter: "all" | "weight" | "club" | "grade") => void;
  selectedFighterWeightClass: string;
  setSelectedFighterWeightClass: (value: string) => void;
  selectedFighterClub: string;
  setSelectedFighterClub: (value: string) => void;
  selectedFighterGrade: string;
  setSelectedFighterGrade: (value: string) => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export function FighterFilters({
  fighters,
  fighterFilter,
  setFighterFilter,
  selectedFighterWeightClass,
  setSelectedFighterWeightClass,
  selectedFighterClub,
  setSelectedFighterClub,
  selectedFighterGrade,
  setSelectedFighterGrade,
  isVisible = false,
  onToggleVisibility,
}: FighterFiltersProps) {
  return (
    <div className="p-5 border-b border-gray-200">
      <div className="flex flex-col gap-4">
        {/* Filter Header with Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-bold text-gray-700">Filters:</span>
          </div>
          {onToggleVisibility && (
            <button
              onClick={onToggleVisibility}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
            >
              {isVisible ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Hide Filters</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Show Filters</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Filter Controls */}
        {isVisible && (
          <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setFighterFilter("all");
              setSelectedFighterWeightClass("all");
              setSelectedFighterClub("all");
              setSelectedFighterGrade("all");
            }}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              selectedFighterWeightClass === "all" && selectedFighterClub === "all" && selectedFighterGrade === "all"
                ? "bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white shadow-md"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All Fighters
          </button>

          {/* Weight Class Filter */}
          <div className="relative">
            <button
              onClick={() => setFighterFilter(fighterFilter === "weight" ? "all" : "weight")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                selectedFighterWeightClass !== "all"
                  ? "bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white shadow-md"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Weight className="w-4 h-4" />
              <span>{selectedFighterWeightClass !== "all" ? selectedFighterWeightClass : "Weight Class"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${fighterFilter === "weight" ? "rotate-180" : ""}`} />
            </button>
            {fighterFilter === "weight" && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 z-20 min-w-[220px] max-h-[300px] overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedFighterWeightClass("all");
                    setFighterFilter("all");
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50"
                >
                  All Weight Classes
                </button>
                {Array.from(new Set(fighters.map(f => f.weight))).sort().map((weight) => (
                  <button
                    key={weight}
                    onClick={() => {
                      setSelectedFighterWeightClass(weight);
                      setFighterFilter("all");
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      selectedFighterWeightClass === weight
                        ? "bg-[#0A3D91] text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Club/Gym Filter */}
          <div className="relative">
            <button
              onClick={() => setFighterFilter(fighterFilter === "club" ? "all" : "club")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                selectedFighterClub !== "all"
                  ? "bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white shadow-md"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{selectedFighterClub !== "all" ? selectedFighterClub : "Club"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${fighterFilter === "club" ? "rotate-180" : ""}`} />
            </button>
            {fighterFilter === "club" && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 z-20 min-w-[220px] max-h-[300px] overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedFighterClub("all");
                    setFighterFilter("all");
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50"
                >
                  All Clubs
                </button>
                {Array.from(new Set(fighters.map(f => f.gym))).sort().map((gym) => (
                  <button
                    key={gym}
                    onClick={() => {
                      setSelectedFighterClub(gym);
                      setFighterFilter("all");
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      selectedFighterClub === gym
                        ? "bg-[#0A3D91] text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {gym}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grade Filter */}
          <div className="relative">
            <button
              onClick={() => setFighterFilter(fighterFilter === "grade" ? "all" : "grade")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                selectedFighterGrade !== "all"
                  ? "bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white shadow-md"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{selectedFighterGrade !== "all" ? `Grade ${selectedFighterGrade}` : "Grade"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${fighterFilter === "grade" ? "rotate-180" : ""}`} />
            </button>
            {fighterFilter === "grade" && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 z-20 min-w-[220px]">
                <button
                  onClick={() => {
                    setSelectedFighterGrade("all");
                    setFighterFilter("all");
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50"
                >
                  All Grades
                </button>
                {["A", "B"].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => {
                      setSelectedFighterGrade(grade);
                      setFighterFilter("all");
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      selectedFighterGrade === grade
                        ? "bg-[#0A3D91] text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Grade {grade} {grade === "A" ? "(Verified)" : "(Standard)"}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        )}

        {/* Active Filters Display */}
        {isVisible && (selectedFighterWeightClass !== "all" || selectedFighterClub !== "all" || selectedFighterGrade !== "all") && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Filters:</span>
            {selectedFighterWeightClass !== "all" && (
              <span className="group px-3 py-1.5 bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
                <Weight className="w-3 h-3" />
                {selectedFighterWeightClass}
                <button
                  onClick={() => setSelectedFighterWeightClass("all")}
                  className="hover:bg-white/20 rounded transition-colors p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedFighterClub !== "all" && (
              <span className="group px-3 py-1.5 bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
                <Building2 className="w-3 h-3" />
                {selectedFighterClub}
                <button
                  onClick={() => setSelectedFighterClub("all")}
                  className="hover:bg-white/20 rounded transition-colors p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedFighterGrade !== "all" && (
              <span className="group px-3 py-1.5 bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
                <Award className="w-3 h-3" />
                Grade {selectedFighterGrade}
                <button
                  onClick={() => setSelectedFighterGrade("all")}
                  className="hover:bg-white/20 rounded transition-colors p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedFighterWeightClass("all");
                setSelectedFighterClub("all");
                setSelectedFighterGrade("all");
              }}
              className="ml-auto text-xs font-bold text-gray-500 hover:text-[#0A3D91] transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

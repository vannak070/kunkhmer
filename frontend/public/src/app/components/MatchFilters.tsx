import { Filter, Weight, MapPin, Trophy, ChevronDown, ChevronUp, X } from "lucide-react";

interface MatchFiltersProps {
  batches: Array<{ location: string; matches: Array<{ weightClass: string; matchType: string }> }>;
  matchFilter: "all" | "weight-class" | "location" | "match-type";
  setMatchFilter: (filter: "all" | "weight-class" | "location" | "match-type") => void;
  selectedWeightClass: string;
  setSelectedWeightClass: (value: string) => void;
  selectedLocation: string;
  setSelectedLocation: (value: string) => void;
  selectedMatchType: string;
  setSelectedMatchType: (value: string) => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export function MatchFilters({
  batches,
  matchFilter,
  setMatchFilter,
  selectedWeightClass,
  setSelectedWeightClass,
  selectedLocation,
  setSelectedLocation,
  selectedMatchType,
  setSelectedMatchType,
  isVisible = false,
  onToggleVisibility,
}: MatchFiltersProps) {
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
                setMatchFilter("all");
                setSelectedWeightClass("all");
                setSelectedLocation("all");
                setSelectedMatchType("all");
              }}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                matchFilter === "all" && selectedWeightClass === "all" && selectedLocation === "all" && selectedMatchType === "all"
                  ? "bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white shadow-md"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              All Matches
            </button>

            {/* Weight Class Filter */}
            <div className="relative">
              <button
                onClick={() => setMatchFilter(matchFilter === "weight-class" ? "all" : "weight-class")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  selectedWeightClass !== "all"
                    ? "bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white shadow-md"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <Weight className="w-4 h-4" />
                <span>{selectedWeightClass !== "all" ? selectedWeightClass : "Weight Class"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${matchFilter === "weight-class" ? "rotate-180" : ""}`} />
              </button>
              {matchFilter === "weight-class" && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 z-20 min-w-[220px] max-h-[300px] overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedWeightClass("all");
                      setMatchFilter("all");
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50"
                  >
                    All Weight Classes
                  </button>
                  {Array.from(new Set(
                    batches.flatMap(b => b.matches.map(m => m.weightClass))
                  )).sort().map((weightClass) => (
                    <button
                      key={weightClass}
                      onClick={() => {
                        setSelectedWeightClass(weightClass);
                        setMatchFilter("all");
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                        selectedWeightClass === weightClass
                          ? "bg-[#0A3D91] text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {weightClass}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Filter */}
            <div className="relative">
              <button
                onClick={() => setMatchFilter(matchFilter === "location" ? "all" : "location")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  selectedLocation !== "all"
                    ? "bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white shadow-md"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>{selectedLocation !== "all" ? selectedLocation : "Location"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${matchFilter === "location" ? "rotate-180" : ""}`} />
              </button>
              {matchFilter === "location" && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 z-20 min-w-[220px] max-h-[300px] overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedLocation("all");
                      setMatchFilter("all");
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50"
                  >
                    All Locations
                  </button>
                  {Array.from(new Set(batches.map(b => b.location))).sort().map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        setSelectedLocation(location);
                        setMatchFilter("all");
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                        selectedLocation === location
                          ? "bg-[#0A3D91] text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Match Type Filter */}
            <div className="relative">
              <button
                onClick={() => setMatchFilter(matchFilter === "match-type" ? "all" : "match-type")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  selectedMatchType !== "all"
                    ? "bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white shadow-md"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>{selectedMatchType !== "all" ? selectedMatchType : "Match Type"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${matchFilter === "match-type" ? "rotate-180" : ""}`} />
              </button>
              {matchFilter === "match-type" && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 z-20 min-w-[220px] max-h-[300px] overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedMatchType("all");
                      setMatchFilter("all");
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-all text-gray-600 hover:bg-gray-50"
                  >
                    All Match Types
                  </button>
                  {Array.from(new Set(
                    batches.flatMap(b => b.matches.map(m => m.matchType))
                  )).sort().map((matchType) => (
                    <button
                      key={matchType}
                      onClick={() => {
                        setSelectedMatchType(matchType);
                        setMatchFilter("all");
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                        selectedMatchType === matchType
                          ? "bg-[#0A3D91] text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {matchType}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {isVisible && (selectedWeightClass !== "all" || selectedLocation !== "all" || selectedMatchType !== "all") && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Filters:</span>
            {selectedWeightClass !== "all" && (
              <span className="group px-3 py-1.5 bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
                <Weight className="w-3 h-3" />
                {selectedWeightClass}
                <button
                  onClick={() => setSelectedWeightClass("all")}
                  className="hover:bg-white/20 rounded transition-colors p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedLocation !== "all" && (
              <span className="group px-3 py-1.5 bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
                <MapPin className="w-3 h-3" />
                {selectedLocation}
                <button
                  onClick={() => setSelectedLocation("all")}
                  className="hover:bg-white/20 rounded transition-colors p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedMatchType !== "all" && (
              <span className="group px-3 py-1.5 bg-gradient-to-r from-[#0A3D91] to-[#1565C0] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
                <Trophy className="w-3 h-3" />
                {selectedMatchType}
                <button
                  onClick={() => setSelectedMatchType("all")}
                  className="hover:bg-white/20 rounded transition-colors p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedWeightClass("all");
                setSelectedLocation("all");
                setSelectedMatchType("all");
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

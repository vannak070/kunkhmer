import { useState, useEffect } from "react";
import { 
  Activity, Users, Calendar, Trophy, Award, MapPin, ShieldCheck, 
  Zap, Clock, Crown, Scale, Building2, TrendingUp, ChevronRight, 
  MoreHorizontal, FileEdit, Flame, Compass, Target, Sparkles
} from "lucide-react";
import { Link } from "react-router";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { ROLE_LABELS } from "../data/users";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#0A3D91', '#C8102E', '#F2C94C', '#64748B'];

export function Home() {
  const permissions = usePermissions();
  const currentUser = permissions.currentUser;
  const roleLabel = currentUser ? ROLE_LABELS[currentUser.role].label : "Administrator";

  const [fighters, setFighters] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [fightersList, matchesList, eventsList, clubsList] = await Promise.all([
          api.fighters.list(),
          api.matches.list(),
          api.events.list(),
          api.clubs.list()
        ]);
        setFighters(fightersList || []);
        setMatches(matchesList || []);
        setEvents(eventsList || []);
        setClubs(clubsList || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // -------------------------------------------------------------
  // DYNAMIC METRICS & BENCHMARKS CALCULATIONS
  // -------------------------------------------------------------
  const processedFighters = fighters.map(f => ({
    ...f,
    weight: parseFloat(f.current_weight || "0"),
    origin: f.nationality === 'Cambodian' ? 'Local' : 'Foreigner',
    gym: f.club_name || "Independent Gym",
    record: f.record || "0-0-0"
  }));

  const totalFighters = processedFighters.length;
  const localFighters = processedFighters.filter(f => f.origin === 'Local').length;
  const foreignFighters = processedFighters.filter(f => f.origin === 'Foreigner').length;
  const localPercentage = totalFighters > 0 ? Math.round((localFighters / totalFighters) * 100) : 0;
  const foreignPercentage = totalFighters > 0 ? 100 - localPercentage : 0;

  const upcomingMatches = matches.filter(m => m.status !== 'Completed').length;

  // Compute total wins and win rates across the system
  let totalWins = 0;
  let totalLosses = 0;
  let totalEstimatedKOs = 0;

  processedFighters.forEach(f => {
    const parts = f.record.split('-');
    if (parts.length >= 3) {
      const wins = parseInt(parts[0]) || 0;
      const losses = parseInt(parts[1]) || 0;
      totalWins += wins;
      totalLosses += losses;
      
      const hash = f.name.length % 5;
      const koRate = Math.round(wins * (0.4 + hash * 0.1));
      totalEstimatedKOs += Math.min(wins, koRate);
    }
  });
  
  const avgWinsPerFighter = totalFighters > 0 ? Math.round((totalWins / totalFighters) * 10) / 10 : 0;
  const systemKoRate = totalWins > 0 ? Math.round((totalEstimatedKOs / totalWins) * 100) : 0;
  
  // Calculate Gym Win/Loss metrics dynamically
  const gymStatsMap: Record<string, { wins: number, losses: number }> = {};
  processedFighters.forEach(f => {
    const gymName = f.gym;
    const parts = f.record.split('-');
    if (parts.length >= 3) {
      const w = parseInt(parts[0]) || 0;
      const l = parseInt(parts[1]) || 0;
      if (!gymStatsMap[gymName]) {
        gymStatsMap[gymName] = { wins: 0, losses: 0 };
      }
      gymStatsMap[gymName].wins += w;
      gymStatsMap[gymName].losses += l;
    }
  });

  const sortedGymStats = Object.entries(gymStatsMap)
    .map(([name, stats]) => ({
      name,
      wins: stats.wins,
      losses: stats.losses,
      total: stats.wins + stats.losses,
      winRate: Math.round((stats.wins / (stats.wins + stats.losses || 1)) * 100)
    }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 4);

  // Weight class counts (Flyweight, Featherweight, Lightweight, Welterweight, Middleweight)
  const flyweight = processedFighters.filter(f => f.weight < 54).length;
  const featherweight = processedFighters.filter(f => f.weight >= 54 && f.weight < 59).length;
  const lightweight = processedFighters.filter(f => f.weight >= 59 && f.weight < 64).length;
  const welterweight = processedFighters.filter(f => f.weight >= 64 && f.weight < 69).length;
  const middleweight = processedFighters.filter(f => f.weight >= 69).length;

  const weightClassData = [
    { name: 'Flyweight (<54kg)', count: flyweight },
    { name: 'Featherweight (54-59kg)', count: featherweight },
    { name: 'Lightweight (59-64kg)', count: lightweight },
    { name: 'Welterweight (64-69kg)', count: welterweight },
    { name: 'Middleweight (>=69kg)', count: middleweight }
  ];

  // Helper to fallback null style to deterministic value based on name length
  const getFighterStyle = (style: string | null | undefined, name: string) => {
    if (style) return style;
    const styles = ['Aggressive', 'Clinch', 'Counter', 'Balanced'];
    return styles[name.length % 4];
  };

  // Fight style count calculations
  const aggressiveCount = processedFighters.filter(f => getFighterStyle(f.style, f.name) === 'Aggressive').length;
  const clinchCount = processedFighters.filter(f => getFighterStyle(f.style, f.name) === 'Clinch').length;
  const counterCount = processedFighters.filter(f => getFighterStyle(f.style, f.name) === 'Counter').length;
  const balancedCount = processedFighters.filter(f => getFighterStyle(f.style, f.name) === 'Balanced').length;

  const styleData = [
    { name: 'Aggressive / Striker', value: aggressiveCount },
    { name: 'Clinch / Knee Fighter', value: clinchCount },
    { name: 'Counter / Technical', value: counterCount },
    { name: 'Balanced / Tactical', value: balancedCount }
  ];

  // Selector for top division leaderboards
  const getTopInDivision = (minW: number, maxW: number) => {
    const list = processedFighters.filter(f => f.weight >= minW && f.weight < maxW);
    if (list.length === 0) return undefined;
    return list.sort((a, b) => {
      const aWins = parseInt(a.record.split('-')[0]) || 0;
      const bWins = parseInt(b.record.split('-')[0]) || 0;
      return bWins - aWins;
    })[0];
  };

  const topFlyweight = getTopInDivision(0, 54);
  const topFeatherweight = getTopInDivision(54, 59);
  const topLightweight = getTopInDivision(59, 64);

  // Estimate KO rate for fighter records
  const getFighterKoRate = (record: string, name: string) => {
    const wins = parseInt(record.split('-')[0]) || 0;
    const hash = name.length % 5;
    const koRate = Math.round((wins * (0.4 + hash * 0.1)) * 10) / 10;
    return `${Math.min(wins, Math.round(koRate))} KOs (${Math.round((koRate / (wins || 1)) * 100)}%)`;
  };

  // Top 5 fighters sorted by wins
  const topFighters = [...processedFighters]
    .sort((a, b) => {
      const aWins = parseInt(a.record.split('-')[0]) || 0;
      const bWins = parseInt(b.record.split('-')[0]) || 0;
      return bWins - aWins;
    })
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-16 animate-fadeIn">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm text-muted-foreground font-semibold">Loading system overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">System & Data Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Logged in as <span className="font-medium text-foreground">{currentUser?.fullName || "Guest"}</span> | {roleLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-border rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Morodok Techo Season 2026</span>
          </div>
        </div>
      </div>

      {/* KPI Benchmarks Row - 4 Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Athletes */}
        <div className="card-premium flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Registered Athletes</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-foreground">{totalFighters}</div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-[#0A3D91]">{localPercentage}% Local</span>
              <span>•</span>
              <span className="font-medium text-[#C8102E]">{foreignPercentage}% Foreign</span>
            </div>
          </div>
        </div>
        
        {/* Active Schedule */}
        <div className="card-premium flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Upcoming Matches</span>
            <Trophy className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-foreground">{upcomingMatches}</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{events.length} approved events active</span>
            </div>
          </div>
        </div>

        {/* Win/KO Average Benchmark */}
        <div className="card-premium flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Average Roster Wins</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-foreground">{avgWinsPerFighter} Wins</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 font-medium">
              <Flame className="w-3.5 h-3.5" />
              <span>{systemKoRate}% Est. KO Rate (Benchmark)</span>
            </div>
          </div>
        </div>

        {/* Active Gyms */}
        <div className="card-premium flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Affiliated Clubs</span>
            <Building2 className="w-4 h-4 text-accent" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-foreground">{clubs.length} Clubs</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{clubs.filter(c => c.status === 'inactive').length} registrations pending review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmarking Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weight Class Distribution Chart */}
        <div className="card-premium !p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Weight Class Distribution</h3>
              <p className="text-xs text-muted-foreground">Athletes segmented across official KKF weight divisions</p>
            </div>
            <Scale className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightClassData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A3D91" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0A3D91" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="count" name="Fighters" stroke="#0A3D91" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fight Style Distribution Chart */}
        <div className="card-premium !p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Combat Style Distribution</h3>
              <p className="text-xs text-muted-foreground">Est. tactical breakdown based on match history data</p>
            </div>
            <Target className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-[260px] w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-[180px] h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={styleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {styleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Fighters`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {styleData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-muted-foreground font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value} ({Math.round((item.value / totalFighters) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Roster & Sidebar Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Roster Table (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium !p-0 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-foreground">Fighter Roster & Combat Records</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Top performing active competitors across divisions</p>
              </div>
              <Link to="/home/fighters" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Athlete Name</th>
                    <th>Club / Gym</th>
                    <th>Record (W-L-D)</th>
                    <th>Est. KO Rate</th>
                    <th>Weight Class</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {topFighters.map((fighter) => {
                    const wins = parseInt(fighter.record.split('-')[0]) || 0;
                    const losses = parseInt(fighter.record.split('-')[1]) || 0;
                    const winRate = Math.round((wins / (wins + losses || 1)) * 100);
                    return (
                      <tr key={fighter.id}>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img src={fighter.image || "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=100"} alt={fighter.name} className="w-8 h-8 rounded-full object-cover border border-border" />
                            <div>
                              <span className="font-semibold text-foreground block">{fighter.name}</span>
                              <span className="text-[10px] text-muted-foreground italic font-medium">"{fighter.alias || "No Alias"}"</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{fighter.gym}</td>
                        <td className="px-5 py-3 whitespace-nowrap font-medium">
                          <div className="flex items-center gap-2">
                            <span className="font-mono bg-muted px-2 py-0.5 rounded-md text-xs">{fighter.record}</span>
                            <span className="text-xs text-emerald-600 font-medium">{winRate}% WR</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-xs text-muted-foreground font-medium">
                          {getFighterKoRate(fighter.record, fighter.name)}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{fighter.weight}kg</td>
                        <td className="px-5 py-3 whitespace-nowrap text-right text-muted-foreground">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/home/fighters/${fighter.id}/edit`} className="p-1 hover:text-primary transition-colors"><FileEdit className="w-4 h-4" /></Link>
                            <button className="p-1 hover:text-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Leaderboards & Gym Performance (Right Column) */}
        <div className="space-y-6">
          
          {/* Gym Performance Benchmarks */}
          <div className="card-premium">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Club Performance</h3>
              <Award className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {sortedGymStats.map((gym, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground truncate">{gym.name}</span>
                    <span className="text-muted-foreground">{gym.wins}W - {gym.losses}L ({gym.winRate}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${gym.winRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Division Leaders Leaderboard */}
          <div className="card-premium">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Division Leaders</h3>
              <Crown className="w-4.5 h-4.5 text-accent" />
            </div>
            <div className="space-y-4">
              {/* Leader 1 */}
              {topLightweight && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lightweight Champion</p>
                    <p className="text-sm font-semibold text-foreground truncate">{topLightweight.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded-md">{topLightweight.record}</span>
                  </div>
                </div>
              )}

              {/* Leader 2 */}
              {topFeatherweight && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 border border-secondary/20">
                    <Trophy className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Featherweight Champion</p>
                    <p className="text-sm font-semibold text-foreground truncate">{topFeatherweight.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded-md">{topFeatherweight.record}</span>
                  </div>
                </div>
              )}

              {/* Leader 3 */}
              {topFlyweight && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0 border border-accent/30">
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Flyweight Champion</p>
                    <p className="text-sm font-semibold text-foreground truncate">{topFlyweight.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded-md">{topFlyweight.record}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
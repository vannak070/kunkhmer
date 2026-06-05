import { Activity, Users, Calendar, Trophy, Award, MapPin, ShieldCheck, Zap, Clock, Crown, Scale, Tv, Building2, TrendingUp, DollarSign, ListTodo, ChevronRight, MoreHorizontal, FileEdit } from "lucide-react";
import { Link } from "react-router";
import { MOCK_FIGHTERS, MOCK_MATCHES, MOCK_EVENTS } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";
import { ROLE_LABELS } from "../data/users";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Jan', revenue: 4000, athletes: 2400 },
  { name: 'Feb', revenue: 3000, athletes: 1398 },
  { name: 'Mar', revenue: 2000, athletes: 9800 },
  { name: 'Apr', revenue: 2780, athletes: 3908 },
  { name: 'May', revenue: 1890, athletes: 4800 },
  { name: 'Jun', revenue: 2390, athletes: 3800 },
  { name: 'Jul', revenue: 3490, athletes: 4300 },
];

export function Home() {
  const permissions = usePermissions();
  const currentUser = permissions.currentUser;
  const roleLabel = currentUser ? ROLE_LABELS[currentUser.role] : "Administrator";

  const availableFighters = MOCK_FIGHTERS.filter(f => f.status === 'Active').length;
  const upcomingMatches = MOCK_MATCHES.filter(m => m.status === 'Scheduled').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Welcome back,</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-foreground">{currentUser?.fullName || "Guest"}</span> | {roleLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-border rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Oct 1 - Oct 31, 2023</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Total Athletes</span>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-foreground">{MOCK_FIGHTERS.length}</div>
            <p className="text-xs font-medium text-emerald-600 mt-1">+5.2% from last month</p>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Active Matches</span>
            <Trophy className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-foreground">{upcomingMatches}</div>
            <p className="text-xs font-medium text-muted-foreground mt-1">Scheduled across {MOCK_EVENTS.length} events</p>
          </div>
        </div>

        {/* Card 3 (Highlighted) */}
        <div className="bg-[#0A3D91] border border-[#083073] rounded-xl p-5 shadow-md flex flex-col justify-between text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-white/80">Projected Revenue</span>
            <DollarSign className="w-4 h-4 text-white/80" />
          </div>
          <div>
            <div className="text-2xl font-semibold">$112,450</div>
            <p className="text-xs font-medium text-emerald-400 mt-1">+12.1% from ticket sales</p>
          </div>
        </div>

        {/* Card 4 (Alert) */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-red-800">Pending Tasks</span>
            <ListTodo className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-red-700">14</div>
            <p className="text-xs font-medium text-red-600 mt-1">Medical clearances required</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart Section */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-foreground">Monthly Activity Overview</h3>
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#0A3D91]"></div> Revenue
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-slate-300"></div> Athletes
                </div>
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip 
                    cursor={{ fill: '#F1F5F9' }} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#0A3D91" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="athletes" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Roster Table Section */}
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Fighter Rosters & Status</h3>
              <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3 font-medium">Athlete Name</th>
                    <th className="px-5 py-3 font-medium">Club / Gym</th>
                    <th className="px-5 py-3 font-medium">Weight Class</th>
                    <th className="px-5 py-3 font-medium">Record</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_FIGHTERS.slice(0, 6).map((fighter) => (
                    <tr key={fighter.id} className="bg-white hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={fighter.image} alt={fighter.name} className="w-8 h-8 rounded-full object-cover border border-border" />
                          <span className="font-medium text-foreground">{fighter.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{fighter.gym}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{fighter.weight}kg</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs font-medium bg-muted px-2 py-1 rounded-md">{fighter.record}</span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          fighter.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {fighter.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-right text-muted-foreground">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1 hover:text-primary transition-colors"><FileEdit className="w-4 h-4" /></button>
                          <button className="p-1 hover:text-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          
          {/* Upcoming Matches Widget */}
          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Upcoming Matches</h3>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {MOCK_EVENTS.slice(0, 3).map((event, idx) => (
                <div key={idx} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-lg bg-muted flex flex-col items-center justify-center shrink-0 border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{event.date.substring(0, 3)}</span>
                    <span className="text-sm font-semibold text-foreground leading-none">{event.date.substring(4, 6)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{event.name}</p>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </p>
                  </div>
                  <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 bg-muted/50 hover:bg-muted text-sm font-medium text-foreground rounded-lg transition-colors border border-border">
              View All Events
            </button>
          </div>

          {/* Top Performing Gyms Widget */}
          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Top Performing Gyms</h3>
              <Award className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {[
                { name: "Phnom Penh Kun Khmer", wins: 124, trend: "+12%" },
                { name: "Tiger Boxing Gym", wins: 98, trend: "+8%" },
                { name: "Siem Reap Warriors", wins: 85, trend: "+15%" },
                { name: "Battambang Elite", wins: 72, trend: "-2%" }
              ].map((gym, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-medium text-foreground">{gym.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{gym.wins}</p>
                    <p className={`text-[10px] font-medium ${gym.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                      {gym.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
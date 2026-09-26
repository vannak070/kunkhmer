import { ArrowRight, CheckCircle, Clock, Users, Shield, FileText, Settings, Crown, AlertTriangle, Zap, Calendar, Trophy, Building2, Radio, Dumbbell, Weight, PlayCircle, Target } from "lucide-react";
import { Link } from "react-router";
import { usePermissions } from "../hooks/usePermissions";

export function SystemProcessFlow() {
  const permissions = usePermissions();
  const currentUser = permissions.currentUser;

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Settings className="w-10 h-10 text-[#0A3D91]" />
            <div>
              <h1 className="text-4xl font-black text-[#0A3D91]">System Process Flow</h1>
              <p className="text-[#707070] mt-1 font-medium">Streamlined operational workflow for KUNKHMER Digital Platform</p>
            </div>
          </div>
        </div>

        {/* Role Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* KKF Super Admin */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-300 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-purple-900">Super Admin</h2>
                <p className="text-sm text-purple-700 font-bold">System Oversight & Configuration</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <p className="text-sm text-purple-900 font-medium">Monitor all operations and activities</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <p className="text-sm text-purple-900 font-medium">Manage users and permissions</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <p className="text-sm text-purple-900 font-medium">System configuration and settings</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <p className="text-sm text-purple-900 font-medium">View reports and analytics</p>
              </div>
            </div>
          </div>

          {/* KKF Officer */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-300 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#C8102E] rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-red-900">KKF Officer</h2>
                <p className="text-sm text-red-700 font-bold">Day-to-Day Operations & Execution</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-[#C8102E] mt-0.5 shrink-0" />
                <p className="text-sm text-red-900 font-medium">Full CRUD operations (Create, Read, Update, Delete)</p>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-[#C8102E] mt-0.5 shrink-0" />
                <p className="text-sm text-red-900 font-medium">Manage fighters, clubs, events, and fight cards</p>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-[#C8102E] mt-0.5 shrink-0" />
                <p className="text-sm text-red-900 font-medium">Conduct weigh-ins and assign officials</p>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-[#C8102E] mt-0.5 shrink-0" />
                <p className="text-sm text-red-900 font-medium">Enter and manage match results</p>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Workflow Processes */}
        <div className="space-y-8">
          {/* 1. Fighter Registration Process */}
          <WorkflowSection
            title="Fighter Registration Process"
            icon={<Users className="w-6 h-6 text-white" />}
            iconBg="bg-blue-600"
            steps={[
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Create Fighter Profile",
                description: "Navigate to Fighters → Add Fighter (KUN KHMER or Foreigner)",
                details: [
                  "Enter personal details (Name, DOB, nationality)",
                  "Assign to Club/Gym",
                  "Upload KYC documents (ID, passport)",
                  "Upload medical certificate",
                  "Record weight class and measurements",
                  "Enter fight history (if any)",
                  "Fighter is immediately Active and eligible for matches"
                ]
              },
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Update Fighter Information",
                description: "Edit fighter profile anytime",
                details: [
                  "Update personal information",
                  "Upload new medical certificates",
                  "Update fight record",
                  "Change weight class",
                  "Update club affiliation",
                  "Changes take effect immediately"
                ]
              }
            ]}
          />

          {/* 2. Club Management Process */}
          <WorkflowSection
            title="Club/Gym Management Process"
            icon={<Building2 className="w-6 h-6 text-white" />}
            iconBg="bg-amber-600"
            steps={[
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Register Club",
                description: "Navigate to Clubs → Add New Club",
                details: [
                  "Enter club details (name, head coach)",
                  "Add location and contact information",
                  "Upload verification documents",
                  "Add facility photos",
                  "Enter establishment date",
                  "Club is immediately Active"
                ]
              },
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Manage Club",
                description: "Full club management capabilities",
                details: [
                  "View all registered clubs",
                  "Edit club details anytime",
                  "Assign fighters to clubs",
                  "Track club statistics",
                  "View club fight history",
                  "Delete clubs if needed"
                ]
              }
            ]}
          />

          {/* 3. Batch Creation & Match Building */}
          <WorkflowSection
            title="Fight Card Creation & Match Building"
            icon={<Trophy className="w-6 h-6 text-white" />}
            iconBg="bg-[#C8102E]"
            steps={[
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Create Match Fight card",
                description: "Navigate to Matches → Create Fight card",
                details: [
                  "Enter fight card details (event name, date, location)",
                  "Add venue information",
                  "Set organizer club",
                  "Add broadcast station (optional)",
                  "Add main sponsor (optional)",
                  "Fight card starts in Draft status"
                ]
              },
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Build Fight Card",
                description: "Add matches to the fight card",
                details: [
                  "Select two fighters of similar weight class",
                  "Set agreed weight for the match",
                  "Configure match rules and rounds",
                  "Mark championship bouts if applicable",
                  "Add match-specific notes",
                  "Add multiple matches to complete the card"
                ]
              },
              {
                role: "System",
                roleColor: "bg-gray-100 text-gray-700 border-gray-300",
                action: "Automatic Validation",
                description: "System validates fighter eligibility",
                details: [
                  "Check fighter status (must be Active)",
                  "Verify medical certificate validity",
                  "Check rest period compliance",
                  "Verify weight class compatibility",
                  "Check for schedule conflicts",
                  "Alert officer of any issues"
                ]
              }
            ]}
          />

          {/* 4. Batch Status Workflow (5 Stages) */}
          <WorkflowSection
            title="Fight Card Status Workflow (5 Stages)"
            icon={<Target className="w-6 h-6 text-white" />}
            iconBg="bg-indigo-600"
            steps={[
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Stage 1: Draft",
                description: "Initial fight card creation and match building",
                details: [
                  "Create fight card with event details",
                  "Add matches to fight card",
                  "Edit fight card information freely",
                  "Delete fight card if needed",
                  "Can assign officials at any time"
                ]
              },
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Stage 2: Weight-In",
                description: "Conduct weigh-in for all fighters",
                details: [
                  "Record actual weight for each fighter",
                  "System validates against agreed weight (±1kg tolerance)",
                  "Mark weigh-in as completed",
                  "Officials should be assigned before this stage",
                  "Cannot delete fight card after weigh-in starts"
                ]
              },
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Stage 3: Ready",
                description: "Fight card is ready for event day",
                details: [
                  "All weigh-ins completed",
                  "All officials assigned",
                  "Fight card finalized",
                  "Fight card is ready to go Live",
                  "Final preparations for event"
                ]
              },
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Stage 4: Live",
                description: "Event is happening now",
                details: [
                  "Matches are in progress",
                  "Enter results as matches complete",
                  "Update match status in real-time",
                  "Track event progress",
                  "Monitor all active matches"
                ]
              },
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Stage 5: Complete",
                description: "All matches finished",
                details: [
                  "All match results entered",
                  "Event concluded",
                  "Fighter records updated automatically",
                  "Rankings updated",
                  "Historical record maintained",
                  "Cannot edit after completion"
                ]
              }
            ]}
          />

          {/* 5. Official Assignment */}
          <WorkflowSection
            title="Official Assignment Process"
            icon={<Shield className="w-6 h-6 text-white" />}
            iconBg="bg-indigo-600"
            steps={[
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Assign Officials",
                description: "Navigate to Fight Card Detail → Assign Officials",
                details: [
                  "View all matches in the fight card",
                  "Assign referee for each match",
                  "Assign 3 judges for scoring",
                  "System validates official availability",
                  "Can be done at any stage (Draft onwards)",
                  "Should be completed before Weight-In stage"
                ]
              },
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Manage Officials",
                description: "Update official assignments as needed",
                details: [
                  "Replace officials if necessary",
                  "Track official workload",
                  "View official history",
                  "Ensure no conflicts",
                  "Changes can be made before event goes Live"
                ]
              }
            ]}
          />

          {/* 6. Weigh-In Process */}
          <WorkflowSection
            title="Weigh-In Process"
            icon={<Weight className="w-6 h-6 text-white" />}
            iconBg="bg-orange-600"
            steps={[
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Conduct Weigh-In",
                description: "Move fight card to Weight-In stage",
                details: [
                  "Navigate to Fight Card Detail → Weigh-In tab",
                  "Record actual weight for Fighter A",
                  "Record actual weight for Fighter B",
                  "System validates against agreed weight (±1kg tolerance)",
                  "Mark weigh-in as completed for each match",
                  "Fight card moves to Ready status when all weigh-ins complete"
                ]
              },
              {
                role: "System",
                roleColor: "bg-gray-100 text-gray-700 border-gray-300",
                action: "Weight Validation",
                description: "Automatic weight compliance check",
                details: [
                  "Compare actual weight vs agreed weight",
                  "Flag if outside ±1kg tolerance",
                  "Alert officer of weight issues",
                  "Track weight history for fighters",
                  "Prevent match if weight not acceptable"
                ]
              }
            ]}
          />

          {/* 7. Match Execution & Results */}
          <WorkflowSection
            title="Match Execution & Results"
            icon={<Dumbbell className="w-6 h-6 text-white" />}
            iconBg="bg-[#0A3D91]"
            steps={[
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Start Event (Live)",
                description: "Move fight card to Live status",
                details: [
                  "All weigh-ins must be completed",
                  "All officials must be assigned",
                  "Click 'Move to Live' button",
                  "Event officially begins",
                  "Can now enter match results"
                ]
              },
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Enter Match Results",
                description: "Record results as matches complete",
                details: [
                  "Navigate to Match Detail → Enter Results",
                  "Select winner (Fighter A/Fighter B/Draw)",
                  "Select result method (KO, TKO, Decision, Submission)",
                  "Enter round ended (if applicable)",
                  "Enter judge scores (if decision)",
                  "Add match notes",
                  "Submit results immediately"
                ]
              },
              {
                role: "System",
                roleColor: "bg-gray-100 text-gray-700 border-gray-300",
                action: "Automatic Updates",
                description: "System processes results instantly",
                details: [
                  "Update fighter records (wins/losses)",
                  "Update fighter rankings",
                  "Calculate statistics",
                  "Update club statistics",
                  "Generate match report",
                  "All changes take effect immediately"
                ]
              },
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Complete Event",
                description: "Finalize the fight card",
                details: [
                  "Ensure all match results are entered",
                  "Review fight card for completeness",
                  "Move fight card to Complete status",
                  "Event is archived",
                  "Historical record maintained",
                  "Cannot edit after completion"
                ]
              }
            ]}
          />

          {/* 8. Sponsor & Broadcast Management */}
          <WorkflowSection
            title="Sponsor & Broadcast Management"
            icon={<Radio className="w-6 h-6 text-white" />}
            iconBg="bg-pink-600"
            steps={[
              {
                role: "KKF Officer",
                roleColor: "bg-red-100 text-[#C8102E] border-red-300",
                action: "Add to Fight card",
                description: "Assign sponsors and broadcast partners",
                details: [
                  "Add main sponsor to fight card (optional)",
                  "Add broadcast station (optional)",
                  "Configure partnership details",
                  "Sponsors displayed on fight card",
                  "Broadcast info shown to public",
                  "Can be added/edited anytime before Complete"
                ]
              }
            ]}
          />

          {/* 9. User Management (Super Admin Only) */}
          <WorkflowSection
            title="User Management (Super Admin Only)"
            icon={<Shield className="w-6 h-6 text-white" />}
            iconBg="bg-purple-600"
            steps={[
              {
                role: "Super Admin",
                roleColor: "bg-purple-100 text-purple-700 border-purple-300",
                action: "Create Users",
                description: "Navigate to User Management → Add User",
                details: [
                  "Enter user credentials",
                  "Assign role (Super Admin / KKF Officer)",
                  "Set user status (Active/Inactive)",
                  "Assign to organization",
                  "User can login immediately"
                ]
              },
              {
                role: "Super Admin",
                roleColor: "bg-purple-100 text-purple-700 border-purple-300",
                action: "Manage Users",
                description: "Full user management capabilities",
                details: [
                  "View all system users",
                  "Edit user details and roles",
                  "Activate/Deactivate users",
                  "Reset passwords",
                  "Delete users",
                  "View user activity logs"
                ]
              }
            ]}
          />
        </div>

        {/* Key System Rules */}
        <div className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-[#0A3D91]" />
            <h2 className="text-2xl font-black text-[#0A3D91]">Key System Rules</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
              <h3 className="font-black text-[#0A3D91] mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Simplified Workflow
              </h3>
              <ul className="space-y-2 text-sm text-[#1A1A24]">
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>No approval processes - all changes take effect immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>KKF Officers have full operational control</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>Super Admins provide oversight and monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>Streamlined 5-stage fight card workflow</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
              <h3 className="font-black text-[#0A3D91] mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Validation Rules
              </h3>
              <ul className="space-y-2 text-sm text-[#1A1A24]">
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>Medical certificates must be valid (not expired)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>Fighters must respect minimum rest period between matches</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>Weight class compatibility required for matchups</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>Weigh-in tolerance: ±1kg from agreed weight</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
              <h3 className="font-black text-[#0A3D91] mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Role Permissions
              </h3>
              <ul className="space-y-2 text-sm text-[#1A1A24]">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">👑</span>
                  <span><strong>Super Admin:</strong> User management, system configuration, oversight, reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">⚙️</span>
                  <span><strong>KKF Officer:</strong> Full CRUD operations, execute all day-to-day operations</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
              <h3 className="font-black text-[#0A3D91] mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Fight Card Status Flow
              </h3>
              <ul className="space-y-2 text-sm text-[#1A1A24]">
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 font-bold">1.</span>
                  <span><strong>Draft:</strong> Create and build fight card</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">2.</span>
                  <span><strong>Weight-In:</strong> Conduct weigh-ins</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  <span><strong>Ready:</strong> Prepared for event day</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">4.</span>
                  <span><strong>Live:</strong> Event in progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">5.</span>
                  <span><strong>Complete:</strong> Event finished, archived</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
              <h3 className="font-black text-[#0A3D91] mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Deletion Rules
              </h3>
              <ul className="space-y-2 text-sm text-[#1A1A24]">
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>Fight cards can only be deleted in Draft status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>Cannot delete after weigh-in process starts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>Completed fight cards are archived, not deleted</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>Fighters and clubs can be deleted if not in active matches</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
              <h3 className="font-black text-[#0A3D91] mb-3 flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Operational Flow
              </h3>
              <ul className="space-y-2 text-sm text-[#1A1A24]">
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>Officers create and manage all content directly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>Changes take effect immediately - no waiting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>System validates in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold">•</span>
                  <span>Super Admins monitor and can intervene if needed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 bg-white rounded-2xl p-6 border-2 border-[#E0E0E0] shadow-lg">
          <h2 className="text-xl font-black text-[#0A3D91] mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/home" className="flex items-center gap-2 bg-[#F4F5F8] hover:bg-[#0A3D91] hover:text-white p-3 rounded-xl font-bold transition-all text-sm">
              <Calendar className="w-4 h-4" />
              Dashboard
            </Link>
            <Link to="/home/fighters" className="flex items-center gap-2 bg-[#F4F5F8] hover:bg-[#0A3D91] hover:text-white p-3 rounded-xl font-bold transition-all text-sm">
              <Users className="w-4 h-4" />
              Fighters
            </Link>
            <Link to="/home/matches" className="flex items-center gap-2 bg-[#F4F5F8] hover:bg-[#0A3D91] hover:text-white p-3 rounded-xl font-bold transition-all text-sm">
              <Trophy className="w-4 h-4" />
              Matches
            </Link>
            <Link to="/home/clubs" className="flex items-center gap-2 bg-[#F4F5F8] hover:bg-[#0A3D91] hover:text-white p-3 rounded-xl font-bold transition-all text-sm">
              <Building2 className="w-4 h-4" />
              Clubs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Workflow Section Component
interface WorkflowStep {
  role: string;
  roleColor: string;
  action: string;
  description: string;
  details: string[];
}

interface WorkflowSectionProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  steps: WorkflowStep[];
}

function WorkflowSection({ title, icon, iconBg, steps }: WorkflowSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-[#E0E0E0] shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shadow-md`}>
          {icon}
        </div>
        <h2 className="text-2xl font-black text-[#1A1A24]">{title}</h2>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-[#E0E0E0] -mb-4" />
            )}

            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-[#F4F5F8] rounded-xl flex items-center justify-center font-black text-[#0A3D91] border-2 border-[#E0E0E0] relative z-10">
                {index + 1}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold border-2 ${step.roleColor}`}>
                    {step.role}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#707070]" />
                  <span className="font-black text-[#1A1A24]">{step.action}</span>
                </div>
                
                <p className="text-sm text-[#707070] font-medium mb-3">{step.description}</p>

                <ul className="space-y-1.5 bg-[#F8F9FA] rounded-xl p-3 border border-[#E0E0E0]">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2 text-xs text-[#1A1A24]">
                      <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

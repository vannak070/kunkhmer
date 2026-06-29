import { Link } from "react-router";
import { Sparkles, ArrowRight, Shield, Smartphone } from "lucide-react";

export function PlatformSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] via-white to-[#F8F9FA] flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-[#C8102E] to-[#F2C94C] rounded-full mb-4">
            <span className="text-sm font-black text-white">KUN KHMER Digital Ecosystem</span>
          </div>
          <h1 className="text-6xl font-black text-[#1A1A24] mb-4">
            Welcome to KUNKHMER
          </h1>
          <p className="text-xl text-[#707070] font-medium">
            Choose your platform to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Website (Consumer) */}
          <Link
            to="/"
            className="group bg-white rounded-3xl shadow-xl border-4 border-[#C8102E] hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#C8102E] to-[#E91E3A] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F2C94C]/20 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <Smartphone className="w-12 h-12 text-white mb-3" />
                <h2 className="text-4xl font-black text-white mb-2">
                  Website
                </h2>
                <p className="text-sm text-white/90 font-bold">
                  For Fans & Consumers
                </p>
              </div>
            </div>
            <div className="p-8">
              <p className="text-base text-[#707070] font-medium mb-6 leading-relaxed">
                The ultimate Kun Khmer experience - watch fights, shop gear, and connect with fighters
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-[#1A1A24] font-medium">
                  <div className="w-2 h-2 bg-[#C8102E] rounded-full" />
                  News & Events
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1A1A24] font-medium">
                  <div className="w-2 h-2 bg-[#C8102E] rounded-full" />
                  Live Events & Streaming
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1A1A24] font-medium">
                  <div className="w-2 h-2 bg-[#C8102E] rounded-full" />
                  Equipment Store & Merchandise
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1A1A24] font-medium">
                  <div className="w-2 h-2 bg-[#C8102E] rounded-full" />
                  Fighter Profiles & Rankings
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1A1A24] font-medium">
                  <div className="w-2 h-2 bg-[#C8102E] rounded-full" />
                  Strategic Partners
                </div>
              </div>
              <div className="flex items-center justify-end text-[#C8102E] font-black group-hover:gap-4 transition-all">
                Launch Website
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Digital Platform (Admin) */}
          <Link
            to="/home"
            className="group bg-white rounded-3xl shadow-xl border-4 border-[#0A3D91] hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#0A3D91] to-[#051C42] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F2C94C]/20 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <Shield className="w-12 h-12 text-white mb-3" />
                <h2 className="text-4xl font-black text-white mb-2">
                  Digital Platform
                </h2>
                <p className="text-sm text-white/90 font-bold">
                  For Admins & Organizers
                </p>
              </div>
            </div>
            <div className="p-8">
              <p className="text-base text-[#707070] font-medium mb-6 leading-relaxed">
                Professional management system for administrators, organizers, clubs, and officials
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-[#1A1A24] font-medium">
                  <div className="w-2 h-2 bg-[#0A3D91] rounded-full" />
                  Fighter Management & Registration
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1A1A24] font-medium">
                  <div className="w-2 h-2 bg-[#0A3D91] rounded-full" />
                  Event Organization & Scheduling
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1A1A24] font-medium">
                  <div className="w-2 h-2 bg-[#0A3D91] rounded-full" />
                  Match Creation & Management
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1A1A24] font-medium">
                  <div className="w-2 h-2 bg-[#0A3D91] rounded-full" />
                  Championship Tracking
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1A1A24] font-medium">
                  <div className="w-2 h-2 bg-[#0A3D91] rounded-full" />
                  Club & User Management
                </div>
              </div>
              <div className="flex items-center justify-end text-[#0A3D91] font-black group-hover:gap-4 transition-all">
                Enter Admin Portal
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>

        {/* Info Banner */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl border-2 border-[#0A3D91]">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-6 h-6 text-[#F2C94C]" />
            <p className="text-sm text-[#1A1A24] font-medium text-center">
              <strong className="font-black">New to KUNKHMER?</strong> Start with the Website to explore fights, shop gear, and join the community!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
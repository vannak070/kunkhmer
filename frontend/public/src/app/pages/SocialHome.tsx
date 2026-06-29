import { Link } from "react-router";
import { ArrowLeft, Sparkles, ShoppingCart, TrendingUp, Trophy, Crown, Target } from "lucide-react";

export function SocialHome() {
  const features = [
    {
      id: "complete",
      title: "Full Social Platform",
      subtitle: "Bet • Shop • Connect",
      description: "Complete social experience with match betting, equipment store, wallet system, and order tracking",
      icon: Crown,
      color: "from-purple-600 to-indigo-700",
      borderColor: "border-purple-500",
      path: "/social/complete",
      badge: "⭐ RECOMMENDED"
    },
    {
      id: "betting",
      title: "Match Betting",
      subtitle: "Prediction System",
      description: "Place bets on matches, compete with fans, and win rewards with our points-based betting system",
      icon: Target,
      color: "from-green-600 to-emerald-700",
      borderColor: "border-green-500",
      path: "/social/complete",
      badge: "Active"
    },
    {
      id: "store",
      title: "Equipment Store",
      subtitle: "Official Merchandise",
      description: "Shop authentic Kun Khmer gear, gloves, shorts, and exclusive fighter merchandise",
      icon: ShoppingCart,
      color: "from-[#C8102E] to-red-700",
      borderColor: "border-[#C8102E]",
      path: "/social/complete",
      badge: "Active"
    },
    {
      id: "feed",
      title: "Social Feed",
      subtitle: "Community Updates",
      description: "Connect with fighters, view exclusive content, and engage with the Kun Khmer community",
      icon: Sparkles,
      color: "from-blue-600 to-indigo-700",
      borderColor: "border-blue-500",
      path: "/social/complete",
      badge: "Active"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] via-white to-[#F8F9FA]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C8102E] to-[#E91E3A] py-8 border-b-4 border-red-700 sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </Link>
              <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  KUN KHMER Social Platform
                </h1>
                <p className="text-sm text-red-100 font-medium mt-1">
                  Fan Engagement & Monetization
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-[#0A3D91] via-[#C8102E] to-[#F2C94C] py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black text-white mb-4">
            Bet, Shop, Connect
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto font-medium">
            The ultimate Kun Khmer fan experience with match predictions, exclusive merchandise, and community features
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-[#1A1A24] mb-4">
            Platform Features
          </h2>
          <p className="text-lg text-[#707070] font-medium">
            Everything you need to engage with Kun Khmer
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Link
                key={feature.id}
                to={feature.path}
                className={`group bg-white rounded-3xl shadow-xl border-4 ${feature.borderColor} hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
              >
                <div className={`bg-gradient-to-r ${feature.color} p-6 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-white/90 font-bold mt-1">
                          {feature.subtitle}
                        </p>
                      </div>
                    </div>
                    {feature.badge && (
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="text-xs font-bold text-[#1A1A24]">{feature.badge}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-base text-[#707070] font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl border-4 border-[#0A3D91]">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-white rounded-2xl">
              <Trophy className="w-12 h-12 text-[#F2C94C]" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-[#1A1A24] mb-3">
                Complete Kun Khmer Ecosystem
              </h3>
              <p className="text-base text-[#707070] font-medium mb-4 leading-relaxed">
                The Social Platform integrates with the Digital Platform to provide a unified experience. Watch fights, place predictions, buy merchandise, and engage with verified fighters.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-4 border-[#E0E0E0] bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-[#707070] font-medium">
            KUN KHMER Social Platform • Part of the Kun Khmer Digital Ecosystem
          </p>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB] p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50 p-12">
          {/* 404 Text */}
          <div className="mb-8">
            <h1 className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0A3D91] to-[#C8102E] leading-none tracking-tighter">
              404
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-[#0A3D91] via-[#C8102E] to-[#F2C94C] mx-auto rounded-full mt-4" />
          </div>

          {/* Message */}
          <h2 className="text-3xl font-black text-[#1A1A24] uppercase tracking-tight mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-[#707070] font-medium mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been removed from the KUN KHMER Digital Platform.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0A3D91] to-[#051C42] text-white font-bold uppercase tracking-wider rounded-xl hover:shadow-lg transition-all hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Go to Dashboard
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#F4F5F8] text-[#0A3D91] font-bold uppercase tracking-wider rounded-xl hover:bg-[#E0E0E0] transition-all border-2 border-[#E0E0E0]"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-sm text-[#707070]">
          <p>
            Need help? Contact the{" "}
            <Link to="/federation" className="text-[#0A3D91] font-bold hover:text-[#C8102E] transition-colors">
              KKF Federation
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

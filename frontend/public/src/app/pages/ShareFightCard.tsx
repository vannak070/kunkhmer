import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { 
  ArrowLeft, Copy, Download, Share2, Mail, MessageCircle, 
  Facebook, Twitter, CheckCircle, Printer, Link2
} from "lucide-react";
import { getBatchById, formatDisplayDate } from "../data/batches";
import { toast } from "sonner";
import kkfLogo from "figma:asset/a66d0715b1669c88badc1b57f275bd3b2182d59e.png";

export function ShareFightCard() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(true);
  
  const batch = batchId ? getBatchById(batchId) : undefined;
  
  if (!batch) {
    return (
      <div className="min-h-screen bg-[#F4F5F8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-md">
          <h2 className="text-2xl font-black text-[#1A1A24] mb-4">Batch Not Found</h2>
          <p className="text-[#707070] mb-6">The fight card you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/home/matches")}
            className="px-6 py-3 bg-[#0A3D91] text-white rounded-xl font-bold hover:bg-[#082F6E] transition-all"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/batches/${batch.id}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (platform: string) => {
    const text = `${batch.eventName} - ${batch.batchNumber}\n${formatDisplayDate(batch.date)} at ${batch.location}\n${batch.totalMatches} exciting matches!`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(batch.eventName)}&body=${encodeURIComponent(text + '\n\n' + shareUrl)}`;
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + shareUrl)}`, '_blank');
        break;
    }
    toast.success(`Sharing to ${platform}...`);
  };

  const handlePrint = () => {
    setShowActions(false);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowActions(true), 100);
    }, 100);
  };

  const handleDownloadPDF = () => {
    toast.info("PDF download feature coming soon!");
  };

  return (
    <div className="min-h-screen bg-[#F4F5F8] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Action Bar - Hidden when printing */}
        {showActions && (
          <div className="mb-6 print:hidden">
            <button
              onClick={() => navigate("/home/matches")}
              className="inline-flex items-center gap-2 text-[#0A3D91] hover:text-[#082F6E] font-bold mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Matches
            </button>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A3D91] text-white rounded-lg font-bold hover:bg-[#082F6E] transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#C41E3A] text-white rounded-lg font-bold hover:bg-[#9B1730] transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  
                  <button
                    onClick={handleCopyLink}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                      copied 
                        ? "bg-green-600 text-white"
                        : "bg-[#707070] text-white hover:bg-[#5A5A5A]"
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#0C63D4] transition-all"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5" fill="currentColor" />
                  </button>
                  
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#0D8BD9] transition-all"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5" fill="currentColor" />
                  </button>
                  
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="p-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1EBE56] transition-all"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => handleShare('email')}
                    className="p-2 bg-[#707070] text-white rounded-lg hover:bg-[#5A5A5A] transition-all"
                    title="Share via Email"
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Official Fight Card Document */}
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <div className="p-8 md:p-12 bg-white">
            {/* Header with Logos */}
            <div className="flex items-start justify-between mb-8">
              <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                <img 
                  src={kkfLogo} 
                  alt="Kun Khmer Federation" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex-1 text-center px-4">
                <h1 className="text-xl md:text-3xl font-black text-[#1A1A24] mb-2 uppercase">
                  ព្រឹត្តិការណ៍ប្រកួតថ្ងៃ
                </h1>
                <h2 className="text-lg md:text-2xl font-black text-[#C41E3A] mb-1">
                  {batch.eventName}
                </h2>
                <div className="h-1 w-32 bg-[#FFB81C] mx-auto my-3"></div>
              </div>
              
              <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                <div className="w-full h-full rounded-lg border-4 border-[#C41E3A] flex items-center justify-center bg-gradient-to-br from-[#0A3D91] to-[#C41E3A] text-white">
                  <div className="font-black text-xs md:text-sm text-center leading-tight">
                    MAIN<br/>SPONSOR
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-gradient-to-r from-[#F4F5F8] to-white border-l-4 border-[#0A3D91] p-6 mb-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-black text-[#1A1A24]">អង្គភាពរៀបចំ / ORGANIZER:</span>
                  <span className="ml-2 font-bold text-[#0A3D91]">{batch.organizerClub || 'KKF Cambodia'}</span>
                </div>
                <div>
                  <span className="font-black text-[#1A1A24]">កាលបរិច្ឆេទ / DATE:</span>
                  <span className="ml-2 font-bold text-[#C41E3A]">{formatDisplayDate(batch.date)}</span>
                </div>
                <div>
                  <span className="font-black text-[#1A1A24]">ទីកន្លែង / VENUE:</span>
                  <span className="ml-2 font-bold text-[#707070]">{batch.location}</span>
                </div>
                <div>
                  <span className="font-black text-[#1A1A24]">ផ្សាយផ្ទាល់ / BROADCAST:</span>
                  <span className="ml-2 font-bold text-[#707070]">{batch.broadcastStation || 'TV Network'}</span>
                </div>
              </div>
            </div>

            {/* Official Match Table */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-2 border-[#1A1A24] bg-white p-3 text-center font-black text-[#1A1A24] text-sm md:text-base w-16 md:w-20">
                      គូទី
                    </th>
                    <th className="border-2 border-[#1A1A24] bg-[#C41E3A] p-3 text-center font-black text-white text-sm md:text-base">
                      បង្គោលក្រហម<br/>
                      <span className="text-xs font-bold uppercase">(RED CORNER)</span>
                    </th>
                    <th className="border-2 border-[#1A1A24] bg-white p-3 text-center font-black text-[#1A1A24] text-sm md:text-base w-24 md:w-32">
                      ទម្ងន់<br/>
                      <span className="text-xs font-bold">WEIGHT</span>
                    </th>
                    <th className="border-2 border-[#1A1A24] bg-[#0A3D91] p-3 text-center font-black text-white text-sm md:text-base">
                      បង្គោលខៀវ<br/>
                      <span className="text-xs font-bold uppercase">(BLUE CORNER)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {batch.matches.map((match, index) => (
                    <tr key={match.id} className="hover:bg-[#F4F5F8] transition-colors">
                      <td className="border-2 border-[#707070] p-4 text-center align-top">
                        <div className="font-black text-[#1A1A24] text-lg md:text-xl mb-1">
                          {index + 1}
                        </div>
                        <div className="text-xs font-bold text-[#707070]">
                          ({match.matchNumber})
                        </div>
                        <div className="text-xs font-bold text-[#C41E3A] mt-2">
                          {match.rounds}R
                        </div>
                      </td>
                      
                      <td className="border-2 border-[#707070] p-4 bg-gradient-to-r from-white to-[#FFF5F5]">
                        <div className="font-black text-[#1A1A24] text-base md:text-lg mb-2">
                          {match.fighterA.name}
                        </div>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-bold text-[#707070]">កីឡាដ្ឋាន / Club:</span>
                            <span className="ml-2 text-[#0A3D91] font-bold">{match.fighterA.clubName}</span>
                          </div>
                          <div>
                            <span className="font-bold text-[#707070]">កំណត់ត្រា / Record:</span>
                            <span className="ml-2 text-[#1A1A24] font-black">{match.fighterA.record}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="border-2 border-[#707070] p-4 text-center bg-[#FFFEF7]">
                        <div className="font-black text-[#1A1A24] text-sm mb-1">
                          កូនខ្មែរ
                        </div>
                        <div className="font-black text-[#0A3D91] text-sm mb-1 uppercase">
                          KUN KHMER
                        </div>
                        <div className="font-black text-[#C41E3A] text-xl md:text-2xl">
                          {match.fighterA.weight} KG
                        </div>
                        {match.matchType && (
                          <div className="mt-2 text-xs font-black text-[#FFB81C] uppercase leading-tight">
                            {match.matchType}
                          </div>
                        )}
                      </td>
                      
                      <td className="border-2 border-[#707070] p-4 bg-gradient-to-l from-white to-[#F5F8FF]">
                        <div className="font-black text-[#1A1A24] text-base md:text-lg mb-2">
                          {match.fighterB.name}
                        </div>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-bold text-[#707070]">កីឡាដ្ឋាន / Club:</span>
                            <span className="ml-2 text-[#0A3D91] font-bold">{match.fighterB.clubName}</span>
                          </div>
                          <div>
                            <span className="font-bold text-[#707070]">កំណត់ត្រា / Record:</span>
                            <span className="ml-2 text-[#1A1A24] font-black">{match.fighterB.record}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes Section */}
            {batch.notes && (
              <div className="bg-[#FFFEF7] border-2 border-[#FFB81C] rounded-lg p-4 mb-6">
                <div className="font-black text-[#1A1A24] text-sm mb-2 uppercase">
                  ចំណាំ / NOTES:
                </div>
                <div className="text-sm text-[#707070] font-bold">
                  {batch.notes}
                </div>
              </div>
            )}

            {/* Footer with Official Stamp */}
            <div className="border-t-2 border-[#E0E0E0] pt-6 mt-8">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-black text-[#1A1A24]">លេខ​កូដ​​កម្មវិធី / Batch Number:</span>
                      <span className="ml-2 font-bold text-[#0A3D91]">{batch.batchNumber}</span>
                    </div>
                    {batch.submittedDate && (
                      <div>
                        <span className="font-black text-[#1A1A24]">កាលបរិច្ឆេទ​ដាក់​ស្នើ / Submitted:</span>
                        <span className="ml-2 font-bold text-[#707070]">{formatDisplayDate(batch.submittedDate)}</span>
                      </div>
                    )}
                    {batch.submittedBy && (
                      <div>
                        <span className="font-black text-[#1A1A24]">ដាក់​ស្នើ​ដោយ / Submitted By:</span>
                        <span className="ml-2 font-bold text-[#707070]">{batch.submittedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-2 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-[#0A3D91] flex items-center justify-center bg-white/90">
                      <div className="text-center">
                        <div className="text-[#0A3D91] font-black text-xs md:text-sm leading-tight mb-1">
                          CAMBODIA
                        </div>
                        <div className="text-[#C41E3A] font-black text-lg md:text-xl leading-tight mb-1">
                          KKF
                        </div>
                        <div className="text-[#0A3D91] font-black text-xs md:text-sm leading-tight">
                          FEDERATION
                        </div>
                      </div>
                    </div>
                    <div className={`absolute inset-0 rounded-full border-4 ${
                      batch.status === 'Approved' 
                        ? 'border-green-600' 
                        : batch.status === 'Pending KKF'
                        ? 'border-[#FFB81C]'
                        : 'border-[#707070]'
                    } opacity-50`}></div>
                  </div>
                  <div className={`text-xs md:text-sm font-black uppercase ${
                    batch.status === 'Approved' 
                      ? 'text-green-600' 
                      : batch.status === 'Pending KKF'
                      ? 'text-[#FFB81C]'
                      : 'text-[#707070]'
                  }`}>
                    {batch.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="text-center mt-8 pt-6 border-t border-[#E0E0E0]">
              <div className="text-xs text-[#707070] font-bold space-y-1">
                <div>ព្រះរាជាណាចក្រ​កម្ពុជា / KINGDOM OF CAMBODIA</div>
                <div>សហព័ន្ធ​គុន​ខ្មែរ / KUN KHMER FEDERATION</div>
                <div className="text-[#0A3D91]">www.kunkhmer.org.kh</div>
              </div>
            </div>
          </div>
        </div>

        {/* View Full Details Button */}
        {showActions && (
          <div className="mt-6 text-center print:hidden">
            <button
              onClick={() => navigate(`/home/batches/${batch.id}`)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0A3D91] to-[#082F6E] text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <Link2 className="w-5 h-5" />
              View Full Batch Details
            </button>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
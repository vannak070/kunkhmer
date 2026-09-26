import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, Copy, Printer, Image, CheckCircle
} from "lucide-react";
import { getBatchById, formatDisplayDate } from "../data/batches";
import type { BatchStatus } from "../data/batches";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";
import kkfLogo from "../../assets/modern_logo.png";
import { SPONSORS } from "../data/masterData";
import { api } from "../utils/api";

const getSponsorLogoSvg = (sponsorName: string) => {
  const name = sponsorName.toLowerCase();
  if (name.includes("angkor")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full object-contain">
        <rect width="120" height="120" rx="16" fill="#ffffff"/>
        <g fill="#C8102E">
          <path d="M57,25 L63,25 L63,65 L57,65 Z"/>
          <path d="M55,35 L65,35 L65,40 L55,40 Z"/>
          <path d="M53,48 L67,48 L67,65 L53,65 Z"/>
          
          <path d="M41,40 L45,40 L45,65 L41,65 Z"/>
          <path d="M39,48 L47,48 L47,52 L39,52 Z"/>
          <path d="M37,56 L49,56 L49,65 L37,65 Z"/>
          
          <path d="M75,40 L79,40 L79,65 L75,65 Z"/>
          <path d="M73,48 L81,48 L81,52 L73,52 Z"/>
          <path d="M71,56 L83,56 L83,65 L71,65 Z"/>
          
          <rect x="25" y="65" width="70" height="6" rx="1"/>
        </g>
        <text x="60" y="88" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="13" fill="#0A3D91" textAnchor="middle" letterSpacing="0.5">ANGKOR</text>
        <text x="60" y="102" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="9" fill="#C8102E" text-anchor="middle" letterSpacing="1.5">BEER</text>
      </svg>
    );
  }
  if (name.includes("carabao")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full object-contain">
        <rect width="120" height="120" rx="16" fill="#ffffff"/>
        <g fill="#C8102E">
          <path d="M60,48 C50,22 25,25 20,38 C28,32 46,34 50,48 Z"/>
          <path d="M60,48 C70,22 95,25 100,38 C92,32 74,34 70,48 Z"/>
          <path d="M50,48 L70,48 L66,75 L60,82 L54,75 Z"/>
          <path d="M55,54 L58,56 L55,58 Z" fill="#ffffff"/>
          <path d="M65,54 L62,56 L65,58 Z" fill="#ffffff"/>
          <circle cx="60" cy="74" r="2" fill="#ffffff"/>
        </g>
        <text x="60" y="98" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="12" fill="#005A36" text-anchor="middle" letterSpacing="0.5">CARABAO</text>
      </svg>
    );
  }
  if (name.includes("ganzberg")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full object-contain">
        <rect width="120" height="120" rx="16" fill="#ffffff"/>
        <path d="M60,15 C75,15 88,20 92,35 C92,65 78,88 60,98 C42,88 28,65 28,35 C32,20 45,15 60,15 Z" fill="#D4AF37"/>
        <path d="M60,20 C72,20 83,24 87,37 C87,62 75,83 60,92 C45,83 33,62 33,37 C37,24 48,20 60,20 Z" fill="#C8102E"/>
        <path d="M60,30 L63,38 L72,38 L65,43 L68,51 L60,46 L52,51 L55,43 L48,38 L57,38 Z" fill="#D4AF37"/>
        <text x="60" y="66" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="9" fill="#FFFFFF" text-anchor="middle" letterSpacing="0.5">GANZBERG</text>
        <text x="60" y="80" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="7" fill="#D4AF37" text-anchor="middle" letterSpacing="1">GERMAN BEER</text>
      </svg>
    );
  }
  if (name.includes("krud")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full object-contain">
        <rect width="120" height="120" rx="16" fill="#ffffff"/>
        <circle cx="60" cy="48" r="24" fill="#C8102E"/>
        <path d="M50,48 L58,32 L58,45 L70,48 L62,64 L62,51 Z" fill="#F2C94C"/>
        <text x="60" y="94" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="16" fill="#1A2E40" text-anchor="middle" letterSpacing="1">KRUD</text>
        <text x="60" y="105" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="8" fill="#C8102E" text-anchor="middle" letterSpacing="0.5">ENERGY</text>
      </svg>
    );
  }
  if (name.includes("smart")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full object-contain">
        <rect width="120" height="120" rx="16" fill="#ffffff"/>
        <g transform="translate(60, 45)">
          <circle cx="-12" cy="0" r="14" fill="#00A859" opacity="0.8"/>
          <circle cx="12" cy="0" r="14" fill="#F26522" opacity="0.8"/>
          <circle cx="0" cy="-12" r="14" fill="#00AEEF" opacity="0.8"/>
          <circle cx="0" cy="12" r="14" fill="#ED008C" opacity="0.8"/>
        </g>
        <text x="60" y="98" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="18" fill="#00A859" text-anchor="middle">smart</text>
      </svg>
    );
  }
  if (name.includes("wing")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full object-contain">
        <rect width="120" height="120" rx="16" fill="#ffffff"/>
        <circle cx="60" cy="45" r="24" fill="#00A3E0"/>
        <path d="M48,45 C52,35 68,32 72,42 C68,48 55,50 48,45 Z" fill="#FFFFFF"/>
        <path d="M52,48 C55,42 66,40 68,47 C65,51 58,52 52,48 Z" fill="#78BE20"/>
        <text x="60" y="98" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="16" fill="#00A3E0" text-anchor="middle">Wing <tspan fill="#78BE20">Bank</tspan></text>
      </svg>
    );
  }
  if (name.includes("aba")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full object-contain">
        <rect width="120" height="120" rx="16" fill="#ffffff"/>
        <rect x="20" y="25" width="80" height="42" rx="6" fill="#005C8A"/>
        <text x="60" y="55" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF" text-anchor="middle" letterSpacing="0.5">ABA</text>
        <text x="60" y="94" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="11" fill="#005C8A" text-anchor="middle" letterSpacing="2">BANK</text>
      </svg>
    );
  }
  if (name.includes("coca-cola") || name.includes("coca cola")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full object-contain">
        <rect width="120" height="120" rx="16" fill="#ffffff"/>
        <path d="M15,45 C35,32 85,32 105,45 C85,58 35,58 15,45 Z" fill="#C8102E"/>
        <text x="60" y="50" fontFamily="Georgia, serif" fontWeight="900" fontStyle="italic" fontSize="14" fill="#FFFFFF" text-anchor="middle">Coke</text>
        <text x="60" y="98" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="11" fill="#C8102E" text-anchor="middle" letterSpacing="0.5">COCA-COLA</text>
      </svg>
    );
  }
  return null;
};

export function ShareFightCard() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [copiedImage, setCopiedImage] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [sponsorLogoBase64, setSponsorLogoBase64] = useState<string>("");
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Batch Data dynamically from the API with mock fallback
  useEffect(() => {
    const fetchBatchData = async () => {
      if (!batchId) {
        setLoading(false);
        return;
      }
      
      try {
        const b = await api.batches.get(batchId);
        if (b) {
          // Load matches for this sub-event
          const allMatches = await api.matches.list();
          const batchMatches = allMatches
            .filter((m: any) => m.sub_event_id === b.id)
            .map((m: any) => {
              return {
                id: m.id,
                status: m.status,
                rounds: m.rounds,
                weightClass: m.agreed_weight ? `${m.agreed_weight} kg` : "Catchweight",
                agreedWeight: m.agreed_weight,
                isChampionshipBout: m.is_title_match || m.isTitleMatch || false,
                refereeId: m.referee_id || "",
                judgeIds: Array.isArray(m.judge_ids) ? m.judge_ids : [],
                officials: (m.referee_id || (Array.isArray(m.judge_ids) && m.judge_ids.length > 0)) ? true : false,
                refereeName: m.referee_name,
                fighterAConfirmed: m.fighter_a_confirmed || false,
                fighterBConfirmed: m.fighter_b_confirmed || false,
                winnerId: m.winner_id || null,
                winnerMethod: m.winner_method || null,
                winnerRound: m.winner_round || null,
                gloveSize: m.glove_size || m.gloveSize || "",
                gloveBrand: m.glove_brand || m.gloveBrand || "",
                championshipTitleName: m.championshipTitleName || m.championship_title_name || null,
                fighterA: {
                  id: m.fighter_a_id,
                  name: m.fighter_a_name || "TBD (Fighter A)",
                  image: m.fighter_a_image,
                  gym: m.club_a_name || "Independent",
                  clubName: m.club_a_name || "Independent",
                  record: m.fighter_a_record || "0-0-0",
                  weight: parseFloat(m.fighterA?.current_weight || m.fighterA?.currentWeight || m.fighter_a?.current_weight || m.fighter_a?.currentWeight || 0)
                },
                fighterB: {
                  id: m.fighter_b_id,
                  name: m.fighter_b_name || "TBD (Fighter B)",
                  image: m.fighter_b_image,
                  gym: m.club_b_name || "Independent",
                  clubName: m.club_b_name || "Independent",
                  record: m.fighter_b_record || "0-0-0",
                  weight: parseFloat(m.fighterB?.current_weight || m.fighterB?.currentWeight || m.fighter_b?.current_weight || m.fighter_b?.currentWeight || 0)
                }
              };
            });

          const mappedBatch = {
            id: b.id,
            batchNumber: b.batch_number || `BATCH-${b.week_number}`,
            eventName: b.event_name || "Weekly Fight Card",
            location: b.location || "Olympic Stadium Arena",
            date: b.date ? String(b.date).split("T")[0] : "",
            createdDate: b.created_at ? String(b.created_at).split("T")[0] : "",
            status: b.status as BatchStatus,
            totalMatches: batchMatches.length,
            matches: batchMatches,
            organizerClub: b.creator_name,
            createdBy: b.creator_name,
            eventId: b.event_id,
            broadcastStation: b.broadcast_station_name,
            mainSponsor: b.main_sponsor_name,
            notes: b.notes || ""
          };
          setBatch(mappedBatch);
        } else {
          // fallback to mock data
          const mock = getBatchById(batchId);
          if (mock) setBatch(mock);
        }
      } catch (err) {
        console.warn("API batch fetch failed, falling back to mock data:", err);
        const mock = getBatchById(batchId);
        if (mock) setBatch(mock);
      } finally {
        setLoading(false);
      }
    };

    fetchBatchData();
  }, [batchId]);

  // Determine if sharing is allowed based on batch lifecycle status
  // Draft Ready (Draft + has matches), Weight-In, Ready, Live → share fighter card
  // Complete → share only if ALL matches have results (winner set or draw/no contest method/id set)
  const allMatchesHaveResults = batch
    ? batch.matches.length > 0 && batch.matches.every((m: any) => m.winnerId || m.winner || m.winnerMethod)
    : false;

  const isShareable = batch ? (
    (batch.status === "Draft" && batch.matches.length > 0) || // Draft Ready step
    ["Weight-In", "Ready", "Live"].includes(batch.status) ||  // Active event stages
    (["Complete", "Completed"].includes(batch.status) && allMatchesHaveResults) // Completed with results
  ) : false;

  useEffect(() => {
    // Load KKF logo
    fetch(kkfLogo)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch((err) => {
        console.error("Failed to load logo as base64:", err);
      });

    // Load Sponsor logo
    if (batch?.mainSponsor) {
      const sponsor = SPONSORS.find(
        (s) => s.name.toLowerCase() === batch.mainSponsor?.toLowerCase()
      );
      const logoUrl = sponsor?.image || sponsor?.logo;
      if (logoUrl && logoUrl.startsWith("http")) {
        fetch(logoUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              setSponsorLogoBase64(reader.result as string);
            };
            reader.readAsDataURL(blob);
          })
          .catch((err) => {
            console.error("Failed to load sponsor logo as base64:", err);
          });
      }
    }
  }, [batch]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#0A3D91] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold text-sm">Loading official fight card details...</p>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-md border border-slate-200/80">
          <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Fight Card Not Found</h2>
          <p className="text-slate-500 mb-6 font-normal text-sm">The fight card you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/home/matches")}
            className="btn-primary w-full py-3 font-semibold uppercase tracking-wider text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  if (!isShareable) {
    const isCompleted = ["Complete", "Completed"].includes(batch.status);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-md border border-slate-200/80">
          <h2 className="text-2xl font-black text-amber-600 mb-4 uppercase tracking-tight">Sharing Restricted</h2>
          <p className="text-slate-500 mb-6 font-normal text-sm">
            {isCompleted
              ? "This fight card is completed but results have not been recorded for all matches. Please update match results before sharing."
              : "Sharing is only available during Draft Ready, Weight-In, Ready & Live, or Completed (with results) stages."}
          </p>
          <button
            onClick={() => navigate(`/home/batches/${batch.id}`)}
            className="btn-primary w-full py-3 font-semibold uppercase tracking-wider text-xs rounded-xl shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Batch Details
          </button>
        </div>
      </div>
    );
  }

  const handleCopyImage = async () => {
    const cardElement = document.getElementById("fight-card-document");
    if (!cardElement) {
      toast.error("Fight card element not found");
      return;
    }
    
    const toastId = toast.loading("Generating high-resolution fight card image...");
    
    // Create a promise that resolves to the blob to preserve user gesture context
    const blobPromise = (async () => {
      try {
        const canvas = await html2canvas(cardElement, {
          useCORS: true,
          allowTaint: false,
          logging: true,
          scale: 2, // 2x density for crystal clear prints/shares
          backgroundColor: "#ffffff",
          foreignObjectRendering: false,
        });
        
        return new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to generate image blob"));
            }
          }, "image/png");
        });
      } catch (err) {
        throw err;
      }
    })();

    try {
      // In modern browsers (Chrome, Safari, Edge), we write the Promise directly 
      // inside ClipboardItem synchronously to preserve user gesture authorization.
      const clipboardItem = new ClipboardItem({
        "image/png": blobPromise
      });
      
      await navigator.clipboard.write([clipboardItem]);
      toast.dismiss(toastId);
      setCopiedImage(true);
      toast.success("✅ Fight card copied as image to clipboard!");
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support writing Promises (like Firefox)
      try {
        const blob = await blobPromise;
        toast.dismiss(toastId);
        
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);
          setCopiedImage(true);
          toast.success("✅ Fight card copied as image to clipboard!");
          setTimeout(() => setCopiedImage(false), 2000);
        } catch (clipErr) {
          // If clipboard API still blocks, fallback to downloading
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${batch.batchNumber}_FightCard.png`;
          link.click();
          toast.success("📥 Saved fight card image to your downloads folder!");
        }
      } catch (error) {
        toast.dismiss(toastId);
        toast.error("Failed to generate and copy image");
        console.error(error);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#F1F5F9] via-[#F8FAFC] to-[#FFFFFF] text-slate-800 p-4 md:p-8 workspace-wrapper transition-colors duration-300 print:bg-white print:p-0 print:text-black">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Navigation Bar - Hidden when printing */}
        <div className="w-full mb-6 print:hidden flex justify-start">
          <button
            onClick={() => navigate("/home/matches")}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Matches
          </button>
        </div>
        
        {/* Action Bar - Hidden when printing */}
        <div className="mb-8 print:hidden max-w-4xl w-full">
          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1 uppercase tracking-wider font-sans">
                  Export Fight Card
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Copy this official fight card as a high-resolution image or print to A4 size directly.
                </p>
              </div>
              <div className="flex items-center gap-3.5 w-full md:w-auto">
                <button
                  onClick={handleCopyImage}
                  className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-sm active:scale-[0.98] ${
                    copiedImage 
                      ? "bg-emerald-600 text-white"
                      : "bg-[#0A3D91] hover:bg-[#082E6E] text-white shadow-sm hover:-translate-y-[2px]"
                  }`}
                >
                  {copiedImage ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4" />
                      Copy as Image
                    </>
                  )}
                </button>
                
                <button
                  onClick={handlePrint}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C8102E] hover:bg-[#A00D24] text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-sm hover:-translate-y-[2px] active:scale-[0.98] transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Print (A4)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Official Fight Card Document */}
        <div 
          id="fight-card-document" 
          className="bg-white shadow-[0_15px_45px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden border border-slate-200/80 max-w-4xl w-full print:border-none print:shadow-none print:rounded-none transition-all relative"
        >
          {/* Outer Gold Frame Border */}
          <div className="absolute inset-4 rounded-[20px] border border-amber-500/15 pointer-events-none print:hidden"></div>
          
          <div className="p-8 md:p-12 bg-white text-slate-900 print:text-black relative z-10">
            {/* Header with Logos */}
            <div className="flex items-center justify-between gap-6 mb-4 pb-2">
              <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                <img 
                  src={logoBase64 || kkfLogo} 
                  alt="Kun Khmer Federation" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex-1 text-center">
                <h1 className="text-lg md:text-2xl text-amber-600 mb-2.5 tracking-wide" style={{ fontFamily: "'Moul', serif" }}>
                  ព្រឹត្តិការណ៍ប្រកួតគុនខ្មែរ
                </h1>
                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mb-2">
                  {batch.eventName}
                </h2>
                <div className="inline-block px-3 py-1 bg-amber-50/50 border border-amber-200/40 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-full">
                  Official Fight Card Document
                </div>
              </div>
              
              <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
                {batch.mainSponsor ? (
                  getSponsorLogoSvg(batch.mainSponsor) ? (
                    <div className="w-full h-20 rounded-2xl bg-white border-2 border-amber-500/30 flex items-center justify-center p-1.5 shadow-sm overflow-hidden">
                      {getSponsorLogoSvg(batch.mainSponsor)}
                    </div>
                  ) : sponsorLogoBase64 ? (
                    <div className="w-full h-20 rounded-2xl bg-white border-2 border-amber-500/30 flex items-center justify-center p-2 shadow-sm overflow-hidden">
                      <img 
                        src={sponsorLogoBase64} 
                        alt={batch.mainSponsor} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-20 rounded-2xl bg-white border-2 border-amber-500/30 flex flex-col items-center justify-center p-2 text-center text-slate-800 shadow-sm">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">SPONSOR</div>
                      <div className="text-[11px] font-black text-[#0A3D91] truncate max-w-full px-1 uppercase tracking-tight">{batch.mainSponsor}</div>
                    </div>
                  )
                ) : (
                  <div className="w-full h-20 rounded-2xl bg-white border-2 border-amber-500/30 flex flex-col items-center justify-center p-2 text-center text-slate-800 shadow-sm">
                    <div className="text-[14px] font-black text-[#0A3D91] tracking-tighter leading-none">KKF</div>
                    <div className="w-8 h-[2px] bg-[#C8102E] my-1"></div>
                    <div className="font-bold text-[7px] leading-tight uppercase tracking-widest text-slate-500">
                      OFFICIAL
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Elegant Tricolor Ribbon/Divider representing Kun Khmer colors */}
            <div className="w-full h-[4px] bg-gradient-to-r from-[#0A3D91] via-[#F2C94C] to-[#C8102E] mb-6 rounded-full" />

            {/* Event Details Grid */}
            <div className="bg-slate-50/40 border border-slate-200/40 rounded-2xl p-5 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center">
                  <span className="text-slate-400 uppercase tracking-wider w-36 text-[10px]">Organizer:</span>
                  <span className="text-[#0A3D91] font-extrabold text-sm">{batch.organizerClub || 'Kun Khmer Federation'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-400 uppercase tracking-wider w-36 text-[10px]">Date:</span>
                  <span className="text-[#C8102E] font-extrabold text-sm">{formatDisplayDate(batch.date)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-400 uppercase tracking-wider w-36 text-[10px]">Venue:</span>
                  <span className="text-slate-800 font-extrabold text-sm">{batch.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-400 uppercase tracking-wider w-36 text-[10px]">Broadcast:</span>
                  <span className="text-slate-800 font-extrabold text-sm">{batch.broadcastStation || 'National TV'}</span>
                </div>
              </div>
            </div>

            {/* Official Match Table */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="bg-slate-50 text-slate-700 p-3.5 text-center font-extrabold uppercase tracking-widest text-[10px] w-20 border-r border-slate-200">
                      Bout
                    </th>
                    <th className="bg-[#C8102E] text-white p-3.5 text-center font-extrabold uppercase tracking-widest text-[10px] border-r border-slate-200/60 shadow-inner">
                      Red Corner
                    </th>
                    <th className="bg-slate-50 text-slate-700 p-3.5 text-center font-extrabold uppercase tracking-widest text-[10px] w-36 border-r border-slate-200">
                      Weight Class
                    </th>
                    <th className="bg-[#0A3D91] text-white p-3.5 text-center font-extrabold uppercase tracking-widest text-[10px] shadow-inner">
                      Blue Corner
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {batch.matches.map((match, index) => {
                    const isChampionship = match.isChampionshipBout || match.matchType === "Championship Bout" || index === 0;
                    return (
                      <tr key={match.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/15 transition-colors">
                        {/* Bout Number */}
                        <td className="p-4 text-center align-middle font-extrabold text-slate-800 bg-slate-50/30 border-r border-slate-200">
                          <div className="text-2xl font-black mb-0.5 text-slate-800">#{index + 1}</div>
                          <div className="text-[8px] text-slate-400 font-black uppercase tracking-wider">({match.rounds} Rds)</div>
                        </td>
                        
                        {/* Red Corner */}
                        <td className="p-4 bg-gradient-to-r from-red-50/15 via-transparent to-transparent text-center border-r border-slate-200">
                          <div className="font-black text-[#C8102E] text-base mb-1 uppercase tracking-wide flex items-center justify-center gap-1.5 flex-wrap">
                            <span>{match.fighterA.name}</span>
                            {(match.status === "Completed" || match.status === "Complete") && (match.winnerId === match.fighterA.id || match.winner === match.fighterA.name) && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[8px] uppercase tracking-wider shadow-sm select-none">
                                🏆 WINNER
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 space-y-1">
                            <div className="flex justify-center gap-1.5">
                              <span className="text-slate-400 uppercase tracking-wider text-[9px]">Club:</span> 
                              <span className="text-slate-700 font-bold">{match.fighterA.clubName}</span>
                            </div>
                            <div className="flex justify-center gap-1.5 mt-1.5">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-[#C8102E] font-extrabold text-[9px] shadow-sm">
                                {match.fighterA.record}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Weight Class */}
                        <td className="p-4 text-center bg-[#FFFDF9] align-middle border-r border-slate-200">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Limit</div>
                          <div className="font-black text-slate-900 text-lg leading-tight">{match.fighterA.weight || match.agreedWeight} KG</div>
                          <span className={`inline-block mt-2 px-2.5 py-0.5 text-[8px] font-black border rounded-full uppercase tracking-wider shadow-sm ${
                            isChampionship 
                              ? 'text-amber-700 bg-amber-50 border-amber-300' 
                              : 'text-slate-500 bg-slate-50 border-slate-200'
                          }`}>
                            {isChampionship ? '🏆 Championship' : 'Ranking Fight'}
                          </span>
                          {match.status === "Completed" && match.winnerMethod && (
                            <div className="mt-2.5">
                              <span className="inline-block px-2.5 py-0.5 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-full uppercase tracking-wider shadow-sm">
                                {match.winnerMethod} {match.winnerRound ? `• Rd ${match.winnerRound}` : ""}
                              </span>
                            </div>
                          )}
                        </td>
                        
                        {/* Blue Corner */}
                        <td className="p-4 bg-gradient-to-l from-blue-50/15 via-transparent to-transparent text-center">
                          <div className="font-black text-[#0A3D91] text-base mb-1 uppercase tracking-wide flex items-center justify-center gap-1.5 flex-wrap">
                            <span>{match.fighterB.name}</span>
                            {(match.status === "Completed" || match.status === "Complete") && (match.winnerId === match.fighterB.id || match.winner === match.fighterB.name) && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[8px] uppercase tracking-wider shadow-sm select-none">
                                🏆 WINNER
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 space-y-1">
                            <div className="flex justify-center gap-1.5">
                              <span className="text-slate-400 uppercase tracking-wider text-[9px]">Club:</span> 
                              <span className="text-slate-700 font-bold">{match.fighterB.clubName}</span>
                            </div>
                            <div className="flex justify-center gap-1.5 mt-1.5">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[#0A3D91] font-extrabold text-[9px] shadow-sm">
                                {match.fighterB.record}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Notes Section */}
            {batch.notes && (
              <div className="bg-amber-50/25 border border-amber-200/50 rounded-2xl p-5 mb-8 text-slate-800">
                <div className="text-[9px] font-extrabold text-amber-850 uppercase tracking-widest mb-1.5">Important Notes</div>
                <p className="text-xs font-semibold leading-relaxed">{batch.notes}</p>
              </div>
            )}

            {/* Footer — Official Document Footer */}
            <div className="mt-8 pt-0">
              {/* Top Tricolor Ribbon */}
              <div className="w-full h-[3px] bg-gradient-to-r from-[#0A3D91] via-[#F2C94C] to-[#C8102E] mb-6 rounded-full" />

              {/* 3-Column Footer Layout */}
              <div className="grid grid-cols-3 gap-6 items-start">

                {/* Left Column — Unique Reference Info Only */}
                <div className="space-y-3">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Reference</div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Card Code</div>
                    <div className="text-sm font-black text-[#0A3D91] tracking-tight">{batch.batchNumber}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Bouts</div>
                    <div className="text-sm font-black text-slate-800">{batch.matches.length} Fights</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Printed On</div>
                    <div className="text-xs font-semibold text-slate-700">
                      {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>

                {/* Center Column — Official Seal */}
                <div className="flex flex-col items-center gap-3">
                  {/* Circular Seal */}
                  <div className="w-28 h-28 rounded-full border-[3px] border-double border-[#C8102E] flex items-center justify-center bg-white shadow-md relative overflow-hidden select-none flex-shrink-0">
                    <div className="absolute inset-[5px] rounded-full border border-dashed border-[#C8102E]/30" />
                    <div className="text-center z-10 px-2">
                      <div className="text-[#C8102E] font-black text-[7px] tracking-[0.12em] uppercase mb-0.5">KUN KHMER</div>
                      <div className="text-[#C8102E] font-black text-[6px] tracking-widest uppercase mb-1">FEDERATION</div>
                      <div className="w-10 h-[1.5px] bg-[#C8102E]/40 mx-auto mb-1" />
                      <div className="text-[#0A3D91] font-black text-[11px] tracking-tight uppercase">OFFICIAL</div>
                      <div className="w-10 h-[1.5px] bg-[#C8102E]/40 mx-auto mt-1 mb-0.5" />
                      <div className="text-[#C8102E] font-black text-[6px] tracking-[0.12em] uppercase">FIGHT CARD</div>
                    </div>
                  </div>
                  {/* Federation Branding */}
                  <div className="text-center">
                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-wider">សហព័ន្ធ​គុន​ខ្មែរ</div>
                    <div className="text-[8px] font-semibold text-primary tracking-wide">www.kunkhmer.org.kh</div>
                  </div>
                </div>

                {/* Right Column — Status & Signature */}
                <div className="flex flex-col items-end gap-2.5">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 self-end">Authorization</div>

                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    ["Complete", "Completed"].includes(batch.status)
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : ["Live", "Ready"].includes(batch.status)
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : ["Weight-In"].includes(batch.status)
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : "bg-blue-50 text-[#0A3D91] border-blue-200"
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                    {batch.status}
                  </div>

                  {/* Signature Lines */}
                  <div className="mt-4 text-right space-y-4 w-full">
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">President Signature</div>
                      <div className="text-[9px] font-semibold text-slate-600">KKF President</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Technical Director</div>
                      <div className="text-[9px] font-semibold text-slate-600">Fight Commission</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Strip */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest">
                  This document is issued by the Kun Khmer Federation and is subject to official regulations.
                </div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap ml-4">
                  {new Date().getFullYear()} © KKF
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .workspace-wrapper {
            background: white !important;
            padding: 0 !important;
          }
          [class*="print:hidden"] {
            display: none !important;
          }
          @page {
            margin: 0.8cm;
            size: A4 portrait;
          }
          #fight-card-document {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
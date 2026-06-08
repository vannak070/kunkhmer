import { useRef, useState, useEffect } from "react";
import { X, Share2, Download, Copy } from "lucide-react";
import html2canvas from "html2canvas-pro";
import { toast } from "sonner";
import type { MatchBatch } from "../data/batches";
import { formatDisplayDate } from "../data/batches";
import kkfLogo from "../../assets/modern_logo.png";
import { SPONSORS } from "../data/masterData";

const getSponsorLogoSvg = (sponsorName: string) => {
  const name = sponsorName.toLowerCase();
  if (name.includes("angkor")) {
    return (
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
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
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
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
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
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
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
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
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
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
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
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
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
        <rect width="120" height="120" rx="16" fill="#ffffff"/>
        <rect x="20" y="25" width="80" height="42" rx="6" fill="#005C8A"/>
        <text x="60" y="55" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF" text-anchor="middle" letterSpacing="0.5">ABA</text>
        <text x="60" y="94" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="11" fill="#005C8A" text-anchor="middle" letterSpacing="2">BANK</text>
      </svg>
    );
  }
  if (name.includes("coca-cola") || name.includes("coca cola")) {
    return (
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
        <rect width="120" height="120" rx="16" fill="#ffffff"/>
        <path d="M15,45 C35,32 85,32 105,45 C85,58 35,58 15,45 Z" fill="#C8102E"/>
        <text x="60" y="50" fontFamily="Georgia, serif" fontWeight="900" fontStyle="italic" fontSize="14" fill="#FFFFFF" text-anchor="middle">Coke</text>
        <text x="60" y="98" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="11" fill="#C8102E" text-anchor="middle" letterSpacing="0.5">COCA-COLA</text>
      </svg>
    );
  }
  return null;
};

interface ShareFightCardProps {
  batch: MatchBatch;
  onClose: () => void;
}

export function ShareFightCard({ batch, onClose }: ShareFightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [sponsorLogoBase64, setSponsorLogoBase64] = useState<string>("");

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

  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#FFFFFF",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/png");
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate fight card image");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const blob = await generateImage();
    if (!blob) return;

    const file = new File([blob], `${batch.batchNumber}_Fight_Card.png`, {
      type: "image/png",
    });

    // Try native Web Share API
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `${batch.batchNumber}: ${batch.name}`,
          text: `${batch.eventName} • ${batch.date}`,
          files: [file],
        });
        toast.success("🔗 Fight card shared successfully!");
      } catch (error: any) {
        if (error.name !== "AbortError") {
          // Fallback to download
          handleDownload();
        }
      }
    } else {
      // Fallback to download on desktop
      toast.info("💾 Downloading fight card...");
      handleDownload();
    }
  };

  const handleDownload = async () => {
    const blob = await generateImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${batch.batchNumber}_Fight_Card.png`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("📥 Fight card downloaded!");
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("🔗 Link copied to clipboard!");
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E0E0E0]">
          <h2 className="text-2xl font-black text-[#1A1A24] uppercase">
            Share Fight Card
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-[#707070]" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-6 bg-[#F4F5F8]">
          <div ref={cardRef} className="max-w-3xl mx-auto">
            {/* Fight Card Design - KKF Official Format */}
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '60px 50px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              minHeight: '1000px',
              position: 'relative',
            }}>
              {/* Header Section */}
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                {/* Logos Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '30px',
                }}>
                  {/* KKF Logo */}
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <img src={logoBase64 || kkfLogo} alt="KKF Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>

                  {/* Title */}
                  <div style={{ flex: 1, padding: '0 30px' }}>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: 900,
                      color: '#0A3D91',
                      letterSpacing: '2px',
                      marginBottom: '8px',
                    }}>
                      KUN KHMER FEDERATION
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#C8102E',
                      letterSpacing: '1px',
                    }}>
                      Kingdom of Cambodia
                    </div>
                  </div>

                  {/* Sponsor Logo (Right) */}
                  <div style={{
                    width: '120px',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {batch.mainSponsor ? (
                      getSponsorLogoSvg(batch.mainSponsor) ? (
                        <div style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '16px',
                          backgroundColor: '#ffffff',
                          border: '2px solid #F2C94C',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}>
                          {getSponsorLogoSvg(batch.mainSponsor)}
                        </div>
                      ) : sponsorLogoBase64 ? (
                        <div style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '16px',
                          backgroundColor: '#ffffff',
                          border: '2px solid #F2C94C',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '8px',
                          overflow: 'hidden',
                        }}>
                          <img src={sponsorLogoBase64} alt={batch.mainSponsor} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      ) : (
                        <div style={{
                          width: '100px',
                          height: '80px',
                          borderRadius: '16px',
                          backgroundColor: '#ffffff',
                          border: '2px solid #F2C94C',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '8px',
                        }}>
                          <div style={{ fontSize: '9px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>SPONSOR</div>
                          <div style={{ fontSize: '11px', fontWeight: 900, color: '#0A3D91', textAlign: 'center', textTransform: 'uppercase' }}>{batch.mainSponsor}</div>
                        </div>
                      )
                    ) : (
                      <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                      }}>
                        <img src={logoBase64 || kkfLogo} alt="KKF Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tricolor Ribbon Divider */}
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(90deg, #0A3D91 0%, #F2C94C 50%, #C8102E 100%)',
                  marginBottom: '30px',
                  borderRadius: '999px',
                }} />

                {/* Event Info */}
                <div style={{
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #ffffff 100%)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '24px',
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#C8102E',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                  }}>
                    {batch.eventName}
                  </div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0A3D91',
                  }}>
                    {batch.name} • {formatDisplayDate(batch.date)} • {batch.location}
                  </div>
                </div>

                {/* Batch Number */}
                <div style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#475569',
                  letterSpacing: '0.5px',
                  marginBottom: '24px',
                }}>
                  Batch: <span style={{ color: '#0A3D91' }}>{batch.batchNumber}</span> • {batch.matches.length} Matches
                </div>
              </div>

              {/* Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
              }}>
                {/* Table Header */}
                <thead>
                  <tr>
                    <th style={{
                      borderBottom: '2px solid #E2E8F0',
                      borderRight: '1px solid #E2E8F0',
                      padding: '16px 12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#475569',
                      backgroundColor: '#F8FAFC',
                      textAlign: 'center',
                      width: '80px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>
                      Bout
                    </th>
                    <th style={{
                      borderBottom: '2px solid #E2E8F0',
                      borderRight: '1px solid #E2E8F0',
                      padding: '16px 12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      backgroundColor: '#C8102E',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>
                      Red Corner
                    </th>
                    <th style={{
                      borderBottom: '2px solid #E2E8F0',
                      borderRight: '1px solid #E2E8F0',
                      padding: '16px 12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#475569',
                      backgroundColor: '#F8FAFC',
                      textAlign: 'center',
                      width: '140px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>
                      Weight Class
                    </th>
                    <th style={{
                      borderBottom: '2px solid #E2E8F0',
                      padding: '16px 12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      backgroundColor: '#0A3D91',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>
                      Blue Corner
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {batch.matches.map((match, index) => {
                    const isChampionship = match.isChampionshipBout || match.matchType === "Championship Bout" || index === 0;
                    return (
                      <tr key={match.id} style={{
                        borderBottom: '1px solid #F1F5F9',
                      }}>
                        {/* Match Number */}
                        <td style={{
                          borderRight: '1px solid #E2E8F0',
                          padding: '16px 12px',
                          textAlign: 'center',
                          fontSize: '18px',
                          fontWeight: 900,
                          color: '#1E293B',
                          backgroundColor: '#F8FAFC',
                        }}>
                          <div style={{ fontSize: '20px', fontWeight: 900 }}>#{index + 1}</div>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', marginTop: '2px' }}>({match.rounds} Rds)</div>
                        </td>

                        {/* Fighter A */}
                        <td style={{
                          borderRight: '1px solid #E2E8F0',
                          padding: '16px',
                          backgroundColor: 'rgba(255, 232, 236, 0.15)',
                          textAlign: 'center',
                        }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 900,
                            color: '#C8102E',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            flexWrap: 'wrap',
                          }}>
                            <span>{match.fighterA.name}</span>
                            {match.status === "Completed" && match.winner === match.fighterA.name && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#10B981',
                                color: '#ffffff',
                                fontSize: '8px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}>
                                🏆 WINNER
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#64748B',
                            marginBottom: '6px',
                          }}>
                            Club: {match.fighterA.clubName || match.fighterA.gym}
                          </div>
                          <div style={{
                            display: 'inline-block',
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#C8102E',
                            backgroundColor: '#FFE8EC',
                            padding: '2px 8px',
                            borderRadius: '100px',
                            border: '1px solid #FFD3DB',
                          }}>
                            {match.fighterA.record}
                          </div>
                        </td>

                        {/* Weight */}
                        <td style={{
                          borderRight: '1px solid #E2E8F0',
                          padding: '16px 12px',
                          textAlign: 'center',
                          backgroundColor: '#FFFDF9',
                        }}>
                          <div style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#94A3B8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '2px',
                          }}>
                            Limit
                          </div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 900,
                            color: '#1E293B',
                          }}>
                            {match.fighterA.weight || match.agreedWeight} KG
                          </div>
                          <div style={{
                            display: 'inline-block',
                            marginTop: '8px',
                            fontSize: '9px',
                            fontWeight: 800,
                            color: isChampionship ? '#B45309' : '#64748B',
                            backgroundColor: isChampionship ? '#FEF3C7' : '#F1F5F9',
                            border: isChampionship ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                            padding: '2px 8px',
                            borderRadius: '100px',
                            textTransform: 'uppercase',
                          }}>
                            {isChampionship ? '🏆 Championship' : 'Ranking Fight'}
                          </div>
                          {match.status === "Completed" && match.winnerMethod && (
                            <div style={{ marginTop: '8px' }}>
                              <span style={{
                                display: 'inline-block',
                                fontSize: '9px',
                                fontWeight: 900,
                                color: '#047857',
                                backgroundColor: '#ECFDF5',
                                border: '1px solid #A7F3D0',
                                padding: '2px 8px',
                                borderRadius: '100px',
                                textTransform: 'uppercase',
                              }}>
                                {match.winnerMethod} {match.winnerRound ? `• Rd ${match.winnerRound}` : ""}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Fighter B */}
                        <td style={{
                          padding: '16px',
                          backgroundColor: 'rgba(230, 240, 255, 0.15)',
                          textAlign: 'center',
                        }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 900,
                            color: '#0A3D91',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                          }}>
                            {match.fighterB.name}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#64748B',
                            marginBottom: '6px',
                          }}>
                            Club: {match.fighterB.clubName || match.fighterB.gym}
                          </div>
                          <div style={{
                            display: 'inline-block',
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#0A3D91',
                            backgroundColor: '#E6F0FF',
                            padding: '2px 8px',
                            borderRadius: '100px',
                            border: '1px solid #CCE0FF',
                          }}>
                            {match.fighterB.record}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Footer */}
              <div style={{
                marginTop: '40px',
                textAlign: 'center',
                paddingTop: '30px',
                borderTop: '2px solid #E0E0E0',
              }}>
                {/* Sponsor */}
                {batch.mainSponsor && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#707070',
                      marginBottom: '8px',
                      letterSpacing: '1px',
                    }}>
                      PRESENTED BY
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 900,
                      color: '#0A3D91',
                    }}>
                      {batch.mainSponsor}
                    </div>
                  </div>
                )}

                {/* KKF Stamp */}
                <div style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  border: '4px solid #0A3D91',
                  borderRadius: '50%',
                  width: '140px',
                  height: '140px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '20px',
                }}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    color: '#0A3D91',
                    marginBottom: '4px',
                  }}>
                    KKF
                  </div>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    color: '#C8102E',
                    textAlign: 'center',
                    letterSpacing: '1px',
                  }}>
                    OFFICIAL<br />SEAL
                  </div>
                </div>

                <div style={{
                  marginTop: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#707070',
                  letterSpacing: '1px',
                }}>
                  Date Issued: {formatDisplayDate(batch.createdDate)} • {batch.createdBy}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-[#E0E0E0] bg-white rounded-b-3xl">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleShare}
              disabled={isGenerating}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:opacity-90 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
            >
              <Share2 className="w-5 h-5" />
              {isGenerating ? "Generating..." : "Share Fight Card"}
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0A3D91] hover:opacity-90 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              Download Image
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-[#1A1A24] rounded-xl font-bold transition-all"
            >
              <Copy className="w-5 h-5" />
              Copy Link
            </button>
          </div>

          <p className="text-xs text-[#707070] text-center mt-4 font-medium">
            💡 Share this official fight card on social media to promote your event
          </p>
        </div>
      </div>
    </div>
  );
}
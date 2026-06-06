import { useRef, useState } from "react";
import { X, Share2, Download, Copy } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import type { MatchBatch } from "../data/batches";
import { formatDisplayDate } from "../data/batches";
import kkfLogo from "../../assets/modern_logo.png";

interface ShareFightCardProps {
  batch: MatchBatch;
  onClose: () => void;
}

export function ShareFightCard({ batch, onClose }: ShareFightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#FFFFFF",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
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
                    <img src={kkfLogo} alt="KKF Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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

                  {/* KKF Logo (Right) */}
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
                    <img src={kkfLogo} alt="KKF Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                </div>

                {/* Event Info */}
                <div style={{
                  background: 'linear-gradient(135deg, #F4F5F8 0%, #ffffff 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #E0E0E0',
                  marginBottom: '20px',
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
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#0A3D91',
                  }}>
                    {batch.name} • {formatDisplayDate(batch.date)} • {batch.location}
                  </div>
                </div>

                {/* Batch Number */}
                <div style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#1A1A24',
                  letterSpacing: '1px',
                }}>
                  Batch: <span style={{ color: '#0A3D91' }}>{batch.batchNumber}</span> • {batch.matches.length} Matches
                </div>
              </div>

              {/* Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '3px solid #1A1A24',
              }}>
                {/* Table Header */}
                <thead>
                  <tr>
                    <th style={{
                      border: '2px solid #1A1A24',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: 900,
                      color: '#1A1A24',
                      backgroundColor: '#F4F5F8',
                      textAlign: 'center',
                      width: '80px',
                    }}>
                      ទី<br />MATCH
                    </th>
                    <th style={{
                      border: '2px solid #1A1A24',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      backgroundColor: '#C8102E',
                      textAlign: 'center',
                    }}>
                      មុំក្រោមទង់ខាង<br />FIGHTER A
                    </th>
                    <th style={{
                      border: '2px solid #1A1A24',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: 900,
                      color: '#1A1A24',
                      backgroundColor: '#F4F5F8',
                      textAlign: 'center',
                      width: '120px',
                    }}>
                      ទម្ងន់<br />WEIGHT
                    </th>
                    <th style={{
                      border: '2px solid #1A1A24',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      backgroundColor: '#0A3D91',
                      textAlign: 'center',
                    }}>
                      មុំក្រោមទង់ខាង<br />FIGHTER B
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {batch.matches.map((match, index) => (
                    <tr key={match.id} style={{
                      backgroundColor: match.isChampionshipBout ? '#FFF9E6' : '#FFFFFF',
                    }}>
                      {/* Match Number */}
                      <td style={{
                        border: '2px solid #1A1A24',
                        padding: '16px 12px',
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: 900,
                        color: match.isChampionshipBout ? '#F2C94C' : '#1A1A24',
                        backgroundColor: match.isChampionshipBout ? '#1A1A24' : '#F4F5F8',
                      }}>
                        {match.isChampionshipBout && (
                          <div style={{ fontSize: '20px', marginBottom: '4px' }}>🏆</div>
                        )}
                        <div>ទី {index + 1}</div>
                        <div style={{ fontSize: '12px', fontWeight: 700 }}>({match.matchNumber})</div>
                      </td>

                      {/* Fighter A */}
                      <td style={{
                        border: '2px solid #1A1A24',
                        padding: '16px',
                        backgroundColor: '#FFE8EC',
                      }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 900,
                          color: '#1A1A24',
                          marginBottom: '6px',
                        }}>
                          {match.fighterA.name}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#707070',
                          marginBottom: '4px',
                        }}>
                          {match.fighterA.gym || 'Kun Khmer Gym'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#C8102E',
                        }}>
                          {match.fighterA.record}
                        </div>
                      </td>

                      {/* Weight */}
                      <td style={{
                        border: '2px solid #1A1A24',
                        padding: '16px 12px',
                        textAlign: 'center',
                        backgroundColor: '#F4F5F8',
                      }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 900,
                          color: '#1A1A24',
                        }}>
                          {match.weightClass}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#707070',
                          marginTop: '4px',
                        }}>
                          KUN KHMER
                        </div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 900,
                          color: '#0A3D91',
                          marginTop: '2px',
                        }}>
                          {match.rounds} Rds
                        </div>
                      </td>

                      {/* Fighter B */}
                      <td style={{
                        border: '2px solid #1A1A24',
                        padding: '16px',
                        backgroundColor: '#E6F0FF',
                      }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 900,
                          color: '#1A1A24',
                          marginBottom: '6px',
                        }}>
                          {match.fighterB.name}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#707070',
                          marginBottom: '4px',
                        }}>
                          {match.fighterB.gym || 'Kun Khmer Gym'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0A3D91',
                        }}>
                          {match.fighterB.record}
                        </div>
                      </td>
                    </tr>
                  ))}
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
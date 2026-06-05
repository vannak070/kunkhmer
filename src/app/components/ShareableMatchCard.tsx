import { forwardRef } from "react";
import { Shield, Trophy, Flame, Swords } from "lucide-react";

interface Match {
  id: string;
  matchNumber: number;
  fighterA: {
    id: string;
    name: string;
    alias: string;
    gym: string;
    style: string;
    image: string;
    nationality: string;
    record?: string;
    grade?: string;
  };
  fighterB: {
    id: string;
    name: string;
    alias: string;
    gym: string;
    image: string;
    nationality: string;
    record?: string;
    grade?: string;
  };
  weight: number;
  weightAgreement: string;
  rounds: number;
  isSpecialMatch?: boolean;
  isForeignMatch?: boolean;
  isChampionship?: boolean;
}

interface ShareableMatchCardProps {
  eventName: string;
  subEventName: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  matches: Match[];
  broadcastStation?: {
    name: string;
    logo: string;
  };
}

export const ShareableMatchCard = forwardRef<HTMLDivElement, ShareableMatchCardProps>(
  ({ eventName, subEventName, date, time, location, venue, matches, broadcastStation }, ref) => {
    const mainEvent = matches.find(m => m.isChampionship || m.isSpecialMatch);
    const regularMatches = matches.filter(m => !m.isChampionship && !m.isSpecialMatch);

    return (
      <div
        ref={ref}
        style={{
          backgroundColor: '#0A3D91',
          backgroundImage: `linear-gradient(135deg, #0A3D91 0%, #051C42 50%, #0A3D91 100%)`,
          width: '1080px',
          minHeight: '1350px',
          padding: '0',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: `url(https://www.transparenttextures.com/patterns/cubes.png)`,
          backgroundSize: 'auto',
          backgroundPosition: 'center',
        }} />

        {/* Gold Borders */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '8px',
          background: 'linear-gradient(90deg, #F2C94C 0%, #E6B800 50%, #F2C94C 100%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '8px',
          background: 'linear-gradient(90deg, #F2C94C 0%, #E6B800 50%, #F2C94C 100%)',
        }} />

        {/* Content Container */}
        <div style={{ position: 'relative', zIndex: 1, padding: '48px' }}>
          
          {/* Header Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px',
            marginBottom: '32px',
            border: '3px solid #F2C94C',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              {/* KKF Logo */}
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #0A3D91 0%, #051C42 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '5px solid #F2C94C',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                flexShrink: 0,
              }}>
                <div style={{ color: 'white', fontSize: '48px', fontWeight: 900 }}>KKF</div>
              </div>

              {/* Title */}
              <div style={{ flex: 1, textAlign: 'center', padding: '0 32px' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#0A3D91',
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}>
                  Kingdom of Cambodia
                </div>
                <div style={{
                  fontSize: '42px',
                  fontWeight: 900,
                  color: '#C8102E',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '4px',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                }}>
                  {eventName}
                </div>
                <div style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#0A3D91',
                }}>
                  {subEventName}
                </div>
              </div>

              {/* Broadcast Station */}
              {broadcastStation && (
                <div style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '5px solid #E0E0E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                  flexShrink: 0,
                }}>
                  <img src={broadcastStation.logo} alt={broadcastStation.name} style={{ maxWidth: '90%', maxHeight: '90%' }} />
                </div>
              )}
            </div>

            {/* Event Details Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              gap: '24px',
              padding: '20px',
              background: 'linear-gradient(135deg, #F4F5F8 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '2px solid #E0E0E0',
            }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#707070', letterSpacing: '1px', marginBottom: '4px' }}>
                  DATE
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0A3D91' }}>
                  {date}
                </div>
              </div>
              <div style={{ width: '2px', background: '#E0E0E0' }} />
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#707070', letterSpacing: '1px', marginBottom: '4px' }}>
                  TIME
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0A3D91' }}>
                  {time}
                </div>
              </div>
              <div style={{ width: '2px', background: '#E0E0E0' }} />
              <div style={{ textAlign: 'center', flex: 2 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#707070', letterSpacing: '1px', marginBottom: '4px' }}>
                  VENUE
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0A3D91' }}>
                  {venue}
                </div>
              </div>
            </div>
          </div>

          {/* Main Event - Hero Card */}
          {mainEvent && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(200, 16, 46, 0.95) 0%, rgba(160, 13, 36, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '40px',
              marginBottom: '24px',
              border: '4px solid #F2C94C',
              boxShadow: '0 25px 70px rgba(200, 16, 46, 0.6)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Championship Badge */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#F2C94C',
                color: '#1A1A24',
                padding: '12px 24px',
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: 900,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
              }}>
                🏆 MAIN EVENT
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                {/* Fighter A */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: '220px',
                    height: '220px',
                    margin: '0 auto 20px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: '5px solid #F2C94C',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                  }}>
                    <img src={mainEvent.fighterA.image} alt={mainEvent.fighterA.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    color: '#ffffff',
                    marginBottom: '8px',
                    textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
                  }}>
                    {mainEvent.fighterA.name}
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#F2C94C',
                    marginBottom: '8px',
                  }}>
                    "{mainEvent.fighterA.alias}"
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}>
                    {mainEvent.fighterA.record || '0-0-0'}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginTop: '4px',
                  }}>
                    {mainEvent.fighterA.gym}
                  </div>
                </div>

                {/* VS Badge - Larger */}
                <div style={{
                  width: '140px',
                  height: '140px',
                  background: 'linear-gradient(135deg, #F2C94C 0%, #E6B800 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  fontWeight: 900,
                  color: '#1A1A24',
                  border: '6px solid #ffffff',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                  flexShrink: 0,
                }}>
                  VS
                </div>

                {/* Fighter B */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: '220px',
                    height: '220px',
                    margin: '0 auto 20px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: '5px solid #F2C94C',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                  }}>
                    <img src={mainEvent.fighterB.image} alt={mainEvent.fighterB.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    color: '#ffffff',
                    marginBottom: '8px',
                    textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
                  }}>
                    {mainEvent.fighterB.name}
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#F2C94C',
                    marginBottom: '8px',
                  }}>
                    "{mainEvent.fighterB.alias}"
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}>
                    {mainEvent.fighterB.record || '0-0-0'}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginTop: '4px',
                  }}>
                    {mainEvent.fighterB.gym}
                  </div>
                </div>
              </div>

              {/* Match Details */}
              <div style={{
                marginTop: '32px',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'center',
                gap: '40px',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '4px' }}>
                    WEIGHT
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#F2C94C' }}>
                    {mainEvent.weight}kg
                  </div>
                </div>
                <div style={{ width: '2px', background: 'rgba(255, 255, 255, 0.3)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '4px' }}>
                    ROUNDS
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#F2C94C' }}>
                    {mainEvent.rounds}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Undercard Matches */}
          {regularMatches.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              border: '3px solid rgba(242, 201, 76, 0.5)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#0A3D91',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '24px',
                textAlign: 'center',
                paddingBottom: '16px',
                borderBottom: '3px solid #E0E0E0',
              }}>
                UNDERCARD
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {regularMatches.map((match, index) => (
                  <div key={match.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #F4F5F8 0%, #ffffff 100%)',
                    borderRadius: '16px',
                    border: '2px solid #E0E0E0',
                  }}>
                    {/* Match Number */}
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: 'linear-gradient(135deg, #0A3D91 0%, #051C42 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 900,
                      color: 'white',
                      flexShrink: 0,
                    }}>
                      {regularMatches.length - index}
                    </div>

                    {/* Fighter A */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '3px solid #E0E0E0',
                        flexShrink: 0,
                      }}>
                        <img src={match.fighterA.image} alt={match.fighterA.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A24' }}>
                          {match.fighterA.name}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#707070' }}>
                          {match.fighterA.record || '0-0-0'}
                        </div>
                      </div>
                    </div>

                    {/* VS Badge - Small */}
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: 'linear-gradient(135deg, #C8102E 0%, #A00D24 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 900,
                      color: 'white',
                      flexShrink: 0,
                    }}>
                      VS
                    </div>

                    {/* Fighter B */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A24' }}>
                          {match.fighterB.name}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#707070' }}>
                          {match.fighterB.record || '0-0-0'}
                        </div>
                      </div>
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '3px solid #E0E0E0',
                        flexShrink: 0,
                      }}>
                        <img src={match.fighterB.image} alt={match.fighterB.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </div>

                    {/* Weight Info */}
                    <div style={{
                      background: '#0A3D91',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 900,
                      flexShrink: 0,
                    }}>
                      {match.weight}kg
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop: '32px',
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '2px solid rgba(242, 201, 76, 0.5)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 900,
              color: '#0A3D91',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}>
              KUN KHMER FEDERATION
            </div>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#707070',
              marginTop: '4px',
            }}>
              Preserving the Heritage • Building Champions
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ShareableMatchCard.displayName = "ShareableMatchCard";
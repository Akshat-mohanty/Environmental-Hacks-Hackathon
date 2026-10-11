import React from 'react';

/**
 * Architectural Location Plaques & Vector Elements
 * Designed in the Lao Garden editorial aesthetic:
 * Strong Cormorant Garamond place typography, refined hairline frames,
 * coordinates, and cartographic stamps (no random graphs or AI slop).
 */

export function StationContourArt({ name = "Observation Point", lat = "28.64° N", lon = "77.31° E", city = "Delhi" }) {
  // Extract main locality and region
  const parts = name.split(',');
  const mainName = parts[0].trim();
  const subName = parts[1] ? parts[1].trim() : city;

  return (
    <div className="atmospheric-art" style={{ background: '#FFFDF9', padding: '1.25rem', position: 'relative' }}>
      {/* Editorial Frame with Corner Brackets */}
      <div style={{
        width: '100%',
        height: '100%',
        border: '1px solid #DCD3C5',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '1.25rem 1rem',
        background: 'linear-gradient(180deg, rgba(250, 247, 242, 0.6) 0%, rgba(243, 236, 226, 0.3) 100%)'
      }}>
        {/* Subtle Corner Crosses / Accents */}
        <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '9px', color: '#816B0E', lineHeight: 1 }}>+</span>
        <span style={{ position: 'absolute', top: '4px', right: '6px', fontSize: '9px', color: '#816B0E', lineHeight: 1 }}>+</span>
        <span style={{ position: 'absolute', bottom: '4px', left: '6px', fontSize: '9px', color: '#816B0E', lineHeight: 1 }}>+</span>
        <span style={{ position: 'absolute', bottom: '4px', right: '6px', fontSize: '9px', color: '#816B0E', lineHeight: 1 }}>+</span>

        {/* Prominent Place Name in Cormorant Garamond */}
        <h4 className="font-serif" style={{
          fontSize: '2.25rem',
          fontWeight: 400,
          color: '#23170F',
          lineHeight: 1.15,
          letterSpacing: '-0.015em',
          maxWidth: '92%'
        }}>
          {mainName}
        </h4>
      </div>
    </div>
  );
}

export function WindRoseArt() {
  return (
    <div className="atmospheric-art">
      <svg width="100%" height="100%" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="90" x2="300" y2="90" stroke="#DDD4C7" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="160" y1="15" x2="160" y2="165" stroke="#DDD4C7" strokeWidth="0.8" strokeDasharray="3 3" />
        <circle cx="160" cy="90" r="60" stroke="#DDD4C7" strokeWidth="0.8" strokeDasharray="2 4" />
        <circle cx="160" cy="90" r="35" stroke="#816B0E" strokeWidth="0.6" />
        
        <text x="160" y="24" fill="#816B0E" fontSize="9" fontFamily="Jost" textAnchor="middle" letterSpacing="0.1em">N (360°)</text>
        <text x="160" y="166" fill="#96897E" fontSize="9" fontFamily="Jost" textAnchor="middle" letterSpacing="0.1em">S (180°)</text>
        <text x="295" y="93" fill="#96897E" fontSize="9" fontFamily="Jost" textAnchor="start" letterSpacing="0.1em">E</text>
        <text x="25" y="93" fill="#96897E" fontSize="9" fontFamily="Jost" textAnchor="end" letterSpacing="0.1em">W</text>
        
        <line x1="80" y1="35" x2="160" y2="90" stroke="#7A3226" strokeWidth="2" className="plume-trajectory-animated" />
        <polygon points="80,35 95,38 88,48" fill="#7A3226" />
        <text x="75" y="28" fill="#7A3226" fontSize="8" fontFamily="Jost" fontWeight="600" letterSpacing="0.12em">PLUME VECTOR 315° NW</text>
        
        <ellipse cx="160" cy="90" rx="100" ry="45" stroke="#CBBFA8" strokeWidth="0.5" strokeDasharray="4 2" />
        <text x="250" y="42" fill="#816B0E" fontSize="8" fontFamily="Cormorant Garamond" fontStyle="italic">1014 hPa isobar</text>
      </svg>
    </div>
  );
}

export function SchoolSanctuaryArt({ name = "Campus Shield", indoorAqi = 88 }) {
  const parts = name.split(',');
  const mainName = parts[0].trim();
  const location = parts[1] ? parts[1].trim() : 'Delhi';

  return (
    <div className="atmospheric-art" style={{ background: '#FFFDF9', padding: '1.25rem', position: 'relative' }}>
      <div style={{
        width: '100%',
        height: '100%',
        border: '1px solid #DCD3C5',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '1.25rem 1rem',
        background: 'linear-gradient(180deg, rgba(250, 247, 242, 0.6) 0%, rgba(243, 236, 226, 0.3) 100%)'
      }}>
        <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '9px', color: '#7A3226', lineHeight: 1 }}>+</span>
        <span style={{ position: 'absolute', top: '4px', right: '6px', fontSize: '9px', color: '#7A3226', lineHeight: 1 }}>+</span>
        <span style={{ position: 'absolute', bottom: '4px', left: '6px', fontSize: '9px', color: '#7A3226', lineHeight: 1 }}>+</span>
        <span style={{ position: 'absolute', bottom: '4px', right: '6px', fontSize: '9px', color: '#7A3226', lineHeight: 1 }}>+</span>

        <p className="tracked-caps" style={{ color: '#7A3226', fontSize: '0.65rem', marginBottom: '0.4rem', letterSpacing: '0.24em' }}>
          CAMPUS SANCTUARY &bull; {location.toUpperCase()}
        </p>

        <h4 className="font-serif" style={{
          fontSize: '1.65rem',
          fontWeight: 400,
          color: '#23170F',
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          maxWidth: '92%'
        }}>
          {mainName}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '60%', margin: '0.6rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#DCD3C5' }}></div>
          <span style={{ color: '#2C573F', fontSize: '0.55rem' }}>✦</span>
          <div style={{ flex: 1, height: '1px', background: '#DCD3C5' }}></div>
        </div>

        <p style={{
          fontFamily: 'Jost, sans-serif',
          fontSize: '0.72rem',
          color: '#2C573F',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase'
        }}>
          INDOOR AIR ENVELOPE: AQI {indoorAqi}
        </p>
      </div>
    </div>
  );
}

export function StubbleThermalArt({ district = "Punjab", frp = "68.4 MW", distance = "240 km" }) {
  const parts = district.split(',');
  const districtName = parts[0].trim();
  const state = parts[1] ? parts[1].trim() : 'North Basin';

  return (
    <div className="atmospheric-art" style={{ background: '#FFFDF9', padding: '1.25rem', position: 'relative' }}>
      <div style={{
        width: '100%',
        height: '100%',
        border: '1px solid #DCD3C5',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '1.25rem 1rem',
        background: 'linear-gradient(180deg, rgba(250, 247, 242, 0.6) 0%, rgba(243, 236, 226, 0.3) 100%)'
      }}>
        <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '9px', color: '#7A3226', lineHeight: 1 }}>+</span>
        <span style={{ position: 'absolute', top: '4px', right: '6px', fontSize: '9px', color: '#7A3226', lineHeight: 1 }}>+</span>
        <span style={{ position: 'absolute', bottom: '4px', left: '6px', fontSize: '9px', color: '#7A3226', lineHeight: 1 }}>+</span>
        <span style={{ position: 'absolute', bottom: '4px', right: '6px', fontSize: '9px', color: '#7A3226', lineHeight: 1 }}>+</span>

        <p className="tracked-caps" style={{ color: '#7A3226', fontSize: '0.65rem', marginBottom: '0.4rem', letterSpacing: '0.24em' }}>
          SATELLITE THERMAL DETECT &bull; {state.toUpperCase()}
        </p>

        <h4 className="font-serif" style={{
          fontSize: '1.85rem',
          fontWeight: 400,
          color: '#23170F',
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
          maxWidth: '90%'
        }}>
          {districtName}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '60%', margin: '0.6rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#DCD3C5' }}></div>
          <span style={{ color: '#7A3226', fontSize: '0.55rem' }}>✦</span>
          <div style={{ flex: 1, height: '1px', background: '#DCD3C5' }}></div>
        </div>

        <p style={{
          fontFamily: 'Jost, sans-serif',
          fontSize: '0.72rem',
          color: '#6E6157',
          letterSpacing: '0.14em',
          textTransform: 'uppercase'
        }}>
          INTENSITY: {frp} &bull; {distance} TO DELHI
        </p>
      </div>
    </div>
  );
}

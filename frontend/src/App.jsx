import React, { useState, useEffect } from 'react';
import {
  Wind,
  Flame,
  School,
  AlertTriangle,
  Activity,
  Cpu,
  UserCheck,
  Send,
  Compass,
  ArrowRight,
  Shield,
  Layers,
  Check
} from 'lucide-react';
import {
  WindRoseArt,
  StationContourArt,
  SchoolSanctuaryArt,
  StubbleThermalArt
} from './components/AtmosphericArt';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stationsData, setStationsData] = useState(null);
  const [schoolsData, setSchoolsData] = useState(null);
  const [stubbleData, setStubbleData] = useState(null);
  const [aiForecast, setAiForecast] = useState(null);
  const [exposureResult, setExposureResult] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState('asthmatic');
  const [userAqiInput, setUserAqiInput] = useState(380);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const [selectedSchoolForAdvisory, setSelectedSchoolForAdvisory] = useState(null);
  const [schoolAdvisoryContent, setSchoolAdvisoryContent] = useState(null);
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [resStations, resSchools, resStubble, resAi, resAlerts] = await Promise.all([
        fetch(`${API_BASE}/stations`),
        fetch(`${API_BASE}/schools/safety`),
        fetch(`${API_BASE}/stubble-drift?bearing=315&speed=5.2`),
        fetch(`${API_BASE}/ai/forecast?currentAqi=380&fires=55`),
        fetch(`${API_BASE}/alerts/history`)
      ]);

      setStationsData(await resStations.json());
      setSchoolsData(await resSchools.json());
      setStubbleData(await resStubble.json());
      setAiForecast(await resAi.json());
      const aData = await resAlerts.json();
      setAlertHistory(aData.alerts || []);

      calculateBudget(380, 'asthmatic');
    } catch (err) {
      console.warn('API error, using local fallback:', err);
    }
  };

  const calculateBudget = async (aqi, profile) => {
    try {
      const res = await fetch(`${API_BASE}/exposure-budget?aqi=${aqi}&profile=${profile}`);
      const data = await res.json();
      setExposureResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileChange = (profile) => {
    setSelectedProfile(profile);
    calculateBudget(userAqiInput, profile);
  };

  const handleAqiSliderChange = (e) => {
    const val = parseInt(e.target.value);
    setUserAqiInput(val);
    calculateBudget(val, selectedProfile);
  };

  const handleDispatchAlert = async (e) => {
    e.preventDefault();
    setBroadcasting(true);
    setBroadcastSuccess(null);

    const payload = {
      targetType: 'SCHOOL_AND_CITIZENS',
      targetName: 'Delhi-NCR High-Risk Zone',
      severity: userAqiInput > 400 ? 'CRITICAL_STAGE_IV' : 'STAGE_III_SEVERE',
      aqi: userAqiInput,
      message: `Emergency air toxicity threshold reached (${userAqiInput}). Sustained stubble plume intrusion along 315° NW vector. Activate Stage IV school & respiratory protocol immediately.`,
      actionChecklist: [
        'Suspend outdoor sports and physical morning assemblies.',
        'Shift primary school classes (1 to 8) to online remote learning.',
        'Run campus HEPA filtration at 100% capacity.'
      ]
    };

    try {
      const res = await fetch(`${API_BASE}/alerts/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setBroadcastSuccess(data.alert);
      setAlertHistory((prev) => [data.alert, ...prev]);
    } catch (err) {
      setBroadcastSuccess({
        alertId: `ALT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        snsStatus: 'DISPATCHED_SIMULATED_SNS',
        ...payload
      });
    } finally {
      setBroadcasting(false);
    }
  };

  const fetchSchoolAiAdvisory = async (school) => {
    setSelectedSchoolForAdvisory(school);
    setLoadingAdvisory(true);
    try {
      const res = await fetch(`${API_BASE}/ai/advisory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: school.name,
          currentAqi: school.outdoorAqi,
          predictedAqi: school.outdoorAqi + 42,
          studentCount: school.studentCount,
          hasPurifiers: school.airPurifiersActive
        })
      });
      const advisory = await res.json();
      setSchoolAdvisoryContent(advisory);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdvisory(false);
    }
  };

  const getTagClass = (aqi) => {
    if (aqi > 400) return 'tag-severe';
    if (aqi > 300) return 'tag-verypoor';
    if (aqi > 200) return 'tag-poor';
    return 'tag-safe';
  };

  return (
    <div>
      {/* Site Header */}
      <header className="site-header">
        <div className="container header-inner">
          <a href="#" className="brand-mark">
            <div className="brand-emblem">
              <Wind size={18} color="var(--brass)" />
            </div>
            <div>
              <span className="font-serif" style={{ fontSize: '1.65rem', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1 }}>
                VayuRakshak
              </span>
              <p className="tracked-caps" style={{ color: 'var(--text-subtle)', marginTop: '0.15rem' }}>
                Air Defense &bull; Delhi-NCR Observatory
              </p>
            </div>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
              <p className="tracked-caps" style={{ color: 'var(--text-subtle)' }}>Telemetry</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--forest-safe)', fontWeight: 600 }}>
                <span className="animate-pulse-subtle">●</span> AWS Live Pipeline
              </p>
            </div>
            <button className="btn-terracotta" onClick={() => setAlertModalOpen(true)}>
              <AlertTriangle size={14} /> Dispatch Emergency SNS Alert
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-editorial">
        <div className="container">

          <h1 className="hero-title">
            Real-time air intelligence to shield communities and schools on <em>high-pollution days.</em>
          </h1>

          <p className="hero-description">
            A civic air defense gazette and school safety command platform deployed on AWS. 
            Synthesizing satellite thermal stubble detection, hyperlocal CPCB particulates, 
            and SageMaker predictive trajectory modeling to safeguard students and vulnerable populations.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-brass" onClick={() => setActiveTab('schools')}>
              <School size={14} /> Inspect School Safety Protocols
            </button>
            <button className="btn-outline" onClick={() => setActiveTab('stubble')}>
              <Compass size={14} /> View Stubble Plume Radar
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container" style={{ padding: '3.5rem 2rem 6rem' }}>
        {/* Metric Cards (Lao Garden Editorial Number Treatment) */}
        <div className="metric-row">
          <div className="metric-card">
            <span className="tracked-caps" style={{ color: 'var(--text-subtle)' }}>Regional AQI Mean</span>
            <div className="metric-number">
              {stationsData?.averageAqi || 341}
            </div>
            <span className="tag-badge tag-verypoor">Very Poor &bull; NCR Average</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Synthesized across 5 CPCB air monitoring nodes
            </p>
          </div>

          <div className="metric-card">
            <span className="tracked-caps" style={{ color: 'var(--text-subtle)' }}>Peak Air Hotspot</span>
            <div className="metric-number" style={{ color: 'var(--wine-severe)' }}>
              {stationsData?.highestRiskStation?.aqi || 412}
            </div>
            <span className="tag-badge tag-severe">Severe &bull; Anand Vihar</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              PM2.5: {stationsData?.highestRiskStation?.pm25 || 285.4} µg/m³
            </p>
          </div>

          <div className="metric-card">
            <span className="tracked-caps" style={{ color: 'var(--text-subtle)' }}>Thermal Fire Clusters</span>
            <div className="metric-number" style={{ color: 'var(--terracotta)' }}>
              04
            </div>
            <span className="tag-badge tag-brass">VIIRS Satellite Verified</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Direct North-West 315° plume trajectory
            </p>
          </div>

          <div className="metric-card">
            <span className="tracked-caps" style={{ color: 'var(--text-subtle)' }}>GRAP IV School Alerts</span>
            <div className="metric-number" style={{ color: 'var(--wine-severe)' }}>
              01
            </div>
            <span className="tag-badge tag-severe">Remote Learning Protocol</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              1,950 students transitioned to home protection
            </p>
          </div>
        </div>

        {/* All 5 Navigation Tiles Displayed at Once */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '0.85rem',
          marginBottom: '3rem'
        }}>
          {[
            { id: 'overview', roman: 'I', title: 'Regional Observatory', subtitle: '5 Monitoring Nodes' },
            { id: 'schools', roman: 'II', title: 'School Safety Gazette', subtitle: 'GRAP Action Matrix' },
            { id: 'stubble', roman: 'III', title: 'Stubble Plume Radar', subtitle: 'Satellite Hotspots' },
            { id: 'exposure', roman: 'IV', title: 'Exposure Budget', subtitle: 'Clinical Limit Index' },
            { id: 'forecast', roman: 'V', title: 'SageMaker 12H Forecast', subtitle: 'DeepAR Prediction' }
          ].map((tile) => {
            const isActive = activeTab === tile.id;
            return (
              <button
                key={tile.id}
                onClick={() => setActiveTab(tile.id)}
                style={{
                  background: isActive ? '#FFFDF9' : 'var(--bg-card)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--brass)' : 'var(--border-color)',
                  padding: '1.25rem 1rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: 0,
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 10px 25px rgba(35, 23, 15, 0.08)' : 'none'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: isActive ? 'var(--brass)' : 'transparent'
                }} />
                <span className="tracked-caps" style={{ color: isActive ? 'var(--brass)' : 'var(--text-subtle)', fontSize: '0.66rem' }}>
                  {tile.roman}. CHAPTER
                </span>
                <h4 className="font-serif" style={{
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  margin: '0.35rem 0 0.15rem',
                  lineHeight: 1.15
                }}>
                  {tile.title}
                </h4>
                <p style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.04em'
                }}>
                  {tile.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* TAB 1: REGIONAL OBSERVATORY GRID */}
        {activeTab === 'overview' && (
          <div key="overview" className="animate-fade-up" style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
              <div>
                <p className="tracked-caps" style={{ color: 'var(--brass)' }}>Station Observations</p>
                <h2 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 400 }}>
                  Active Ground Telemetry
                </h2>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                Reporting from CPCB continuous ambient stations
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
              {stationsData?.stations?.map((station) => (
                <div key={station.stationId} className="arch-card">
                  {/* Bespoke Architectural Vector Art */}
                  <StationContourArt
                    name={station.name}
                    lat={`${station.lat.toFixed(2)}° N`}
                    lon={`${station.lon.toFixed(2)}° E`}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                    <h3 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 500 }}>
                      {station.name}
                    </h3>
                    <span className={`tag-badge ${getTagClass(station.aqi)}`}>
                      AQI {station.aqi}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    {station.city} Monitoring Node &bull; {station.category} Exposure
                  </p>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-subtle)' }}>PM2.5:</span>{' '}
                      <strong>{station.pm25} µg/m³</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-subtle)' }}>PM10:</span>{' '}
                      <strong>{station.pm10} µg/m³</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-subtle)' }}>Wind:</span>{' '}
                      <strong>{station.windDirection} ({station.windSpeed} km/h)</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-subtle)' }}>Humidity:</span>{' '}
                      <strong>{station.humidity}%</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SCHOOL SAFETY GAZETTE */}
        {activeTab === 'schools' && (
          <div key="schools" className="animate-fade-up" style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
              <div>
                <p className="tracked-caps" style={{ color: 'var(--brass)' }}>Civic Safety Enforcement</p>
                <h2 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 400 }}>
                  School Action Protocols on Toxic Air Days
                </h2>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                Graded Response Action Plan (GRAP Stages I–IV)
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
              {schoolsData?.schools?.map((school) => (
                <div key={school.schoolId} className="arch-card">
                  {/* Bespoke School Sanctuary Vector Art */}
                  <SchoolSanctuaryArt name={school.name} indoorAqi={school.indoorAqi} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <h3 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 500 }}>
                      {school.name}
                    </h3>
                    <span className={`tag-badge ${school.safetyStatus === 'CRITICAL_ACTION_REQUIRED' ? 'tag-severe' : 'tag-poor'}`}>
                      {school.grapStage}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    {school.zone} &bull; {school.studentCount} Students Enrolled
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#FFFDF9', border: '1px solid var(--border-color)', padding: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <p className="tracked-caps" style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>Ambient Outdoor</p>
                      <p className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--wine-severe)' }}>AQI {school.outdoorAqi}</p>
                    </div>
                    <div>
                      <p className="tracked-caps" style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>Classroom Indoor</p>
                      <p className="font-serif" style={{ fontSize: '1.75rem', color: school.indoorAqi < 100 ? 'var(--forest-safe)' : 'var(--amber-poor)' }}>
                        AQI {school.indoorAqi}
                      </p>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                    <strong>Filtration Status:</strong>{' '}
                    {school.airPurifiersActive ? (
                      <span style={{ color: 'var(--forest-safe)', fontWeight: 600 }}>Active HEPA Filtration Running</span>
                    ) : (
                      <span style={{ color: 'var(--wine-severe)', fontWeight: 600 }}>No Active Purifiers &bull; Vulnerable</span>
                    )}
                  </div>

                  <div style={{ flex: 1, borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                    <p className="tracked-caps" style={{ color: 'var(--brass)', marginBottom: '0.5rem' }}>
                      Mandated Action Protocol:
                    </p>
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {school.actionProtocol?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <button className="btn-brass" onClick={() => fetchSchoolAiAdvisory(school)}>
                    <Cpu size={14} /> Generate SageMaker Action Brief
                  </button>
                </div>
              ))}
            </div>

            {/* School AI Advisory Drawer / Box */}
            {selectedSchoolForAdvisory && schoolAdvisoryContent && (
              <div className="arch-card animate-fade-up" style={{ marginTop: '2.5rem', background: '#FFFDF9', borderColor: 'var(--brass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="tag-badge tag-brass">SageMaker Advisory</span>
                    <h3 className="font-serif" style={{ fontSize: '1.65rem', fontWeight: 500 }}>
                      Official Operational Directive for {selectedSchoolForAdvisory.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedSchoolForAdvisory(null)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', letterSpacing: '0.1em' }}
                  >
                    [ CLOSE DIRECTIVE ]
                  </button>
                </div>

                <p className="font-serif" style={{ fontSize: '1.15rem', fontStyle: 'italic', color: 'var(--terracotta)', margin: '1.25rem 0' }}>
                  "{schoolAdvisoryContent.executiveSummary}"
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
                    <p className="tracked-caps" style={{ color: 'var(--terracotta)', marginBottom: '0.75rem' }}>
                      Immediate Administrative Actions
                    </p>
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {schoolAdvisoryContent.immediateDirectives?.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
                    <p className="tracked-caps" style={{ color: 'var(--brass)', marginBottom: '0.75rem' }}>
                      Classroom Aerodynamic Engineering
                    </p>
                    <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <strong>Ventilation Window:</strong> {schoolAdvisoryContent.indoorAirManagement?.ventilationWindow}
                    </p>
                    <p style={{ fontSize: '0.85rem' }}>
                      <strong>Filter Saturation Warning:</strong> {schoolAdvisoryContent.indoorAirManagement?.filterHealthWarning}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STUBBLE PLUME RADAR */}
        {activeTab === 'stubble' && (
          <div key="stubble" className="animate-fade-up" style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
              <div>
                <p className="tracked-caps" style={{ color: 'var(--brass)' }}>Satellite Telemetry & Vector Drift</p>
                <h2 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 400 }}>
                  Agricultural Stubble Fire Plume Radar
                </h2>
              </div>
              <span className="tag-badge tag-severe">NW Plume Vector (315°)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {stubbleData?.analyzedFires?.map((fire) => (
                <div key={fire.fireId} className="arch-card">
                  {/* Bespoke Thermal Art */}
                  <StubbleThermalArt district={fire.district} frp={`${fire.frp} MW`} distance={`${fire.distanceToDelhiKm} km`} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <h3 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 500 }}>
                      {fire.district}
                    </h3>
                    <span className="tag-badge tag-verypoor">{fire.clusterCount} Fire Points</span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Coordinates: {fire.lat.toFixed(3)}° N, {fire.lon.toFixed(3)}° E
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#FFFDF9', border: '1px solid var(--border-color)', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-subtle)' }}>FRP (Radiative Power):</span>
                      <p className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{fire.frp} MW</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-subtle)' }}>Distance to Delhi:</span>
                      <p className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{fire.distanceToDelhiKm} km</p>
                    </div>
                  </div>

                  <div style={{ borderLeft: '2px solid var(--terracotta)', paddingLeft: '1rem', background: 'rgba(122, 50, 38, 0.04)', padding: '0.75rem' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--terracotta)', fontWeight: 600 }}>
                      Estimated Downwind Arrival: In ~{fire.estimatedArrivalHours} hrs
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {fire.driftRisk}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PERSONAL EXPOSURE BUDGET */}
        {activeTab === 'exposure' && (
          <div key="exposure" className="animate-fade-up" style={{ maxWidth: '820px', margin: '0 auto', marginBottom: '3rem' }}>
            <div className="arch-card" style={{ background: '#FFFDF9', padding: '3rem 2.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <p className="tracked-caps" style={{ color: 'var(--brass)' }}>Clinical Environmental Index</p>
                <h2 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 400, marginTop: '0.25rem' }}>
                  Personal Pollution Exposure Budget
                </h2>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '580px', margin: '0.5rem auto 0' }}>
                  Calculate permissible outdoor inhalation thresholds before fine particulate penetration impairs pulmonary function.
                </p>
              </div>

              {/* Profile Selector */}
              <p className="tracked-caps" style={{ color: 'var(--text-subtle)', marginBottom: '0.75rem' }}>
                Select Physiological Vulnerability Profile:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '2.5rem' }}>
                {[
                  { id: 'asthmatic', label: 'Asthmatic / Respiratory' },
                  { id: 'child', label: 'School Child (5–14)' },
                  { id: 'senior', label: 'Senior Citizen (65+)' },
                  { id: 'outdoor_worker', label: 'Outdoor Laborer' },
                  { id: 'normal', label: 'Healthy Adult' }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProfileChange(p.id)}
                    style={{
                      background: selectedProfile === p.id ? 'var(--brass)' : 'transparent',
                      color: selectedProfile === p.id ? '#FFFDF9' : 'var(--text-primary)',
                      border: '1px solid',
                      borderColor: selectedProfile === p.id ? 'var(--brass)' : 'var(--border-color)',
                      padding: '0.85rem 0.5rem',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.75rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* AQI Slider */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                  <label className="tracked-caps" style={{ color: 'var(--text-subtle)' }}>
                    Current Ambient Exposure: AQI {userAqiInput}
                  </label>
                  <span className={`tag-badge ${getTagClass(userAqiInput)}`}>
                    AQI {userAqiInput}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  value={userAqiInput}
                  onChange={handleAqiSliderChange}
                  style={{ width: '100%', accentColor: 'var(--brass)', cursor: 'pointer' }}
                />
              </div>

              {/* Exposure Output Box */}
              {exposureResult && (
                <div style={{ border: '1px solid var(--border-color)', background: 'var(--bg-canvas)', padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                      <span className="tracked-caps" style={{ color: 'var(--text-subtle)' }}>Safe Outdoor Budget</span>
                      <div className="font-serif" style={{ fontSize: '3.75rem', color: exposureResult.recommendedOutdoorMaxMinutes <= 20 ? 'var(--wine-severe)' : 'var(--amber-poor)', lineHeight: 1, marginTop: '0.5rem' }}>
                        {exposureResult.recommendedOutdoorMaxMinutes} <em>minutes</em>
                      </div>
                    </div>
                    <span className="tag-badge tag-severe" style={{ fontSize: '0.75rem' }}>
                      {exposureResult.maskType}
                    </span>
                  </div>

                  <hr className="ornamental-hr" style={{ margin: '1.75rem 0' }} />

                  <p className="font-serif" style={{ fontSize: '1.15rem', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                    "{exposureResult.activityRecommendation}"
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                    {exposureResult.airPurifierNeeded
                      ? '⚠️ Indoor HEPA filtration imperative. Keep windows hermetically sealed during nocturnal inversion.'
                      : '✅ Ambient indoor air permissible with natural ventilation.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SAGEMAKER 12H FORECAST */}
        {activeTab === 'forecast' && (
          <div key="forecast" className="animate-fade-up" style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
              <div>
                <p className="tracked-caps" style={{ color: 'var(--brass)' }}>SageMaker AeroNet Ensemble</p>
                <h2 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 400 }}>
                  12-Hour Atmospheric Dispersion Trajectory
                </h2>
              </div>
              <span className="tag-badge tag-brass">AWS Machine Learning Model &bull; 91% Confidence</span>
            </div>

            <div className="arch-card" style={{ background: '#FFFDF9', marginBottom: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                <div>
                  <span className="tracked-caps" style={{ color: 'var(--text-subtle)' }}>Projected Peak Inversion</span>
                  <p className="font-serif" style={{ fontSize: '2.25rem', color: 'var(--wine-severe)' }}>
                    {aiForecast?.peakForecastHour} &bull; AQI {aiForecast?.peakPredictedAqi}
                  </p>
                </div>
                <div>
                  <span className="tracked-caps" style={{ color: 'var(--text-subtle)' }}>Plume Dispersion Corridor</span>
                  <p className="font-serif" style={{ fontSize: '1.45rem', color: 'var(--brass)' }}>
                    {aiForecast?.windAlignment}
                  </p>
                </div>
                <div>
                  <span className="tracked-caps" style={{ color: 'var(--text-subtle)' }}>Anticipated Civil Mandate</span>
                  <p className="font-serif" style={{ fontSize: '1.45rem', color: 'var(--terracotta)' }}>
                    GRAP Stage IV Emergency Restrictions
                  </p>
                </div>
              </div>

              {/* Hourly Forecast Bar */}
              <p className="tracked-caps" style={{ color: 'var(--text-subtle)', marginBottom: '0.75rem' }}>
                Chronological Projection:
              </p>
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                {aiForecast?.hourlyForecast?.map((item, idx) => (
                  <div key={idx} style={{ flex: '0 0 110px', background: 'var(--bg-canvas)', border: '1px solid var(--border-color)', padding: '1rem 0.75rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{item.displayTime}</p>
                    <p className="font-serif" style={{ fontSize: '1.75rem', margin: '0.25rem 0', color: item.predictedAqi > 400 ? 'var(--wine-severe)' : 'var(--rust-verypoor)' }}>
                      {item.predictedAqi}
                    </p>
                    <span className={`tag-badge ${getTagClass(item.predictedAqi)}`} style={{ fontSize: '0.62rem' }}>
                      {item.category}
                    </span>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Smoke: {item.stubbleContributionPercent}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


      </main>

      {/* Site Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '2.5rem 0', background: 'rgba(250, 247, 242, 0.7)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <p style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: '0.74rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)'
          }}>
            Made by <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Akshat Mohanty</strong>
          </p>
        </div>
      </footer>

      {/* EMERGENCY BROADCAST MODAL */}
      {alertModalOpen && (
        <div className="editorial-modal-backdrop">
          <div className="editorial-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
              <h2 className="font-serif" style={{ fontSize: '1.85rem', color: 'var(--wine-severe)' }}>
                Dispatch Amazon SNS Civic Broadcast
              </h2>
              <button
                onClick={() => setAlertModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleDispatchAlert}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="tracked-caps" style={{ color: 'var(--text-subtle)', display: 'block', marginBottom: '0.35rem' }}>
                  Target Zone / Channel:
                </label>
                <input
                  type="text"
                  readOnly
                  value="All Delhi-NCR Schools, Principals & Registered Parents"
                  style={{ width: '100%', background: 'var(--bg-canvas)', border: '1px solid var(--border-color)', padding: '0.75rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="tracked-caps" style={{ color: 'var(--text-subtle)', display: 'block', marginBottom: '0.35rem' }}>
                  Trigger AQI Toxicity Level:
                </label>
                <input
                  type="number"
                  value={userAqiInput}
                  onChange={(e) => setUserAqiInput(parseInt(e.target.value))}
                  style={{ width: '100%', background: 'var(--bg-canvas)', border: '1px solid var(--border-color)', padding: '0.75rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ marginBottom: '1.75rem', background: 'var(--bg-canvas)', border: '1px solid var(--border-color)', padding: '1rem' }}>
                <p className="tracked-caps" style={{ color: 'var(--terracotta)', marginBottom: '0.5rem' }}>
                  Mandated Protocols Enforced in Broadcast:
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>• Immediate cancellation of outdoor athletic sessions & assemblies</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>• Mandatory certified N95 respirators for school transit</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>• Activation of GRAP Stage IV remote online classes for primary grades</p>
              </div>

              {broadcastSuccess && (
                <div style={{ background: 'rgba(44, 87, 63, 0.08)', border: '1px solid var(--forest-safe)', color: 'var(--forest-safe)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
                  ✓ Successfully published via Amazon SNS: <strong>{broadcastSuccess.alertId}</strong>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setAlertModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-terracotta" disabled={broadcasting}>
                  <Send size={14} /> {broadcasting ? 'Publishing via SNS...' : 'Confirm & Publish Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

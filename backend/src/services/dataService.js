import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_DATA_PATH = path.join(__dirname, '../../data/seed-data.json');

/**
 * Load baseline data from JSON seed file
 */
export function getBaselineData() {
  const raw = fs.readFileSync(SEED_DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Compute personal exposure limit based on AQI and vulnerability profile
 * @param {number} aqi 
 * @param {string} profile - 'normal' | 'asthmatic' | 'child' | 'senior' | 'outdoor_worker'
 */
export function calculateExposureBudget(aqi, profile = 'normal') {
  let baseMinutes = 240; // baseline safe outdoor minutes at moderate AQI
  
  if (aqi <= 50) baseMinutes = 480;
  else if (aqi <= 100) baseMinutes = 360;
  else if (aqi <= 200) baseMinutes = 180;
  else if (aqi <= 300) baseMinutes = 90;
  else if (aqi <= 400) baseMinutes = 40;
  else baseMinutes = 15;

  const profileMultipliers = {
    normal: 1.0,
    asthmatic: 0.35,
    child: 0.45,
    senior: 0.40,
    outdoor_worker: 0.70
  };

  const multiplier = profileMultipliers[profile] || 1.0;
  const safeMinutes = Math.round(baseMinutes * multiplier);

  return {
    aqi,
    profile,
    recommendedOutdoorMaxMinutes: safeMinutes,
    maskRequired: aqi > 150,
    maskType: aqi > 300 ? 'N95 / FFP2 mandatory with exhalation seal' : (aqi > 150 ? 'N95 recommended' : 'Cloth mask optional'),
    airPurifierNeeded: aqi > 120,
    activityRecommendation: aqi > 300
      ? 'AVOID all strenuous outdoor exercise. Stay in filtered indoor air.'
      : (aqi > 200 ? 'Limit prolonged outdoor exertion; take frequent indoor breaks.' : 'Normal daily activities permissible.')
  };
}

/**
 * Evaluates GRAP (Graded Response Action Plan) Stage & Protocols for Schools
 * @param {number} outdoorAqi 
 * @param {boolean} hasPurifier 
 */
export function evaluateSchoolSafety(outdoorAqi, hasPurifier = false) {
  let grapStage = 'Stage I';
  let status = 'NORMAL';
  let actions = [];

  if (outdoorAqi > 450) {
    grapStage = 'Stage IV (Severe+)';
    status = 'EMERGENCY_ONLINE_ONLY';
    actions = [
      'Discontinue in-person classes for grades Pre-school to Class 9 & Class 11; conduct classes online.',
      'Mandatory N95 distribution for essential campus maintenance personnel.',
      'Total ban on all outdoor sporting activities and assemblies.',
      'Indoor air purifiers in residential/boarding wings must run at maximum continuous filtration.'
    ];
  } else if (outdoorAqi > 400) {
    grapStage = 'Stage III (Severe)';
    status = 'CRITICAL_ACTION_REQUIRED';
    actions = [
      'Suspend outdoor physical activities, sports events, and morning assemblies.',
      'Evaluate hybrid/staggered schedule for primary school children.',
      'Keep classroom doors/windows sealed during high peak particulate hours (06:00 - 10:00).',
      'Deploy HEPA purifiers in high-density junior wings.'
    ];
  } else if (outdoorAqi > 300) {
    grapStage = 'Stage II (Very Poor)';
    status = 'RESTRICTED';
    actions = [
      'Indoor physical education alternatives only.',
      'Advise all students with asthma or respiratory conditions to stay indoors or wear N95.',
      'Sanitize indoor ventilation filters.'
    ];
  } else if (outdoorAqi > 200) {
    grapStage = 'Stage I (Poor)';
    status = 'CAUTION';
    actions = [
      'Monitor students with existing respiratory conditions during sports activities.',
      'Limit high-intensity outdoor training.'
    ];
  } else {
    grapStage = 'Normal / Moderate';
    status = 'SAFE';
    actions = ['Routine campus operations. Keep natural ventilation active during clean mid-day hours.'];
  }

  // Estimated indoor AQI based on whether filtration is present
  const indoorReduction = hasPurifier ? 0.75 : 0.35; // 75% reduction with HEPA, 35% natural attenuation with closed windows
  const estimatedIndoorAqi = Math.round(outdoorAqi * (1 - indoorReduction));

  return {
    outdoorAqi,
    estimatedIndoorAqi,
    grapStage,
    status,
    actions
  };
}

/**
 * Predict stubble burn smoke drift trajectory towards Delhi-NCR
 * @param {Array} fires 
 * @param {number} windBearing 
 * @param {number} windSpeed 
 */
export function predictStubbleSmokeImpact(fires, windBearing = 315, windSpeed = 5) {
  // 315 degrees is North-West (from Punjab/Haryana directly to Delhi)
  const isDirectNWTrajectory = windBearing >= 290 && windBearing <= 340;
  
  const analyzedFires = fires.map(fire => {
    // Arrival time estimate = distance / windSpeed
    const arrivalHours = Math.round((fire.distanceToDelhiKm / (windSpeed * 3.6)) * 10) / 10;
    
    let riskLevel = 'Low';
    if (isDirectNWTrajectory) {
      if (fire.distanceToDelhiKm < 180) riskLevel = 'Critical (Arrival within 6-10h)';
      else if (fire.distanceToDelhiKm < 300) riskLevel = 'High (Arrival within 12-18h)';
      else riskLevel = 'Moderate (Arrival within 24h)';
    }

    return {
      ...fire,
      estimatedArrivalHours: arrivalHours,
      riskLevel
    };
  });

  return {
    windBearing,
    windDirection: 'NW',
    windSpeedKmh: Math.round(windSpeed * 3.6),
    isDirectNWTrajectory,
    totalActiveFiresMonitored: fires.length,
    plumeAlertLevel: isDirectNWTrajectory ? 'HIGH_ALERT_PLUME_APPROACHING' : 'MODERATE_DISPERSAL',
    analyzedFires
  };
}

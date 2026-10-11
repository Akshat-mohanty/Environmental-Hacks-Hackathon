import express from 'express';
import cors from 'cors';
import {
  getBaselineData,
  calculateExposureBudget,
  evaluateSchoolSafety,
  predictStubbleSmokeImpact
} from './services/dataService.js';
import { sendEmergencyAlert, getAlertHistory } from './services/snsService.js';
import { generateAqiForecast, generateAiActionAdvisory } from './services/aiPredictor.js';

const app = express();
app.use(cors());
app.use(express.json());

// 1. Health check & system status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'VayuRakshak Air Defense API',
    version: '1.0.0',
    awsServices: ['AWS Lambda', 'Amazon API Gateway', 'Amazon DynamoDB', 'Amazon SNS', 'Amazon EventBridge', 'SageMaker AI']
  });
});

// 2. Monitoring stations & current air metrics
app.get('/api/stations', (req, res) => {
  const data = getBaselineData();
  const avgAqi = Math.round(
    data.stations.reduce((acc, s) => acc + s.aqi, 0) / data.stations.length
  );

  res.json({
    stations: data.stations,
    averageAqi: avgAqi,
    highestRiskStation: data.stations.reduce((max, s) => s.aqi > max.aqi ? s : max, data.stations[0]),
    timestamp: new Date().toISOString()
  });
});

// 3. Personalized Exposure Budget Calculator
app.get('/api/exposure-budget', (req, res) => {
  const aqi = parseInt(req.query.aqi) || 340;
  const profile = req.query.profile || 'normal'; // 'normal' | 'asthmatic' | 'child' | 'senior' | 'outdoor_worker'

  const budget = calculateExposureBudget(aqi, profile);
  res.json(budget);
});

// 4. School Safety & GRAP Protocol Assessment
app.get('/api/schools/safety', (req, res) => {
  const data = getBaselineData();
  const schoolsWithAssessment = data.schools.map(school => {
    const assessment = evaluateSchoolSafety(school.outdoorAqi, school.airPurifiersActive);
    return {
      ...school,
      assessment
    };
  });

  res.json({
    schools: schoolsWithAssessment,
    totalSchoolsMonitored: schoolsWithAssessment.length,
    criticalSchoolsCount: schoolsWithAssessment.filter(s => s.safetyStatus === 'CRITICAL_ACTION_REQUIRED').length,
    timestamp: new Date().toISOString()
  });
});

// 5. Stubble burning hotspot tracking & plume trajectory
app.get('/api/stubble-drift', (req, res) => {
  const data = getBaselineData();
  const windBearing = parseInt(req.query.bearing) || 315;
  const windSpeed = parseFloat(req.query.speed) || 5.2;

  const analysis = predictStubbleSmokeImpact(data.stubbleFires, windBearing, windSpeed);
  res.json(analysis);
});

// 6. Alert dispatch endpoint (via Amazon SNS)
app.post('/api/alerts/broadcast', async (req, res) => {
  const { targetType, targetName, severity, aqi, message, actionChecklist } = req.body;

  try {
    const result = await sendEmergencyAlert({
      targetType,
      targetName,
      severity,
      aqi,
      message,
      actionChecklist
    });
    res.status(201).json({ success: true, alert: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Get recent alerts
app.get('/api/alerts/history', (req, res) => {
  res.json({ alerts: getAlertHistory() });
});

// 8. SageMaker AI AQI Trajectory Forecast (12h ahead)
app.get('/api/ai/forecast', (req, res) => {
  const currentAqi = parseInt(req.query.currentAqi) || 365;
  const windBearing = parseInt(req.query.bearing) || 315;
  const windSpeed = parseFloat(req.query.speed) || 4.8;
  const stubbleFireCount = parseInt(req.query.fires) || 55;

  const forecast = generateAqiForecast({
    currentAqi,
    windBearing,
    windSpeed,
    stubbleFireCount
  });
  res.json(forecast);
});

// 9. SageMaker AI School Safety Advisory Generator
app.post('/api/ai/advisory', (req, res) => {
  const { schoolName, currentAqi, predictedAqi, studentCount, hasPurifiers } = req.body;
  const advisory = generateAiActionAdvisory({
    schoolName,
    currentAqi,
    predictedAqi,
    studentCount,
    hasPurifiers
  });
  res.json(advisory);
});

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test' && !process.env.LAMBDA_TASK_ROOT) {
  app.listen(PORT, () => {
    console.log(`VayuRakshak Serverless API running on http://localhost:${PORT}`);
  });
}

export default app;

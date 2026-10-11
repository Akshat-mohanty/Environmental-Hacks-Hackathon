import app from './server.js';
import {
  getBaselineData,
  calculateExposureBudget,
  evaluateSchoolSafety,
  predictStubbleSmokeImpact
} from './services/dataService.js';
import { sendEmergencyAlert, getAlertHistory } from './services/snsService.js';
import { generateAqiForecast, generateAiActionAdvisory } from './services/aiPredictor.js';

/**
 * Standard AWS Lambda Handler for API Gateway integration
 */
export const handler = async (event) => {
  const path = event.rawPath || event.path || '/';
  const method = (event.requestContext?.http?.method || event.httpMethod || 'GET').toUpperCase();
  const queryParams = event.queryStringParameters || {};

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'OK' })
    };
  }

  try {
    if (path === '/api/health' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          service: 'VayuRakshak Air Defense API on AWS Lambda',
          awsServices: ['AWS Lambda', 'Amazon API Gateway', 'Amazon DynamoDB', 'Amazon SNS', 'Amazon EventBridge', 'SageMaker AI']
        })
      };
    }

    if (path === '/api/stations' && method === 'GET') {
      const data = getBaselineData();
      const avgAqi = Math.round(
        data.stations.reduce((acc, s) => acc + s.aqi, 0) / data.stations.length
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          stations: data.stations,
          averageAqi: avgAqi,
          highestRiskStation: data.stations.reduce((max, s) => s.aqi > max.aqi ? s : max, data.stations[0]),
          timestamp: new Date().toISOString()
        })
      };
    }

    if (path === '/api/exposure-budget' && method === 'GET') {
      const aqi = parseInt(queryParams.aqi) || 340;
      const profile = queryParams.profile || 'normal';
      const budget = calculateExposureBudget(aqi, profile);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(budget)
      };
    }

    if (path === '/api/schools/safety' && method === 'GET') {
      const data = getBaselineData();
      const schools = data.schools.map(school => ({
        ...school,
        assessment: evaluateSchoolSafety(school.outdoorAqi, school.airPurifiersActive)
      }));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          schools,
          totalSchoolsMonitored: schools.length,
          criticalSchoolsCount: schools.filter(s => s.safetyStatus === 'CRITICAL_ACTION_REQUIRED').length,
          timestamp: new Date().toISOString()
        })
      };
    }

    if (path === '/api/stubble-drift' && method === 'GET') {
      const data = getBaselineData();
      const windBearing = parseInt(queryParams.bearing) || 315;
      const windSpeed = parseFloat(queryParams.speed) || 5.2;
      const analysis = predictStubbleSmokeImpact(data.stubbleFires, windBearing, windSpeed);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(analysis)
      };
    }

    if (path === '/api/alerts/broadcast' && method === 'POST') {
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      const result = await sendEmergencyAlert(body);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, alert: result })
      };
    }

    if (path === '/api/alerts/history' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ alerts: getAlertHistory() })
      };
    }

    if (path === '/api/ai/forecast' && method === 'GET') {
      const currentAqi = parseInt(queryParams.currentAqi) || 365;
      const windBearing = parseInt(queryParams.bearing) || 315;
      const windSpeed = parseFloat(queryParams.speed) || 4.8;
      const stubbleFireCount = parseInt(queryParams.fires) || 55;

      const forecast = generateAqiForecast({
        currentAqi,
        windBearing,
        windSpeed,
        stubbleFireCount
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(forecast)
      };
    }

    if (path === '/api/ai/advisory' && method === 'POST') {
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      const advisory = generateAiActionAdvisory(body);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(advisory)
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: `Path ${path} not found` })
    };
  } catch (error) {
    console.error('Lambda invocation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

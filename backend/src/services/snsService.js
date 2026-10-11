import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

// Initialize AWS SNS Client (will use AWS credentials / IAM role when deployed on AWS)
const region = process.env.AWS_REGION || 'ap-south-1';
const snsClient = new SNSClient({ region });
const AIR_ALERT_TOPIC_ARN = process.env.AIR_ALERT_TOPIC_ARN;

// In-memory alert log for tracking dispatches (or DynamoDB backed)
const alertHistory = [];

/**
 * Dispatch an emergency bad-day alert to schools and subscribers
 * @param {Object} alertPayload 
 */
export async function sendEmergencyAlert({
  targetType = 'SCHOOL',
  targetName = 'All NCR Schools',
  severity = 'CRITICAL',
  aqi = 412,
  message = '',
  actionChecklist = []
}) {
  const alertId = `ALT-${Date.now()}`;
  const timestamp = new Date().toISOString();

  const record = {
    alertId,
    timestamp,
    targetType,
    targetName,
    severity,
    aqi,
    message,
    actionChecklist,
    channels: ['SNS_SMS', 'SNS_EMAIL', 'EMERGENCY_PUSH']
  };

  alertHistory.unshift(record);

  // If deployed to AWS with a configured SNS Topic ARN, publish to SNS
  if (AIR_ALERT_TOPIC_ARN) {
    try {
      const subject = `[AIR EMERGENCY] AQI ${aqi} Alert for ${targetName}`;
      const payloadString = `VAYURAKSHAK SAFETY ALERT:\nSeverity: ${severity}\nCurrent AQI: ${aqi}\nTarget: ${targetName}\nDirectives:\n${actionChecklist.map(a => '- ' + a).join('\n')}\n\nTime: ${timestamp}`;

      const command = new PublishCommand({
        TopicArn: AIR_ALERT_TOPIC_ARN,
        Subject: subject,
        Message: payloadString
      });

      const response = await snsClient.send(command);
      record.snsMessageId = response.MessageId;
      record.snsStatus = 'DELIVERED_VIA_AWS_SNS';
    } catch (err) {
      console.warn('AWS SNS Publish notice (running in local/mock mode without active AWS topic credentials):', err.message);
      record.snsStatus = 'DISPATCHED_SIMULATED_SNS';
    }
  } else {
    record.snsStatus = 'DISPATCHED_SIMULATED_SNS';
  }

  return record;
}

/**
 * Retrieve recent emergency alerts
 */
export function getAlertHistory() {
  return alertHistory;
}

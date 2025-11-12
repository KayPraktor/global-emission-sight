import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface WeeklyReportEmailProps {
  userName: string;
  totalEmissions: number;
  weekChange: number;
  insightsCount: number;
  anomaliesCount: number;
  insights: Array<{
    title: string;
    priority: string;
    recommendation: string;
  }>;
  anomalies: Array<{
    description: string;
    severity: string;
    recommendation: string;
  }>;
  dashboardUrl: string;
}

export const WeeklyReportEmail = ({
  userName,
  totalEmissions,
  weekChange,
  insightsCount,
  anomaliesCount,
  insights,
  anomalies,
  dashboardUrl,
}: WeeklyReportEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Weekly Carbon Emissions Report</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📊 Weekly Emissions Report</Heading>
        <Text style={text}>Hi {userName},</Text>
        <Text style={text}>
          Here's your weekly carbon emissions summary and AI-powered insights.
        </Text>

        <Section style={statsContainer}>
          <Text style={statTitle}>Total Emissions This Week</Text>
          <Text style={statValue}>{totalEmissions.toFixed(2)} tCO2e</Text>
          <Text style={statChange}>
            {weekChange > 0 ? '↑' : '↓'} {Math.abs(weekChange).toFixed(1)}% from last week
          </Text>
        </Section>

        {anomaliesCount > 0 && (
          <>
            <Hr style={hr} />
            <Heading style={h2}>⚠️ Anomalies Detected ({anomaliesCount})</Heading>
            {anomalies.slice(0, 3).map((anomaly, index) => (
              <Section key={index} style={alertBox}>
                <Text style={alertTitle}>
                  {anomaly.severity === 'critical' ? '🔴' : 
                   anomaly.severity === 'high' ? '🟠' : '🟡'} {anomaly.description}
                </Text>
                <Text style={alertText}>💡 {anomaly.recommendation}</Text>
              </Section>
            ))}
          </>
        )}

        {insightsCount > 0 && (
          <>
            <Hr style={hr} />
            <Heading style={h2}>✨ AI-Powered Insights ({insightsCount})</Heading>
            {insights.slice(0, 3).map((insight, index) => (
              <Section key={index} style={insightBox}>
                <Text style={insightTitle}>
                  {insight.priority === 'critical' ? '🔴' :
                   insight.priority === 'high' ? '🟠' : '🟢'} {insight.title}
                </Text>
                <Text style={insightText}>{insight.recommendation}</Text>
              </Section>
            ))}
          </>
        )}

        <Hr style={hr} />

        <Link href={dashboardUrl} style={button}>
          View Full Dashboard
        </Link>

        <Text style={footer}>
          This is an automated weekly report from your Carbon Emissions Tracker.
          <br />
          To manage your email preferences, visit your settings.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WeeklyReportEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
};

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
  padding: '0 40px',
};

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
};

const statsContainer = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
  textAlign: 'center' as const,
};

const statTitle = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0 0 8px',
};

const statValue = {
  color: '#0f172a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
};

const statChange = {
  color: '#64748b',
  fontSize: '14px',
  margin: '8px 0 0',
};

const alertBox = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  borderRadius: '4px',
  padding: '16px',
  margin: '12px 40px',
};

const alertTitle = {
  color: '#991b1b',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const alertText = {
  color: '#7f1d1d',
  fontSize: '13px',
  margin: '0',
  lineHeight: '20px',
};

const insightBox = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #22c55e',
  borderRadius: '4px',
  padding: '16px',
  margin: '12px 40px',
};

const insightTitle = {
  color: '#166534',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const insightText = {
  color: '#14532d',
  fontSize: '13px',
  margin: '0',
  lineHeight: '20px',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '24px 40px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const footer = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '20px',
  padding: '0 40px',
  marginTop: '32px',
};

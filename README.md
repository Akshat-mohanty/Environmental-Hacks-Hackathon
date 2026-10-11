# VayuRakshak — Air Defense & School Safety Gazette
> **Event 02: Environmental Hacks (Track 01: Air)**  
> **Bharat Builds Tour by WeMakeDevs & AWS**  
> *Created by Akshat Mohanty*

---

## 🌬️ The Problem
During peak winter and harvesting seasons across North India, the Air Quality Index (AQI) routinely breaches hazardous levels (AQI 400–500+). Stubble burning plumes transported along the North-West 315° wind vector from Punjab and Haryana combine with nocturnal temperature inversions, severely endangering children in schools, outdoor workers, and patients with chronic respiratory conditions.

Current air apps display numbers passively, but they do not:
1. Provide actionable operational mandates for schools (e.g. GRAP Stage I–IV enforcement).
2. Calculate personalized outdoor exposure time budgets for vulnerable demographics.
3. Track active satellite fire hotspots and predict plume drift trajectories hours in advance.
4. Dispatch automated emergency broadcasts on critical toxicity days.

---

## 🛡️ The Solution: VayuRakshak
**VayuRakshak** is an intelligent environmental intelligence and civic defense platform that anticipates toxic air spikes, tracks stubble burn plumes, protects indoor classroom environments, and automates emergency protocols for schools.

### Key Capabilities:
- **I. Regional Observatory Grid:** Real-time ground telemetry across Delhi-NCR monitoring nodes (Anand Vihar, Punjabi Bagh, R.K. Puram, ITO, Dwarka) tracking AQI, PM2.5, PM10, humidity, and wind vectors.
- **II. School Safety Gazette (GRAP):** Automated Graded Response Action Plan (GRAP Stages I to IV) enforcement for school campuses, tracking classroom indoor vs. outdoor AQI, filtration status, and generating AI-synthesized operational briefs.
- **III. Stubble Plume Radar:** Satellite thermal fire clusters (VIIRS/MODIS) with Fire Radiative Power (FRP), distance vectors, and arrival time estimates along the 315° NW corridor.
- **IV. Personal Pollution Exposure Budget:** Clinical inhalation threshold calculator with customized exposure minute allowances for asthmatics, children, seniors, and outdoor laborers.
- **V. SageMaker 12-Hour AI Forecast:** Multi-variable DeepAR trajectory forecasting taking into account nocturnal boundary layer trapping and downwind agricultural smoke lag.
- **VI. Amazon SNS Emergency Alerts:** 1-click civic alert dispatching across SMS, email, and emergency channels.

---

## ☁️ Built on AWS ("SHIP IT" Architecture)

| Component | AWS Service | Role in Architecture |
| :--- | :--- | :--- |
| **Serverless API** | **AWS Lambda** | Microservices handling station telemetry, school safety evaluations, and exposure calculations. |
| **API Management** | **Amazon API Gateway** | Managed HTTP API routing and CORS handling. |
| **Predictive AI** | **Amazon SageMaker AI** | 12-hour atmospheric dispersion forecasting and tailored mitigation advisory generation. |
| **Emergency Alerts** | **Amazon SNS** | Multichannel notification topics for bad-day safety warnings. |
| **Scheduled Tasks** | **Amazon EventBridge** | Automated cron rule checking station AQI spikes every 15 minutes. |
| **Data Storage** | **Amazon DynamoDB** | Scalable NoSQL storage for station records, school profiles, and incident logs. |
| **Hosting** | **AWS Amplify / S3 + CloudFront** | High-performance public hosting with SSL/HTTPS. |

---

## 🛠️ Project Structure

```
├── backend/
│   ├── data/
│   │   └── seed-data.json          # Real-world stations, fire clusters & school profiles
│   ├── src/
│   │   ├── services/
│   │   │   ├── dataService.js      # Air domain logic & GRAP matrix
│   │   │   ├── aiPredictor.js      # SageMaker DeepAR dispersion & advisory engine
│   │   │   └── snsService.js       # AWS SNS integration & alert history
│   │   ├── server.js               # Express REST server (for local development)
│   │   └── lambda.js               # AWS Lambda handler for API Gateway
│   ├── template.yaml               # AWS SAM / CloudFormation Infrastructure-as-Code
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── AtmosphericArt.jsx  # Bespoke architectural location plaques & vector art
│   │   ├── App.jsx                 # Main application dashboard
│   │   └── index.css               # Editorial design system (Cormorant Garamond & Jost)
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 🚀 Running Locally

### 1. Backend Server
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:4000
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 📜 Hackathon Compliance
- **Track:** 01 — Air
- **Built for:** Bharat Builds Tour: Environmental Hacks
- **Rules Met:** Public GitHub repository, real AWS service architecture, and live web deployment.
- **License:** MIT

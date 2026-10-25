# CascadeGuard

AI-powered monitoring and incident intelligence platform for detecting, analyzing, and simulating cascading failures across distributed systems.

## Overview

CascadeGuard helps identify how failures propagate through interconnected services and provides actionable analysis of the resulting incident.

It combines simulation, risk analysis, root-cause analysis, blast-radius estimation, recovery strategies, and AI-assisted incident intelligence in a unified dashboard.

## Core Capabilities

- Cascading failure simulation
- Risk and severity analysis
- Root-cause identification
- Blast-radius analysis
- What-if failure simulation
- Recovery strategy recommendations
- Incident investigation and reporting
- Interactive monitoring dashboard
- AI-assisted incident analysis

## Architecture

```text
Service Events
      ↓
Telemetry / Simulation Engine
      ↓
Incident Detection
      ↓
Risk Analysis
      ↓
Root Cause + Blast Radius
      ↓
Recovery Strategies
      ↓
Dashboard + AI Analysis
```

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Node.js
- Gemini API
- Bun / npm

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PrathameshMahalle07/CascadeGuard.git
cd CascadeGuard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit your actual API key to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown in your terminal.

## Project Structure

```text
CascadeGuard/
├── public/
├── src/
│   ├── engine/
│   ├── components/
│   └── ...
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

## What Makes CascadeGuard Different

Traditional monitoring tools often show isolated metrics and alerts.

CascadeGuard focuses on understanding **failure propagation**:

```text
Database degradation
        ↓
Service latency increases
        ↓
API failures increase
        ↓
Dependent services become unstable
        ↓
Incident expands
```

The platform analyzes these relationships to help engineers understand not only **what failed**, but also **how the failure propagated and what could happen next**.

## Status

CascadeGuard is an actively developed project and currently focuses on simulation-driven distributed-system monitoring, incident analysis, and AI-assisted investigation.

## Author

**Prathamesh Mahalle**

AI & Data Science

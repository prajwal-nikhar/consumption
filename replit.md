# Consumption Insights Explorer

Campus energy management system with automated Excel ingestion, animated trend analysis, and AI-driven anomaly detection.

## Architecture
- **Backend**: Node.js/Express with PostgreSQL (Drizzle ORM)
- **Frontend**: React/Vite with Tailwind CSS & Shadcn UI
- **Visualization**: Recharts for animated telemetry
- **Data Ingestion**: XLSX processing with comma-stripping and date correction

## Key Features
- **Command Center**: Real-time stats and monthly load profiles.
- **Consumption Intelligence**: Year-over-year and seasonal variance analysis.
- **Anomaly Detection**: Automated identifying of consumption spikes >10,000 kWh.
- **Efficiency Reports**: AI-generated recommendations for energy reduction.

## Setup
1. `cd Consumption-Insights-Explorer`
2. `npm install`
3. `npm run db:push`
4. `npm run dev`

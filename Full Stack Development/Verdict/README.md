# Verdict Engine: Enterprise Review Analysis and Scoring Pipeline

Verdict Engine is a distributed, high-throughput intelligence platform designed to scrape, aggregate, classify, and score consumer reviews. By combining deterministic mathematical models with semantic LLM extraction, it transforms raw, unstructured web reviews into structured, audited sentiment insights. The project is modularly structured, separating data collection, LLM processing, database caching, and client injected interfaces.

---

## System Architecture and Modules

### 1. Data Ingestion & Harvesting Module (The Scraper)
* Automated review scrapers designed to parse dynamic, JS-rendered e-commerce pages.
* Anti-blocking navigation logic, IP rotation hooks, and pagination handlers.
* Streamlines unstructured HTML parsing into normalized payload definitions.

### 2. Broker & Communication Module (The Extension Port)
* Handles real-time messaging pipelines between the front-end browser environment, background service workers, and backend services.
* Enforces secure CORS controls, event brokerage, and message queuing to prevent data loss during high-volume spikes.

### 3. Intelligence & Extraction Pipeline (The LLM Service)
* Integrates LLM prompting (Gemini/GPT models) to perform semantic analysis on scraped reviews.
* Extracts structured JSON containing granular sentiment flags, product flaw tags, and reliability indicators.
* Utilizes a dual-pass classification structure (R^0D review classification) to filter out bot-generated or spam reviews.

### 4. Quantitative Analysis & Scoring Module (The Math Engine)
* Computes deterministic confidence ratings and weighted review scores.
* Blends raw star counts with semantic weightings (e.g., verified purchase bias, reviewer history, and detail density) to prevent ratings manipulation.
* Normalizes scores into a unified product health rating scale.

### 5. Persistence & Cache Hub (The Database)
* High-performance cache layer utilizing MongoDB to store raw review feeds and compiled sentiment reports.
* Ensures minimal latency for injected client widgets by responding from local cached indices.
* Designed with automated record expiration (TTL indices) to guarantee data freshness.

### 6. Presentation & Interface Module (The Injected UI)
* Client-side Chrome extension/injected script that overlays scoring widgets directly onto product pages.
* Native visual integration (CSS scoping) preventing target site style pollution.
* Responsive layouts containing detailed breakdown graphs and summarized pros/cons list.

---

## Getting Started

### Prerequisites
* Node.js (v18 or higher)
* MongoDB connection string (local or Atlas cluster)
* Google Cloud Platform API Key / OpenAI API Key for the LLM Service

### Local Setup

1. **Clone and Navigate**:
   ```bash
   cd "Full Stack Development/Verdict"
   ```

2. **Configure Database**:
   Navigate to the Database module, install dependencies, and set up your connection environment variables:
   ```bash
   cd "Persistence & Cache Hub (The Database)"
   npm install
   ```

3. **Initialize the LLM Orchestrator**:
   Navigate to the LLM module to configure the AI pipelines:
   ```bash
   cd "../../Intelligence & Extraction Pipeline (The LLM Service)"
   npm install
   ```

4. **Load the Injected Extension UI**:
   * Open Google Chrome and navigate to `chrome://extensions/`.
   * Enable **Developer mode** in the top right.
   * Click **Load unpacked** and select the `Presentation & Interface Module (The Injected UI)` directory.

---

## Technical Specifications and Documentation

Detailed specifications and runbooks are available in the following documents:
* **Product Specifications**: Refer to the [Complete SRS document](./Complete%20SRS%20document.pdf) for software requirements and system diagrams.
* **Architecture Diagrams**: Refer to the [Tech stack.pdf](./Tech%2520stack.pdf) and module volume documents.
* **Disaster Recovery**: Details on failovers and zero-cost scaling can be found in the [Disaster Recovery Runbook](./🚨DISASTER%2520RECOVERY%2520(DR)%2520RUNBOOK.pdf).

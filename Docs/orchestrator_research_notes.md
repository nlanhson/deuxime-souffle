# OSMOSE Orchestrator Research Notes

This document logs our exploration and understanding of the OSMOSE Orchestrator backend, its role in the system, and its interaction with the frontend control panel website.

---

## 📌 Executive Summary of Tackled Points

* **Identified the Orchestrator**: Clarified that it is a **backend software computation engine** developed by Osmose Space, not a human operator or a third party.
* **Defined Scope Division**: Confirmed that you are building the **frontend/UI (control panel)** for the Operator, while the Orchestrator itself is maintained/run on the backend by the client.
* **Mapped the Interaction Flow**: Outlined how the Operator uses your frontend web app to upload configurations, toggle entities on/off, launch the Orchestrator, track its real-time state, and view the outputs.
* **Clarified Flight Paths vs. Pointing**: Corrected the misconception about flight paths (which are fixed physical orbits) and explained that the Orchestrator instead dynamically schedules active **antenna pointings**, **RF link connections**, and **cell capacity routing** over time.
* **Explained Configuration Parameters**: Explained what can actually be customized in the configuration (antenna specs, link frequencies, attitude rules).
* **Explained Launch Settings**: Simplified the meaning of "Duration" (how far ahead the Orchestrator plans) and "Periodicity" (the step resolution of schedules).
* **Defined Result Files (Artifacts)**: Revealed that the downloaded job result files are actually command scripts used in the real world to instruct physical satellites and ground dishes when and where to transmit data.
* **Catalogued All 6 Entities**: Identified every entity the Operator interacts with — Constellations, Satellites, Cells, Zones, Sites, and Antennas — and mapped their hierarchy.
* **Clarified Entity Interaction Model**: The Console (globe) is view-only via side panels. Editing only happens in the Configurator screen via a structured table parsed from the imported JSON — no manual JSON text editing required. Later, globe panels will gain inline edit forms.
* **Clarified JSON Editing & Globe Context**: On/off toggles are done in the UI table (no text editor). For deeper parameter changes, the Operator must currently export → edit externally → re-import (until inline forms are added). The globe is a single component that shows different data depending on the active screen (Console = live state, Configurator = imported config for validation).

---

## 1. What is the Orchestrator?

* **Definition**: The **Orchestrator** is a backend computer software engine (exposed via the *Nexus Backend API*) developed by the client, **Osmose Space**.
* **Role**: It performs **orchestration computations (scheduling)**. It decides how satellites, antennas, RF links, and ground cells interact over time to optimize network connectivity.
* **Is it a Human?** No. The human in the loop is the **Operator**, who uses the frontend dashboard to monitor the network and trigger backend scheduling runs.
* **Is it a Third Party?** No. It is a core part of the **Osmose Space** software ecosystem.

---

## 2. Project Scope Division

| Component | Responsibility | Scope Details |
| :--- | :--- | :--- |
| **Frontend UI (OSMOSE SPACE)** | **Digital Unicorn** (Us) | Design system, 3D Cesium globe visualization, configuration toggles, status tracking, time scrubbing, and results download. |
| **Backend (Orchestrator)** | **Osmose Space** (Client) | Orbit predictions, scheduling algorithms, database (SQL), message broker (NATS), and API endpoints. |

---

## 3. Data Flow & Operator Control

The Operator controls and communicates with the Orchestrator through the control panel via this lifecycle:

1. **Import Configuration**: The Operator imports a system configuration in JSON format.
2. **Visual Validation**: The configuration elements are displayed on the 3D globe for validation.
3. **Make Adjustments (Phase 1 / MVP)**: 
   * The Operator can toggle specific entities (satellites, ground stations, cells, antennas) **on/off**.
   * *Note: Creating, editing, or deleting parameters is out of scope for Phase 1 (reserved for Phase 2/3).*
4. **Launch Scheduling**: The Operator sets run parameters (duration, periodicity, auto-launch) and triggers the Orchestrator launch.
5. **View Results**: The Operator reviews real-time execution status (`running`, `done`, `error`) and downloads computed scheduling results (artifacts).

---

## 4. What the Orchestrator Adjusts vs. What remains Fixed

* **Fixed Inputs (Satellite Orbits / Flight Paths)**: The Orchestrator does **not** alter the actual flight trajectories of the satellites. The orbital paths are fixed physics inputs (defined by ephemeris/TLE data).
* **Adjusted / Scheduled Outputs**: The Orchestrator dynamically plans:
  * **Antenna Pointing**: Where and when the steerable antennas on satellites or gateways point.
  * **RF Link Routing**: When communication links are active between satellites, user cells, and gateways.
  * **Capacity Routing**: How ground cells are served over time to match capacity demand.

---

## 5. Deeper Concepts Clarified

### A. What are the "Parameters" the Operator adjusts?
In a full working system, the Operator can configure settings inside the JSON file such as:
* **Antenna Specifications**: Dish sizes, minimum elevation angles (how low to the horizon they can steer), and radio frequencies/bandwidths.
* **Attitude Configuration**: Constraints on how fast satellites can rotate in space, and coordinates of targets they should align with.
* **Status Toggles**: Toggling off a satellite or antenna if it is undergoing maintenance, instructing the solver to ignore it.

### B. What are the Launch Run Parameters?
When the Operator uploads the configuration and prepares to launch the Orchestrator, they specify two timeline constraints:
* **Duration**: How far into the future to calculate the plan (e.g., *"Schedule the next 24 hours"*).
* **Periodicity**: How tasks should be segmented (e.g., *"Create schedules in 10-minute intervals"*) or how often the run should repeat.

### C. The Visual Simulator (The Core UI Feature)
After the Orchestrator computes the schedule, the web control panel acts as a **visual simulator**. By scrubbing the timeline at the bottom, the Operator can watch:
* Satellites orbiting in real-time.
* Antennas pivoting to track targets.
* Radio lines (RF links) dynamically lighting up when connections are established.

### D. The Purpose of the Result File (Artifacts)
The output of the Orchestrator is a downloadable `.zip` file of calculated schedules and command tables.
* **Actionable Commands**: These files are **not** just reports; they contain the actual command scripts.
* **Real-world execution**: The Operator downloads this file and uploads it to the physical satellite control stations. These commands are beamed to the real satellites in orbit and sent to real ground dishes, telling them exactly when to rotate, steer, and open communications in the real world.

---

## 6. Complete Entity Catalog

The system has **6 core entities** the Operator can interact with:

| # | Entity | What it is | What the Operator can do |
|---|--------|------------|-------------------------|
| 1 | **Constellation** | A named fleet/group of satellites (e.g., "LEO Fleet A"). Acts as a folder for satellites. | Toggle on/off. Later: add/edit/delete, configure orbital models (Kepler, TLE, GEO). |
| 2 | **Satellite** | An individual satellite in orbit. Belongs to a constellation. Has orbit data, antenna specs, attitude rules, and link budgets. | Toggle on/off. Later: edit all parameters — antenna specs, frequencies, attitude constraints. |
| 3 | **Cell** | A hexagonal ground coverage area representing end-user demand. Has demanded/served capacity. Served by satellites and gateways (changes over time). | Toggle on/off. Later: import new cells, edit capacity, redraw polygon shapes. |
| 4 | **Zone** | A large geographic region displayed as a colored polygon on the globe. Contains multiple Sites. | Toggle on/off. Later: edit zone boundaries (polygon editing). |
| 5 | **Site** | A physical ground location (lat/long) where gateways are installed. Think "ground station campus." | Toggle on/off. Later: edit coordinates, add/remove sites. |
| 6 | **Antenna** | The physical radio hardware at a gateway or on a satellite. Two types: **Parabolic** (classic dish) and **Active Gaussian** (electronically steered beam). | Toggle on/off. Later: edit dish diameter, elevation angle, frequencies, bandwidth. |

> **Note on Gateways**: Gateways are the ground-side radio equipment at a Site. They appear as sub-entities of Sites (each Site has N gateways, each gateway has antennas). The Operator navigates to them via drill-down: Zone → Site → Gateway.

### Entity Hierarchy

```
Constellation
 └── Satellite (has antenna specs, attitude config, link budgets)
       └── RF Links (dynamic, time-dependent connections)

Zone
 └── Site (lat/long coordinates)
       └── Gateway (ground radio equipment)
             └── Antenna (parabolic or active Gaussian)

Cell (hexagonal ground coverage area, served by satellites + gateways)
```

---

## 7. Entity Interaction — View vs. Edit (UI Design Detail)

### A. Console (Globe View) — View Only
The Operator clicks entities on the 3D globe. A **read-only side panel** slides open:

| Entity | Panel shows |
|--------|------------|
| **Satellite** | Status (active/waiting/inactive), position, frequencies, active links, battery %, antenna pointing |
| **Cell** | Demanded capacity, served capacity, covering equipment (satellites/gateways — changes over time) |
| **Ground Station** | Status, specifications, weather conditions |
| **Zone** | Number of sites, usage %, capacity (fields partially TBD) |
| **Site** | Coordinates, number of gateways, scrollable gateway list with RF link counts |
| **Gateway** | RF link status |

> **No editing is possible** from the Console panels.

### B. Configurator Screen — The Only Place to Edit
This is a separate screen with its own workflow:
1. **Import**: Drag-and-drop or file-pick a `.json` config file.
2. **Structured Table**: The app parses the JSON and displays entities in a table (`Entity | Type | Value | Active`).
3. **Toggle On/Off**: The Operator flips the Active switch per row — this is the only edit available initially.
4. **Visual Validation**: Clicking a table row highlights that entity on the globe; a validity indicator confirms the config is OK.
5. **Export**: The modified config can be exported back as `.json`.

> The Operator does **not** need to manually edit JSON in a text editor. The UI presents it as a table.

### C. Future: Inline Edit Forms
Later, the read-only info panels on the globe will gain an **"Edit" button** that transforms them into editable forms — allowing the Operator to add, delete, and modify entity parameters directly from the UI without needing JSON at all.

---

## 8. JSON Editing Workflow & Globe Context

### A. How the Operator Edits the JSON Config
Two paths depending on the type of change:

**Simple toggles (on/off)** — done entirely in the UI:
```
Import .json → Configurator table → Flip Active switches → Export .json
```

**Parameter value changes** (e.g., antenna diameter, frequencies) — requires external editing for now:
```
Export .json → Edit in text editor on their computer → Re-import the modified file
```
> This gap will be closed when inline edit forms are added to the UI.

### B. The Globe Is One Component, Not Two Views
The full operational flow:
```
1. Console Globe → Operator monitors current state
2. Configurator  → Import new/modified config → See it on the globe → Validate
3. Launch        → Trigger the Orchestrator with that config
4. Console Globe → Now shows the new scheduled results
```

---

## 9. Detailed Entity Properties & Data Specs

To ensure a high-fidelity user interface that matches the backend OpenAPI definitions and the prototype, the following fields are mapped to each of the 6 entities. They are divided into **Static Configuration Parameters** (sourced from the JSON config) and **Dynamic/Telemetry Parameters** (scrubbed over time via the timeline).

### 🛰️ 1. Constellation
A constellation acts as a parent folder/grouping for a fleet of satellites sharing an orbital scheme.

*   **Static Configuration (JSON)**:
    *   **Constellation Name**: Text ID (e.g., `"LEO Fleet A"`).
    *   **Orbit Regime**: Enum type (`"leo"`, `"meo"`, `"geo"`, `"other"`).
    *   **Propagation Model Config**:
        *   *Keplerian Plane Parameters*: Inclination, semi-major axis/altitude, eccentricity, RAAN, argument of perigee, and initial true anomaly.
        *   *TLE File*: Raw Two-Line Element content string (Phase 3).
        *   *GEO Parameter*: Longitude position (e.g., `19.2° E`).
*   **Dynamic / Telemetry Metrics**:
    *   **Satellite Fleet Status**: Total count of satellites in the constellation vs. active/waiting/inactive counts.
    *   **Frequency Allocation**: Aggregated frequency band coverage currently active.
*   **UI Presentation**:
    *   Appears in the Configurator as a collapsible group in the entity table.
    *   Displayed on the Globe as a layer toggle to turn the entire orbital path group on/off.

---

### 🛰️ 2. Satellite
An individual orbiting vehicle. Sourced from the constellation data, it contains detailed radio hardware and attitude rules.

*   **Static Configuration (JSON)**:
    *   **Satellite ID & Name**: Unique identifier (e.g., `"SAT-0142"`).
    *   **Constellation Owner**: Name of the parent constellation.
    *   **Orbital Plane ID**: ID of the orbital plane it belongs to.
    *   **Radio Hardware Specs**:
        *   `n-block`: Number of communication blocks.
        *   `n-user-antenna-per-block`: Number of steerable user antennas.
        *   *Link Budgets*: Center frequency (MHz), bandwidth (MHz), and number of polarizations for:
            *   `config-gw2sat` (Gateway to Satellite)
            *   `config-sat2gw` (Satellite to Gateway)
            *   `config-sat2user` (Satellite to User Cell)
            *   `config-user2sat` (User Cell to Satellite)
    *   *Attitude Configuration*: Pointing mode constraints (e.g., Nadir-locked or manual targets) and maximum angular rotation speed (deg/s).
*   **Dynamic / Telemetry (Timeline-Scrubbed)**:
    *   **Operational Status**: Badge displaying `active` (green), `waiting` (amber), or `inactive` (grey).
    *   **Coordinates (Position)**:
        *   *LLA Coordinates*: Latitude (deg), Longitude (deg), Altitude (meters).
        *   *ECEF Coordinates*: Cartesian X, Y, Z coordinates (meters).
    *   **Velocity Vector**: ECEF Cartesian speed components ($V_x, V_y, V_z$) in meters per second.
    *   **Attitude Orientation**: Real-time Pitch, Roll, and Yaw angles (degrees).
    *   **Battery Charge %**: Telemetry metric (e.g., `87%`).
    *   **Antenna Pointing State**: Real-time steering direction (e.g., `"Nadir"`, `"Manual +12.4°"`).
    *   **Active RF Links**: Summary count of active channels (e.g., `"3 active: 2 Gateway / 1 User"`).
*   **UI Presentation**:
    *   **Hover Panel**: Quick-read popover showing ID, Status, Position, Frequencies, and Battery.
    *   **Click Sidebar**: Full detailed panel listing exact coordinates, live attitude angles, and active connection endpoints.

---

### ⬢ 3. Cell
A static hexagonal ground coverage region defining traffic demands from end users.

*   **Static Configuration (JSON)**:
    *   **Cell ID**: Unique text key (e.g., `"C-09"`).
    *   **Center Coordinates**: Latitude and longitude of the hexagon center.
    *   **Traffic Priority**: QoS tier or priority weight.
*   **Dynamic / Telemetry (Timeline-Scrubbed)**:
    *   **Demanded Capacity**: Traffic bandwidth requested by users at this time step (e.g., `1.5 Gbps`).
    *   **Served Capacity**: Bandwidth successfully allocated by the scheduler (e.g., `1.2 Gbps`).
    *   **Satisfaction Rate**: Percentage calculation ($\text{Served} / \text{Demanded}$), e.g., `80%`.
    *   **Active Covering Equipment**: List of active satellites and ground gateways currently routing links to the cell (e.g., `"SAT-0142, GW-3"`).
*   **UI Presentation**:
    *   Displayed as a hexagonal overlay on the globe.
    *   **Heatmap styling**: Hexagons are color-coded based on utilization/demanded traffic or satisfaction rates.
    *   Clicking a cell displays its demand vs. served traffic metrics on the sidebar.

---

### 🗺️ 4. Zone
A large geographic polygon enclosing multiple Ground Sites. Used for regional traffic planning.

*   **Static Configuration (JSON)**:
    *   **Zone ID & Name**: e.g., `"West Europe"`.
    *   **Boundary Polygon**: Array of LLA coordinates defining the region outline.
*   **Dynamic / Telemetry (Timeline-Scrubbed)**:
    *   **Active Sites Count**: Number of ground station campuses currently operating in the zone.
    *   **Utilization Rate**: Percentage of overall zone capacity being used (e.g., `73%`).
    *   **Zone Demanded vs. Served Capacity**: Aggregate metrics summed from all cells within the zone's polygon.
*   **UI Presentation**:
    *   Displayed as semi-transparent colored boundary shapes on the globe.
    *   Zone panel summarizes sites, gateways, and utilization.

---

### 📍 5. Site
A physical ground campus (coordinates) containing radio gateway hardware.

*   **Static Configuration (JSON)**:
    *   **Site ID & Name**: Unique text key (e.g., `"Paris-North"`).
    *   **Location Coordinates**: Precise Latitude, Longitude, and Altitude.
*   **Dynamic / Telemetry (Timeline-Scrubbed)**:
    *   **Gateway Count**: Total gateway count installed at the site campus.
    *   **Gateway Roster list**: Card list for each gateway, showing ID (e.g., `"GW-3"`) and its current active RF links (e.g., `"2 active"`).
    *   **Local Weather Conditions**: Sourced from telemetry (e.g., `"Clear / Wind 12 km/h"`) since rain and wind affect RF propagation.
*   **UI Presentation**:
    *   Represented as marker points (amber) on the globe.
    *   Clicking opens the Site Panel, containing the scrollable list of nested gateways.

---

### 📡 6. Antenna
The physical radio hardware mounted on either a Satellite or a ground Gateway.

*   **Static Configuration (JSON)**:
    *   **Antenna ID**: Unique identifier.
    *   **Parent Entity ID**: ID of the hosting Gateway or Satellite.
    *   **Antenna Type Spec**:
        *   *Parabolic Spec*: Diameter (meters), efficiency %, and noise temperature (Kelvin).
        *   *Active Gaussian Spec*: Bandwidth (degrees), gain at Nadir (dB), $G/T$ ratio (dB/K), and scan loss factor (dB).
    *   **Minimum Elevation Angle (MEA)**: Angle threshold (degrees) below which links cannot be established.
    *   **Pointing Error Profile**: Expected pointing offset (dB).
    *   **Max Angular Speed**: For tracking antennas, limits rotation speed (deg/s).
*   **Dynamic / Telemetry (Timeline-Scrubbed)**:
    *   **Current Pointing Angles**: The azimuth and elevation tracking angles at the selected instant.
    *   **Link Status**: Connection speed, frequency used, and signal strength.
*   **UI Presentation**:
    *   In Phase 1, antennas are detailed under their parent panels (Site dropdown or Satellite list).
    *   In Phase 2, they gain individual detail cards and forms.

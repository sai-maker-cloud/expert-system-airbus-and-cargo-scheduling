# AirlineOS — AI-Based Expert System
### Airline Scheduling & Cargo Management

---

## FOLDER STRUCTURE

```
airline-system/
├── backend/                          # Spring Boot application
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/airline/
│       │   ├── AirlineSystemApplication.java
│       │   ├── agent/
│       │   │   └── AgentService.java          # AI Agent logic
│       │   ├── config/
│       │   │   └── CorsConfig.java
│       │   ├── controller/
│       │   │   ├── AircraftController.java
│       │   │   ├── AgentController.java
│       │   │   ├── CargoController.java
│       │   │   ├── CrewController.java
│       │   │   ├── FlightController.java
│       │   │   └── SystemRuleController.java
│       │   ├── dto/
│       │   │   ├── AgentDto.java
│       │   │   ├── AircraftDto.java
│       │   │   ├── ApiResponse.java
│       │   │   ├── CargoDto.java
│       │   │   ├── CrewDto.java
│       │   │   └── FlightDto.java
│       │   ├── exception/
│       │   │   ├── BusinessRuleException.java
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   └── ResourceNotFoundException.java
│       │   ├── model/
│       │   │   ├── Aircraft.java
│       │   │   ├── Cargo.java
│       │   │   ├── CrewMember.java
│       │   │   ├── Flight.java
│       │   │   └── SystemRule.java
│       │   ├── repository/
│       │   │   ├── AircraftRepository.java
│       │   │   ├── CargoRepository.java
│       │   │   ├── CrewMemberRepository.java
│       │   │   ├── FlightRepository.java
│       │   │   └── SystemRuleRepository.java
│       │   ├── rules/
│       │   │   └── RuleEngine.java            # Core rule evaluation
│       │   └── service/
│       │       ├── AircraftService.java
│       │       ├── CargoService.java
│       │       ├── CrewService.java
│       │       ├── FlightService.java
│       │       └── SystemRuleService.java
│       └── resources/
│           └── application.properties
│
├── frontend/                         # React application
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       │   └── layout/
│       │       └── Layout.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Flights.jsx
│       │   ├── Aircraft.jsx
│       │   ├── Crew.jsx
│       │   ├── Cargo.jsx
│       │   ├── AgentPanel.jsx
│       │   └── RuleEditor.jsx
│       ├── styles/
│       │   └── global.css
│       └── utils/
│           └── api.js
│
└── docs/
    ├── schema.sql
    └── README.md
```

---

## SETUP STEPS

### 1. Database Setup
```sql
-- Create DB and run schema
mysql -u root -p < docs/schema.sql
```

### 2. Backend Setup
```bash
cd backend

# Edit credentials in src/main/resources/application.properties:
#   spring.datasource.username=root
#   spring.datasource.password=YOUR_PASSWORD

mvn clean install
mvn spring-boot:run
# Backend starts at http://localhost:8080
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend starts at http://localhost:3000
```

---

## COMPLETE API REFERENCE

### Aircraft
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/aircraft | Get all aircraft |
| GET | /api/aircraft/{id} | Get aircraft by ID |
| GET | /api/aircraft/available | Get available aircraft |
| POST | /api/aircraft | Create aircraft |
| PUT | /api/aircraft/{id} | Update aircraft |
| PATCH | /api/aircraft/{id}/status?status=X | Update status |
| DELETE | /api/aircraft/{id} | Delete aircraft |

### Flights
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/flights | Get all flights |
| GET | /api/flights/{id} | Get flight by ID |
| POST | /api/flights | Create flight |
| PUT | /api/flights/{id} | Update flight |
| POST | /api/flights/{fId}/assign-aircraft/{aId} | Assign aircraft |
| POST | /api/flights/{fId}/assign-crew/{cId} | Assign crew member |
| DELETE | /api/flights/{fId}/remove-crew/{cId} | Remove crew member |
| PATCH | /api/flights/{id}/status?status=X | Update flight status |
| DELETE | /api/flights/{id} | Delete flight |

### Crew
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/crew | Get all crew |
| GET | /api/crew/{id} | Get crew by ID |
| GET | /api/crew/available | Get available crew |
| GET | /api/crew/role/{role} | Get crew by role |
| POST | /api/crew | Create crew member |
| PUT | /api/crew/{id} | Update crew member |
| PATCH | /api/crew/{id}/status?status=X | Update status |
| DELETE | /api/crew/{id} | Delete crew member |

### Cargo
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cargo | Get all cargo |
| GET | /api/cargo/{id} | Get cargo by ID |
| GET | /api/cargo/pending | Get pending cargo by priority |
| POST | /api/cargo | Create cargo |
| PUT | /api/cargo/{id} | Update cargo |
| POST | /api/cargo/{cId}/assign/{fId} | Assign cargo to flight |
| DELETE | /api/cargo/{cId}/unassign | Unassign cargo from flight |
| DELETE | /api/cargo/{id} | Delete cargo |

### AI Agent
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/agent/suggest-aircraft/{flightId} | Suggest best aircraft for flight |
| GET | /api/agent/suggest-crew/{flightId} | Suggest optimal crew per role |
| POST | /api/agent/optimize-cargo | Auto-assign all pending cargo |
| GET | /api/agent/detect-conflicts | Detect all system conflicts |
| GET | /api/agent/predict-delays | Predict delay risk per flight |

### System Rules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/rules | Get all rules |
| GET | /api/rules/{id} | Get rule by ID |
| POST | /api/rules | Create rule |
| PUT | /api/rules/{id} | Update rule |
| PATCH | /api/rules/{id}/toggle | Toggle rule active/inactive |
| DELETE | /api/rules/{id} | Delete rule |

---

## AI AGENT — SCORING LOGIC

### Aircraft Scoring (out of ~100)
- AVAILABLE status: +40 pts
- MAINTENANCE status: disqualified (-100)
- Fuel efficiency: +3 pts per km/L
- Days to next maintenance > 30: +20 pts
- Days to next maintenance > 7: +10 pts
- Within maintenance buffer: -30 pts
- Distance/capacity match: +5–15 pts

### Crew Scoring (out of ~100)
- Base score: +50 pts
- Hours flown today: -5 pts per hour
- Matches flight origin: +20 pts
- License expiry > 180 days: +15 pts
- License expiry > 30 days: +5 pts
- License expires < 30 days: -20 pts
- Experience bonus: up to +10 pts (total hours/1000)

### Cargo Priority Scoring
- CRITICAL: 4
- HIGH: 3
- MEDIUM: 2
- LOW: 1
Cargo is sorted by priority score DESC, then by creation time ASC (FIFO within same priority). Capacity validation enforces max 90% weight load (configurable via rules).

---

## CONSTRAINTS ENFORCED

| Rule | Default | Configurable |
|------|---------|--------------|
| Max crew duty hours/day | 8h | Yes |
| Min pilot rest hours | 10h | Yes |
| Max cargo weight % of capacity | 90% | Yes |
| High priority cargo placement window | 4 hours | Yes |
| Maintenance buffer warning | 3 days | Yes |
| Min crew size per flight | 4 | Yes |

All constraints are stored in the `system_rules` table and loaded dynamically by the Rule Engine at runtime.

---

## TECH STACK

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2 |
| ORM | Spring Data JPA / Hibernate |
| Database | MySQL 8.x |
| Frontend | React 18, Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Styling | Custom CSS Variables |

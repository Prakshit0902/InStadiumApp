# InStadium

InStadium is a cross-platform stadium discovery and fan-engagement platform built around three experiences:

- Mobile-first exploration of stadiums, sports, players, and upcoming matches
- Assisted discovery using search, geolocation, and QR-based deep links
- Content and operations support through backend APIs for inquiries, events, media, and client workflows

This README is intentionally architecture-first and flow-first. It gives a complete high-level view now, while leaving dedicated placeholders for deep technical specs you can add later.

## 1) Product Vision (High Level)

### What the platform does

- Helps fans find stadiums quickly based on sport, city, and proximity
- Offers rich stadium detail pages with galleries, timelines, match windows, and nearby context
- Enables instant stadium access via QR scans and deep links
- Supports communication loops through inquiries, press/media, and event operations
- Provides authentication-aware experiences for protected capabilities

### Who uses InStadium

- Sports fans and visitors
- Team/media operations
- Event and inquiry administrators
- Partner/client users through portal-facing endpoints

## 2) System Context Diagram

```mermaid
flowchart TB
      fan[Fan / Visitor]
      admin[Admin / Ops User]
      media[Press / Media]
      mobile[InStadium Mobile App\nExpo + React Native]
      backend[InStadium Backend API\nExpress + TypeScript]
      db[(Neon Postgres)]
      auth[Clerk Auth]
      maps[Location Services]
      qr[QR Generation / Scan Flows]
      ai[AI Chat Services]

      fan --> mobile
      admin --> mobile
      media --> mobile

      mobile --> backend
      mobile --> auth
      mobile --> maps
      mobile --> qr

      backend --> db
      backend --> auth
      backend --> ai
      backend --> qr
```

## 3) Container Architecture

```mermaid
flowchart LR
      subgraph Client Layer
         app[Expo Router App\nScreens + Components]
         chat[Floating Chatbot UI]
         authctx[Auth Provider Context]
      end

      subgraph API Layer
         server[Express Server]
         routes[Route Modules\nstadiums, sports, players, qr, chat, events, inquiries, press, auth, debug, client-portal]
      end

      subgraph Data + Integrations
         prisma[Prisma Client]
         neon[(Neon Postgres)]
         clerk[Clerk]
         ext[Location / QR / AI Integrations]
      end

      app --> authctx
      app --> chat
      app --> server
      server --> routes
      routes --> prisma
      prisma --> neon
      routes --> clerk
      routes --> ext
```

## 4) App Functional Map

```mermaid
mindmap
   root((InStadium App))
      Discovery
         Explore Feed
         Sports Index
         Search Stadium
         Find Stadium Nearby
      Stadium Experience
         Hero + Overview
         Gallery
         Timeline
         Matches
         Players
         Maps + Nearby Places
      Engagement
         Floating Chatbot
         Inquiries
         Press and Media
         Events
      Access
         Clerk Sign In / Sign Up
         Authenticated Endpoints
         Client Portal
      Entry Points
         Home Navigation
         QR Scan + Resolve
         Deep Link Open
```

## 5) Runtime Architecture (Request Path)

```mermaid
sequenceDiagram
      autonumber
      participant U as User
      participant A as Mobile App
      participant B as Backend API
      participant C as Clerk
      participant D as Database

      U->>A: Open app and browse stadium content
      A->>B: GET /api/stadiums
      B->>D: Read stadium records
      D-->>B: Stadium data
      B-->>A: JSON response

      U->>A: Sign in for protected features
      A->>C: Authenticate user
      C-->>A: Session token
      A->>B: GET /api/auth/me (Bearer token)
      B->>C: Verify token claims
      C-->>B: Token valid
      B-->>A: Authorized profile data
```

## 6) Data Flow Diagrams

### DFD Level 0 (Context)

```mermaid
flowchart LR
      user[External User]
      platform((InStadium Platform))
      auth[Auth Provider]
      data[(Stadium Data Store)]
      services[External Service Providers]

      user -->|search, browse, scan, submit| platform
      platform -->|content, suggestions, responses| user
      platform -->|verify identity| auth
      auth -->|auth status/claims| platform
      platform -->|read/write| data
      platform -->|lookup/enrichment| services
```

### DFD Level 1 (Operational)

```mermaid
flowchart TB
      U[User]

      P1((P1 Discover Stadiums))
      P2((P2 View Stadium Detail))
      P3((P3 Authentication Flow))
      P4((P4 QR Resolve and Open))
      P5((P5 Inquiry and Engagement))
      P6((P6 AI Chat Assistance))

      D1[(D1 Stadium Catalog)]
      D2[(D2 User and Access Data)]
      D3[(D3 Inquiry and Event Records)]
      D4[(D4 QR Mappings)]

      E1[Clerk]
      E2[Location Services]
      E3[AI Service]

      U --> P1
      U --> P2
      U --> P3
      U --> P4
      U --> P5
      U --> P6

      P1 <--> D1
      P2 <--> D1
      P3 <--> D2
      P4 <--> D4
      P5 <--> D3
      P6 <--> D1

      P3 <--> E1
      P2 <--> E2
      P6 <--> E3
```

## 7) Primary User Journey Flow

```mermaid
flowchart TD
      A[Open App] --> B[Home / Explore]
      B --> C{User intent}

      C -->|Find a stadium| D[Search or Filter]
      C -->|Use location| E[Find Nearby]
      C -->|Scan code| F[QR Scan]
      C -->|Ask assistant| G[Chat Interaction]

      D --> H[Open Stadium Detail]
      E --> H
      F --> H
      G --> H

      H --> I[View Gallery, Matches, Players, Map]
      I --> J{Needs protected action?}
      J -->|No| K[Continue browsing]
      J -->|Yes| L[Authenticate]
      L --> M[Access protected flows]
```

## 8) Activity Diagram: Stadium Discovery to Decision

```mermaid
flowchart TD
      S([Start]) --> P[Open discovery surface]
      P --> Q{Input mode}
      Q -->|Text search| R[Enter query]
      Q -->|Sport filter| T[Select sport]
      Q -->|Nearby| U[Grant location access]

      R --> V[Fetch matching stadiums]
      T --> V
      U --> V

      V --> W[Render candidate list]
      W --> X{User selects one?}
      X -->|No| Y[Refine query/filter]
      Y --> V
      X -->|Yes| Z[Open detail page]
      Z --> AA[Review key content and context]
      AA --> AB([End])
```

## 9) Activity Diagram: Authenticated Operations

```mermaid
flowchart TD
      A([Start Protected Action]) --> B[Check local auth state]
      B --> C{Signed in?}
      C -->|No| D[Show auth screen]
      D --> E[Sign in or sign up]
      E --> F[Receive session token]
      C -->|Yes| F
      F --> G[Call protected backend API]
      G --> H{Token valid on backend?}
      H -->|No| I[Show re-auth message]
      H -->|Yes| J[Perform requested operation]
      I --> K([End])
      J --> K
```

## 10) Sequence Diagram: QR Flow

```mermaid
sequenceDiagram
      autonumber
      participant U as User
      participant A as Mobile App
      participant B as Backend
      participant Q as QR Mapping Store

      U->>A: Scan stadium QR
      A->>B: GET /api/qr/resolve?code=...
      B->>Q: Lookup mapping by code
      Q-->>B: Stadium mapping
      B-->>A: Resolved stadium id + metadata
      A->>A: Navigate to /stadium/[id]
      A-->>U: Stadium detail displayed
```

## 11) Sequence Diagram: Inquiry Submission

```mermaid
sequenceDiagram
      autonumber
      participant U as User
      participant A as Mobile App
      participant B as Backend
      participant D as Inquiry Store

      U->>A: Fill inquiry form
      A->>B: POST /api/inquiries
      B->>D: Persist inquiry
      D-->>B: Created record
      B-->>A: Success response
      A-->>U: Confirmation shown
```

## 12) State Diagram: App Access and Interaction

```mermaid
stateDiagram-v2
      [*] --> Bootstrapping
      Bootstrapping --> PublicBrowsing

      PublicBrowsing --> Discovering: search/filter/nearby
      Discovering --> ViewingStadium: select stadium
      ViewingStadium --> PublicBrowsing: back/navigation

      PublicBrowsing --> AuthFlow: protected action
      AuthFlow --> Authenticated: successful sign in
      AuthFlow --> PublicBrowsing: cancel/fail

      Authenticated --> ProtectedOps: inquiries/events/portal actions
      ProtectedOps --> Authenticated
      Authenticated --> PublicBrowsing: sign out

      PublicBrowsing --> [*]
```

## 13) Backend Capability Map

```mermaid
flowchart LR
      subgraph Public API Domain
         A[stadiums]
         B[sports]
         C[players]
         D[chat]
         E[qr resolve/open/download]
         F[health]
      end

      subgraph Protected API Domain
         G[auth me]
         H[inquiries write/update/read]
         I[press write/read]
         J[events CRUD]
         K[client portal]
         L[debug]
         M[qr mappings/generate-all]
      end

      A --> DB[(Neon + Prisma)]
      B --> DB
      C --> DB
      D --> EXT[AI/Integration Services]
      E --> DB
      G --> AUTH[Clerk Verification]
      H --> DB
      I --> DB
      J --> DB
      K --> DB
      L --> DB
      M --> DB
```

## 14) Deployment View (High Level)

```mermaid
flowchart TB
      subgraph User Devices
         M1[Android App]
         M2[iOS App]
      end

      subgraph App Runtime
         EX[Expo Runtime + Router]
      end

      subgraph Backend Runtime
         API[Node.js + Express API]
         ORM[Prisma Client]
      end

      subgraph Managed Services
         PG[(Neon Postgres)]
         CK[Clerk]
         EXT[Location + AI + QR Integrations]
      end

      M1 --> EX
      M2 --> EX
      EX --> API
      API --> ORM
      ORM --> PG
      API --> CK
      API --> EXT
```

## 15) Repository Landscape

```mermaid
flowchart TB
      root[instadium-app]
      root --> app[app/\nRoute-driven screens]
      root --> components[components/\nReusable UI + feature blocks]
      root --> providers[providers/\nCross-cutting contexts]
      root --> hooks[hooks/\nComposable logic]
      root --> constants[constants/\nTheme + shared constants]
      root --> backend[backend/\nExpress API + Prisma]
      root --> assets[assets/\nImages and static resources]
      root --> scripts[scripts/\nProject automation]
      root --> android[android/\nNative Android project files]
      root --> web[web/\nOptional web workspace]
```

## 16) Non-Technical Feature Summary

- Stadium discovery and exploration journey
- Rich stadium content presentation
- Multi-entry navigation (search, nearby, QR)
- Assisted conversational support via chatbot surface
- Role-aware and token-aware protected operations
- Event and inquiry operations for business workflows

## 17) Reserved Space for Future Technical Documentation

The following sections are intentionally left as expandable placeholders so you can add detailed engineering depth later.

### 17.1 API Contract Details (To Be Added)

- Endpoint-by-endpoint request/response contracts
- Validation rules and error payload matrix
- Authorization matrix by route and role

### 17.2 Data Model and Schema Details (To Be Added)

- Entity relationship diagrams
- Migration strategy and schema evolution policy
- Data retention and archival approach

### 17.3 Security and Compliance Details (To Be Added)

- Threat model and trust boundaries
- Secrets and key management strategy
- Audit trails, observability, and access governance

### 17.4 Performance and Reliability Details (To Be Added)

- SLO and SLA definitions
- Caching, pagination, and query-performance notes
- Load testing and incident response workflow

### 17.5 CI/CD and Release Engineering Details (To Be Added)

- Branching and release cadence
- Build pipeline and quality gates
- Rollback and hotfix procedures

### 17.6 Mobile Platform Engineering Details (To Be Added)

- Native module and device capability matrix
- Offline behavior and sync strategy
- Notification delivery model and retry behavior

## 18) Quick Start (Operational)

### App

1. Install dependencies:

```bash
npm install
```

2. Start Expo:

```bash
npm run start
```

### Backend (from app root)

```bash
npm run backend:dev
```

## 19) Documentation Status

- High-level architecture: complete
- High-level data and activity flows: complete
- Detailed technical reference: pending (reserved sections included)

---

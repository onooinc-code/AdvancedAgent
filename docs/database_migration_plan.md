# Database Migration Plan: from LocalStorage to Cloud-Native

This document outlines two potential migration paths for the Advanced AI Assistant's data persistence layer, moving from the browser's `localStorage` to a scalable, cloud-native solution suitable for the Vercel ecosystem.

---

## 1. Rationale: Why Migrate from LocalStorage?

The current `localStorage` implementation is excellent for rapid prototyping and single-user, single-device usage. However, migrating to a cloud database is essential for a production-grade application for the following reasons:

-   **Data Persistence & Multi-Device Sync**: User data is no longer trapped in one browser. A user can log in from any device and access their complete history and configuration.
-   **Scalability**: `localStorage` is limited to ~5-10MB. Cloud databases have virtually no limit.
-   **Security**: A proper backend with authentication ensures a user can only access their own data.
-   **Server-Side Logic**: Enables powerful features like background processing, caching, and advanced analytics that are impossible on the client-side.
-   **Collaboration**: The foundation for future features like sharing conversations or team-based agent management.

---

## Path A: Google Cloud Firestore

Firestore is a NoSQL, document-oriented database from Google, part of the Firebase suite. It's known for its ease of use, real-time capabilities, and excellent integration with Firebase Authentication.

### Benefits on Vercel:
-   **Rapid Development**: Very fast to set up and start using.
-   **Real-Time by Default**: Perfect for a chat application; updates are pushed to clients automatically.
-   **Serverless Integration**: Works seamlessly with Vercel Functions (or Google Cloud Functions) for backend logic.
-   **Generous Free Tier**: Ideal for starting projects without initial costs.

### Proposed Firestore Data Structure:

This structure uses collections (like folders) and documents (like files).

```
/
├── users/{userId}/                 (Collection)
│   ├── profile                     (Document)
│   │   {
│   │     "displayName": "Alex",
│   │     "email": "alex@example.com",
│   │     "createdAt": Timestamp
│   │   }
│   │
│   ├── appSettings                 (Document)
│   │   {
│   │     "agents": [ ...Agent objects... ],
│   │     "agentManager": { ...AgentManager object... },
│   │     "globalApiKey": "...",
│   │     "sendOnEnter": true,
│   │     "agentBubbleSettings": { ...BubbleSettings object... },
│   │     "userBubbleSettings": { ...BubbleSettings object... }
│   │   }
│   │
│   ├── longTermMemory              (Document)
│   │   {
│   │     "user_profession": "Astrophysicist",
│   │     "project_goal": "Write a research paper"
│   │   }
│   │
│   ├── usageMetrics                (Document)
│   │   {
│   │     "totalTokens": 125000,
│   │     "totalRequests": 850
│   │   }
│   │
│   └── conversations/              (Collection)
│       └── {conversationId}/       (Document)
│           {
│             "title": "Brainstorming Session",
│             "createdAt": Timestamp,
│             ...all other conversation settings (featureFlags, etc.)...
│           }
│           │
│           └── messages/           (Sub-collection)
│               └── {messageId}/    (Document)
│                   {
│                     "sender": "user" or "agent-1",
│                     "text": "Hello, world!",
│                     "timestamp": Timestamp,
│                     ...other message data...
│                   }
```

---

## Path B: Gel Database / Vercel Postgres

Gel is a graph-relational database built on top of Postgres, which is offered directly by Vercel. This path provides strong data integrity and powerful querying capabilities.

### Benefits on Vercel:
-   **First-Party Integration**: Vercel Postgres is a native Vercel product, ensuring seamless integration and performance.
-   **SQL & Graph Power**: Gel allows for both standard SQL queries and more complex graph queries to analyze relationships between data.
-   **Data Integrity**: A relational structure enforces data consistency, which is excellent for complex applications.
-   **Familiarity**: The relational model is a well-understood standard for many developers.

### Proposed Gel/Postgres Data Structure:

This structure uses traditional database tables with relationships.

```sql
-- users Table
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- app_settings Table (One-to-One with users)
app_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  agent_manager JSONB,
  global_api_key TEXT,
  send_on_enter BOOLEAN DEFAULT true,
  agent_bubble_settings JSONB,
  user_bubble_settings JSONB,
  long_term_memory JSONB DEFAULT '{}'
);

-- agents Table (Many-to-One with users)
agents (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- All agent properties (name, job, role, systemInstruction, etc.)
  -- can be stored in a single JSONB column for flexibility.
  config JSONB
);

-- conversations Table (Many-to-One with users)
conversations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- All conversation settings (featureFlags, discussionSettings, etc.)
  -- can be stored in a single JSONB column.
  settings JSONB
);

-- messages Table (Many-to-One with conversations)
messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'user' or agent_id
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- All other message data (attachment, pipeline, etc.)
  -- can be stored in a single JSONB column.
  metadata JSONB
);

-- usage_metrics Table (Example for stats)
usage_metrics (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id TEXT, -- Can be 'manager' or an agent UUID
  tokens_used INT,
  request_count INT,
  date DATE DEFAULT CURRENT_DATE
);
```
*Note: `JSONB` is a highly efficient binary JSON data type in Postgres, perfect for storing flexible object data like settings or agent configurations.*
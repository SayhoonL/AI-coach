# AI DSA Coach MCP Server

A personal coding-practice coach built with TypeScript, PostgreSQL, GitHub, and the Model Context Protocol (MCP).

The project automatically imports my NeetCode submission history from GitHub, analyzes my practice patterns, identifies under-practiced topics, and exposes the results through MCP tools that an AI client can call.

## How It Works

```text
NeetCode
   ↓
GitHub submission repository
   ↓
GitHub API
   ↓
TypeScript sync service
   ↓
PostgreSQL
   ↓
Analytics + recommendation engine
   ↓
MCP Server
   ↓
Claude / Cursor / other MCP clients
```

## Features

* Automatically imports NeetCode submissions from GitHub
* Tracks multiple attempts for the same problem
* Stores real submission dates from Git commit history
* Prevents duplicate submission imports
* Tracks problem difficulty and DSA category
* Calculates topic coverage
* Calculates review urgency
* Identifies under-practiced DSA topics
* Recommends unsolved problems from weak categories
* Recommends previously solved problems for review
* Tracks complete history for individual problems
* Exposes coaching functionality through MCP tools

## Current Data

The initial import contains:

```text
111 unique DSA problems
248 submissions
```

Each problem includes information such as:

```text
Title
Slug
Difficulty
Topic
```

Each submission includes:

```text
Problem
Language
GitHub path
GitHub URL
Submission date
```

## MCP Tools

### `get_progress`

Returns an overall summary of DSA practice.

Includes:

* total unique problems
* total submissions
* difficulty distribution
* most-practiced topics
* weakest topics

---

### `get_weak_topics`

Analyzes topic coverage and review urgency.

Example:

```json
{
  "topic": "Greedy",
  "problemsSolved": 1,
  "daysSincePractice": 20,
  "weaknessScore": 90,
  "reviewScore": 67
}
```

`weaknessScore` represents how little coverage I currently have in a topic.

`reviewScore` represents how long it has been since I practiced that topic.

---

### `get_recent_activity`

Returns recent DSA submissions.

Example questions an MCP client can answer:

```text
What have I practiced this week?

What problems did I solve recently?

Have I been practicing dynamic programming?
```

---

### `get_problem_history`

Returns the complete submission history for a specific problem.

Example input:

```json
{
  "problem": "LRU Cache"
}
```

The tool can return:

```text
Difficulty
Topic
Total attempts
First attempt
Latest attempt
Submission history
```

---

### `recommend_problems`

Recommends unsolved NeetCode problems based on weak topic coverage.

The recommendation engine:

```text
Find weak topics
        ↓
Load NeetCode curriculum
        ↓
Remove already-solved problems
        ↓
Rank remaining problems
        ↓
Return recommended practice
```

---

### `get_review_problems`

Recommends previously solved problems that should be revisited.

The score considers:

```text
time since last solution
+
topic weakness
+
topic review urgency
```

## Project Structure

```text
src/
├── data/
│   └── neetcode250.json
│
├── db/
│   ├── index.ts
│   └── init.ts
│
├── github/
│   └── githubService.ts
│
├── mcp/
│   └── server.ts
│
├── scripts/
│   ├── analytics.ts
│   ├── metadata.ts
│   └── sync.ts
│
└── services/
    ├── analyticsService.ts
    ├── dateService.ts
    ├── metadataService.ts
    ├── problemService.ts
    ├── recommendationService.ts
    ├── submissionService.ts
    └── syncService.ts
```

## Tech Stack

### Backend

* Node.js
* TypeScript

### Database

* PostgreSQL
* Docker

### Integrations

* GitHub REST API
* NeetCode submission repository

### AI Integration

* Model Context Protocol
* TypeScript MCP SDK

## Database Design

### Problems

```text
problems
----------------
id
slug
title
leetcode_id
difficulty
topics
created_at
```

### Submissions

```text
submissions
----------------
id
problem_id
submission_name
language
github_url
github_path
solved_at
created_at
```

A problem can have multiple submissions:

```text
LRU Cache
   │
   ├── submission-0.js
   ├── submission-1.js
   ├── submission-2.js
   └── ...
```

This allows the coach to track repeated practice instead of only whether a problem has ever been solved.

## Setup

Install dependencies:

```bash
npm install
```

Start PostgreSQL:

```bash
docker compose up -d
```

Initialize the database:

```bash
npm run db:init
```

Create a `.env` file:

```env
DATABASE_URL=your_postgres_connection_string

GITHUB_OWNER=your_github_username
GITHUB_REPO=your_neetcode_repository
GITHUB_TOKEN=your_github_token
```

`.env` should never be committed.

## Commands

### Sync NeetCode history

```bash
npm run sync
```

This:

1. retrieves problems from the GitHub repository
2. imports new submissions
3. prevents duplicate imports
4. retrieves Git commit dates
5. updates PostgreSQL

### Import problem metadata

```bash
npm run metadata
```

Adds:

```text
problem title
difficulty
topic/category
```

### View analytics

```bash
npm run analytics
```

### Start MCP server

```bash
npm run mcp
```

## MCP Inspector

The MCP server can be tested with MCP Inspector:

```bash
npx @modelcontextprotocol/inspector -- \
  npx tsx src/mcp/server.ts
```

Available tools should include:

```text
get_progress
get_weak_topics
get_recent_activity
get_problem_history
recommend_problems
get_review_problems
```

## Example Coaching Flow

A user could ask an MCP-enabled AI client:

```text
What should I practice today?
```

The client can retrieve:

```text
get_weak_topics
        ↓
recommend_problems
        ↓
get_recent_activity
```

and use the results to generate a recommendation based on actual coding history instead of generic advice.

For example:

```text
Greedy
Coverage: low
Last practiced: 20 days ago

2-D Dynamic Programming
Coverage: low
Practiced recently

Linked List
Coverage: strong
Practiced today
```

The coach can prioritize Greedy or 2-D Dynamic Programming instead of recommending another Linked List problem.

## Future Improvements

Possible additions include:

* confidence scores for each problem
* hint usage tracking
* failed-attempt tracking
* spaced-repetition scheduling
* solution complexity analysis
* AI-generated feedback on submitted code
* automatic GitHub webhook synchronization
* historical progress charts
* topic mastery trends
* personalized daily practice plans

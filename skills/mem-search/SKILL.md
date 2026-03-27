---
name: mem-search
description: Search claude-mem's persistent cross-session memory database. Use when user asks "did we already solve this?", "how did we do X last time?", or needs work from previous sessions.
origin: https://github.com/thedotmack/claude-mem
---

# Memory Search

Search past work across all sessions. Simple workflow: search → filter → fetch.

## When to Use

Use when users ask about **previous sessions** (not the current conversation):

- "Did we already fix this?"
- "How did we solve X last time?"
- "What happened last week?"
- "How did we do X before?"

## 3-Layer Workflow — ALWAYS follow in order

**Never fetch full details without filtering first. 10x token savings.**

### Step 1: Search — Get Index with IDs

```
search(query="authentication", limit=20, project="my-project")
```

Returns a table with IDs, timestamps, types, titles (~50–100 tokens/result):

```
| ID    | Time    | T  | Title                        | Read |
|-------|---------|----|------------------------------|------|
| #11131 | 3:48 PM | 🟣 | Added JWT authentication     | ~75  |
| #10942 | 2:15 PM | 🔴 | Fixed auth token expiration  | ~50  |
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | — | Search term |
| `limit` | number | 20 | Max results (max 100) |
| `project` | string | — | Project name filter |
| `type` | string | — | `"observations"`, `"sessions"`, or `"prompts"` |
| `obs_type` | string | — | Comma-separated: `bugfix`, `feature`, `decision`, `discovery`, `change` |
| `dateStart` | string | — | `YYYY-MM-DD` or epoch ms |
| `dateEnd` | string | — | `YYYY-MM-DD` or epoch ms |
| `offset` | number | 0 | Skip N results |
| `orderBy` | string | `date_desc` | `date_desc`, `date_asc`, `relevance` |

### Step 2: Timeline — Get Context Around Interesting Results

```
timeline(anchor=11131, depth_before=3, depth_after=3, project="my-project")
```

Or find anchor automatically:

```
timeline(query="authentication", depth_before=3, depth_after=3, project="my-project")
```

Returns `depth_before + 1 + depth_after` items chronologically with observations, sessions, and prompts interleaved.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `anchor` | number | — | Observation ID to center around |
| `query` | string | — | Find anchor automatically if no anchor |
| `depth_before` | number | 5 | Items before anchor (max 20) |
| `depth_after` | number | 5 | Items after anchor (max 20) |
| `project` | string | — | Project name filter |

### Step 3: Fetch — Full Details for Filtered IDs Only

Review titles from Step 1 and context from Step 2. Pick only the relevant IDs.

```
get_observations(ids=[11131, 10942])
```

Always use `get_observations` for 2+ items — single request vs N requests.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `ids` | array of numbers | Observation IDs to fetch (required) |
| `orderBy` | string | `date_desc` (default), `date_asc` |
| `limit` | number | Max observations to return |
| `project` | string | Project name filter |

Returns complete observation objects with title, subtitle, narrative, facts, concepts, files (~500–1000 tokens each).

## Token Cost Summary

| Operation | Cost |
|-----------|------|
| Search index entry | ~50–100 tokens |
| Full observation | ~500–1000 tokens |
| Batch fetch (N items) | 1 HTTP request |

Always filter before fetching. Never fetch full observations without reviewing the search index first.

## Examples

```
# Recent bug fixes
search(query="bug", type="observations", obs_type="bugfix", limit=20, project="my-project")

# Last week's work
search(type="observations", dateStart="2025-11-11", limit=20, project="my-project")

# Context around a discovery
timeline(anchor=11131, depth_before=5, depth_after=5, project="my-project")

# Batch fetch details
get_observations(ids=[11131, 10942, 10855], orderBy="date_desc")
```

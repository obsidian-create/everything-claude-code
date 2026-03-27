---
name: system-design-mastery
description: Design any system from scratch — APIs, distributed services, databases, caching layers, queues, and more. Covers requirements analysis, capacity planning, component selection, trade-off reasoning, and failure mode analysis.
origin: ECC
---

# System Design Mastery

Design any software system from first principles. Applicable to interviews, architecture reviews, and production planning.

## When to Activate

- Designing a new system or major feature from scratch
- Scaling an existing system under load growth
- Evaluating architectural trade-offs
- Architecture review or RFC writing
- Identifying single points of failure

## The Design Process

```
Requirements → Scale → Data Model → API → Components → Trade-offs → Failure Modes
```

Never skip requirements. Never jump to solutions before understanding constraints.

## Phase 1: Requirements

### Functional Requirements
What must the system DO?

```
Template:
- Core actions: [create, read, update, delete, process, notify, ...]
- Who are the actors: [user types, services, external systems]
- Critical user journeys: [primary flows the system must support]
- Non-goals: [explicitly what this system will NOT do]
```

### Non-Functional Requirements
How must the system PERFORM?

```
Availability:   ___% uptime (99.9% = 8.7h/yr downtime, 99.99% = 52min/yr)
Latency:        p50 <___ms, p99 <___ms
Throughput:     ___req/s peak, ___req/s sustained
Data volume:    ___GB/day write, ___TB total stored
Consistency:    strong | eventual | causal
Durability:     can we lose any data? which data?
Security:       authentication, authorization, encryption at rest/transit
Compliance:     GDPR, HIPAA, SOC2, PCI-DSS?
```

## Phase 2: Capacity Estimation

Back-of-envelope math to understand scale:

```
Users:          100M total, 10M DAU, 1M peak concurrent
Write rate:     1M DAU × 5 writes/day = ~60 writes/sec avg, ~600 peak
Read rate:      1M DAU × 50 reads/day = ~600 reads/sec avg, ~6000 peak
Storage:        1KB/record × 60 writes/sec × 86400 sec/day × 365 = ~1.9TB/year
Bandwidth:      6000 reads/sec × 10KB avg = ~60MB/s peak read bandwidth

Memory (cache): 20% of hot data cached = 0.2 × daily_active_records × record_size
```

**Numbers to memorize:**
```
1 day   = ~86,400 seconds
1 month = ~2.5M seconds
1 year  = ~31.5M seconds

L1 cache hit:    ~1ns
RAM access:      ~100ns
SSD random read: ~100μs
HDD random read: ~10ms
Network (LAN):   ~1ms
Network (WAN):   ~100ms

Read/write ratio typical web: 80:20 to 95:5
```

## Phase 3: Data Modeling

### Choose the Right Database

| Database Type | Best For | Examples |
|---|---|---|
| Relational (SQL) | ACID transactions, complex joins, structured data | Postgres, MySQL |
| Document | Flexible schema, nested data, fast reads by ID | MongoDB, DynamoDB |
| Key-Value | Simple lookups, sessions, caching | Redis, DynamoDB |
| Wide-Column | Time-series, large-scale writes, cassandra patterns | Cassandra, HBase |
| Graph | Relationships are first-class (social, recommendations) | Neo4j, Amazon Neptune |
| Search | Full-text search, faceted filtering | Elasticsearch, Opensearch |
| Time-series | Metrics, events, append-heavy time data | InfluxDB, TimescaleDB |

### Schema Design Principles

```
Normalization vs Denormalization:
- Normalize: when writes dominate, storage is primary concern
- Denormalize: when reads dominate, joins are expensive at scale

Indexes:
- Index columns used in WHERE, JOIN, ORDER BY
- Composite indexes: order matters (leftmost prefix rule)
- Too many indexes slow writes
- Covering index eliminates table lookup

Sharding (horizontal partitioning):
- By user_id: even distribution, user data co-located
- By geography: latency optimization, compliance
- By time: efficient range queries, archival
- Hotspot risk: avoid sharding by frequently-updated single key
```

## Phase 4: API Design

### REST Principles

```
Resources as nouns:    GET /users/{id}/orders
Actions as HTTP verbs: POST=create, GET=read, PUT=replace, PATCH=update, DELETE=remove
Idempotency:           GET, PUT, DELETE must be idempotent
Pagination:            cursor-based > offset-based at scale
Versioning:            /v1/, /v2/ or header: API-Version: 2
```

### API Contract

```yaml
# Each endpoint defines:
path:          /api/v1/orders
method:        POST
auth:          Bearer JWT required
rate_limit:    100/min per user
request:
  body: { items: [{productId, quantity}], addressId }
response:
  201: { orderId, status: "pending", estimatedDelivery }
  400: { error: "invalid_items", details: [...] }
  429: { error: "rate_limited", retryAfter: 60 }
idempotency:   Idempotency-Key header supported
```

## Phase 5: Component Architecture

### Core Building Blocks

**Load Balancer**
```
L4 (TCP): low latency, no content inspection
L7 (HTTP): routing by path/header, SSL termination, health checks
Algorithms: round-robin, least-connections, IP-hash (sticky sessions)
```

**Cache**
```
Where to cache:
  Client-side:    browser cache, CDN edge
  Application:    in-process cache (fastest, not shared)
  Distributed:    Redis/Memcached (shared across instances)
  Database:       query cache, materialized views

Cache patterns:
  Cache-aside:    app checks cache, on miss fetches DB and populates
  Write-through:  write to cache + DB synchronously
  Write-behind:   write to cache, async flush to DB
  Read-through:   cache fetches DB on miss automatically

Eviction policies:
  LRU (Least Recently Used):  general purpose
  LFU (Least Frequently Used): hot/cold data patterns
  TTL: time-based expiry for freshness
```

**Message Queue**
```
Use when:
  - Decoupling producers from consumers
  - Smoothing out traffic spikes
  - Async processing (email, notifications, background jobs)
  - Fan-out (one message → many consumers)

Queue vs Stream:
  Queue (RabbitMQ, SQS): each message consumed once, then deleted
  Stream (Kafka, Kinesis): messages retained, multiple consumers can replay

Guarantees:
  At-most-once:  may lose messages, no duplicates
  At-least-once: no loss, may get duplicates (idempotency required)
  Exactly-once:  hardest, most expensive, use transactions
```

**CDN**
```
Cache: static assets (JS, CSS, images, fonts)
Edge:  dynamic content near user (Lambda@Edge, Cloudflare Workers)
Shield: origin protection, DDoS mitigation
```

### Reference Architectures

**High-Read Web App**
```
[Client] → [CDN] → [Load Balancer] → [App Servers] → [Read Replica DB]
                                                    ↕
                                               [Redis Cache]
                                                    ↕
                                              [Primary DB]
```

**Event-Driven Microservices**
```
[API Gateway] → [Service A] → [Kafka] → [Service B]
                                      → [Service C]
                                      → [Analytics Service]
                [Service A] ← [DB A]
                [Service B] ← [DB B]  (each service owns its data)
```

**Write-Heavy System (e.g., metrics/analytics)**
```
[Clients] → [Load Balancer] → [API Servers]
                                    ↓
                            [Kafka / Kinesis]
                                    ↓
                           [Stream Processors]
                            ↓           ↓
                     [Hot Storage]  [Cold Storage]
                    (ClickHouse)    (S3 + Parquet)
```

## Phase 6: Trade-off Reasoning

### CAP Theorem

In a partition, choose:
- **CP** (Consistency + Partition): returns error or stale data rather than inconsistent data. (HBase, Zookeeper)
- **AP** (Availability + Partition): always responds but may return stale data. (Cassandra, DynamoDB)

Most web apps tolerate eventual consistency for most data.

### Consistency Levels

```
Strong:     Read always returns latest write (expensive, slow)
Causal:     Reads respect causal ordering (medium cost)
Eventual:   Reads may return stale data, will converge (cheapest)

Rule of thumb:
- Financial transactions → strong consistency
- Social feeds, likes, counters → eventual consistency
- Session data, user preferences → eventual or causal
```

### Latency vs Throughput

```
Latency:    time to handle one request
Throughput: requests handled per second

Often inversely related: batching improves throughput but increases latency.

Optimize latency:  minimize hops, use caches, reduce payload size
Optimize throughput: batching, async processing, horizontal scaling
```

## Phase 7: Failure Mode Analysis

For every component, ask:

```
1. What happens when THIS component fails completely?
2. What happens when THIS component is slow (partial degradation)?
3. What is the cascading failure path?
4. How do we detect the failure?
5. How do we recover?
```

### Resilience Patterns

**Circuit Breaker**
```
CLOSED → OPEN → HALF_OPEN
- Closed: requests pass through normally
- Open: after N failures, fast-fail without calling service
- Half-open: after timeout, allow one probe request
```

**Retry with Backoff**
```
retry(maxAttempts=3, backoff=exponential(base=1s, max=30s), jitter=true)
ONLY retry on transient errors (timeout, 503), never on 4xx
```

**Bulkhead**
```
Isolate resource pools so one failing consumer can't exhaust shared resources.
Example: separate thread pools per downstream service.
```

**Graceful Degradation**
```
Core feature fails → serve cached/stale data
Personalization fails → serve generic content
Payment fails → queue for retry, inform user
```

## Design Checklist

```
Requirements:
- [ ] Functional requirements listed
- [ ] Non-functional requirements quantified
- [ ] Scale estimation done

Data:
- [ ] Data model designed
- [ ] Database type justified
- [ ] Sharding strategy defined if needed
- [ ] Indexing strategy defined

API:
- [ ] API contract defined
- [ ] Auth/authz specified
- [ ] Rate limiting defined
- [ ] Versioning strategy

Infrastructure:
- [ ] Load balancing strategy
- [ ] Caching strategy
- [ ] CDN if applicable
- [ ] Async queue if applicable

Reliability:
- [ ] SPOF identified
- [ ] Failure modes documented
- [ ] Retry/circuit breaker defined
- [ ] Data backup/recovery plan

Operations:
- [ ] Monitoring/alerting defined
- [ ] Key metrics identified
- [ ] Deployment strategy (blue/green, canary)
- [ ] Runbook for common incidents
```

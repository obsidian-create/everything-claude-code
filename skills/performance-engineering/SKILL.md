---
name: performance-engineering
description: Profile and optimize any system — backend services, databases, frontend, and infrastructure. Covers measurement methodology, profiling tools, database query optimization, caching strategies, frontend performance, and continuous performance monitoring.
origin: ECC
---

# Performance Engineering

Measure first, optimize second. Make any system fast through evidence-based methodology.

## When to Activate

- Performance regression detected
- System is slow under load
- Database queries are taking too long
- Frontend is laggy or has high LCP/INP
- Infrastructure costs growing faster than traffic
- Pre-launch performance audit

## Golden Rule

**Never optimize without measurement.** Guessing wastes time and creates complexity. Every optimization must be:
1. Preceded by a benchmark/profile showing the bottleneck
2. Followed by a benchmark showing improvement
3. Checked for regressions in adjacent areas

## Phase 1: Establish Baseline

Before any optimization:

```bash
# Capture key metrics BEFORE any change
# Load test: wrk, k6, artillery, hey
k6 run --vus 100 --duration 30s load-test.js

# Response time breakdown (p50, p95, p99, p999)
# Throughput (req/s)
# Error rate
# CPU usage under load
# Memory usage under load
# DB connection pool saturation
```

**Baseline document:**
```
Date: [date]
Commit: [hash]
p50 latency:  ___ms
p95 latency:  ___ms
p99 latency:  ___ms
Throughput:   ___req/s
Error rate:   ___%
CPU at peak:  ___%
Memory:       ___MB
```

## Phase 2: Profiling

### Backend Profiling

**Python**
```python
# CPU profiling with cProfile
import cProfile, pstats
profiler = cProfile.Profile()
profiler.enable()
# ... code to profile ...
profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(20)  # top 20 functions

# Memory profiling
from memory_profiler import profile
@profile
def expensive_function():
    ...

# Line-level timing
from line_profiler import LineProfiler
lp = LineProfiler()
lp_wrapper = lp(my_function)
lp_wrapper()
lp.print_stats()
```

**Node.js**
```bash
# Built-in profiler
node --prof app.js
node --prof-process isolate-*.log > profile.txt

# Clinic.js (comprehensive)
clinic doctor -- node app.js
clinic flame  -- node app.js   # CPU flame graph
clinic heap   -- node app.js   # Memory

# V8 inspector
node --inspect app.js  # then open chrome://inspect
```

**Go**
```go
import _ "net/http/pprof"

// Then:
go tool pprof http://localhost:6060/debug/pprof/profile   # CPU
go tool pprof http://localhost:6060/debug/pprof/heap      # Memory
go tool pprof http://localhost:6060/debug/pprof/goroutine # Goroutines
// Open flame graph: go tool pprof -http=:8081 profile.pb.gz
```

**JVM (Java/Kotlin/Scala)**
```bash
# Async Profiler (low overhead, production-safe)
./profiler.sh -d 30 -f profile.html <pid>

# JFR (Java Flight Recorder)
jcmd <pid> JFR.start duration=60s filename=profile.jfr
jcmd <pid> JFR.stop

# Heap dump
jcmd <pid> GC.heap_dump heap.hprof
# Analyze with Eclipse MAT or VisualVM
```

### Database Profiling

**PostgreSQL**
```sql
-- Find slow queries
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- Explain query plan
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';

-- Check index usage
SELECT relname, seq_scan, idx_scan,
       100 * idx_scan / NULLIF(seq_scan + idx_scan, 0) as idx_pct
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- Missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'orders';
```

**MySQL**
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.1;  -- queries > 100ms

-- Analyze slow query log
pt-query-digest /var/log/mysql/slow.log

-- Show running queries
SHOW PROCESSLIST;
EXPLAIN FORMAT=JSON SELECT ...;
```

### Frontend Profiling

```javascript
// Browser Performance API
const t0 = performance.now();
doExpensiveOperation();
console.log(`Time: ${performance.now() - t0}ms`);

// Measure specific events
performance.mark('op-start');
await fetchData();
performance.mark('op-end');
performance.measure('fetch', 'op-start', 'op-end');
console.log(performance.getEntriesByName('fetch')[0].duration);
```

**Core Web Vitals targets:**
```
LCP (Largest Contentful Paint):  < 2.5s (good), < 4.0s (needs improvement)
INP (Interaction to Next Paint):  < 200ms (good), < 500ms (needs improvement)
CLS (Cumulative Layout Shift):    < 0.1 (good), < 0.25 (needs improvement)
FID (First Input Delay):          < 100ms (good)
TTFB (Time to First Byte):        < 800ms (good)
```

## Phase 3: Optimization Patterns

### Database Optimization

**Indexing**
```sql
-- Create index on frequently filtered columns
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Partial index for common filter
CREATE INDEX idx_active_users ON users(email) WHERE active = true;

-- Covering index (avoids table lookup)
CREATE INDEX idx_orders_covering ON orders(user_id, status, created_at, total);

-- Check index size
SELECT pg_size_pretty(pg_relation_size('idx_orders_user_status'));
```

**Query Optimization**
```sql
-- BAD: SELECT * returns unnecessary columns
SELECT * FROM users WHERE id = 123;

-- GOOD: select only needed columns
SELECT id, name, email FROM users WHERE id = 123;

-- BAD: N+1 problem
SELECT id FROM orders;
-- Then for each order: SELECT * FROM items WHERE order_id = ?

-- GOOD: JOIN once
SELECT o.id, i.* FROM orders o
JOIN order_items i ON i.order_id = o.id;

-- BAD: function on indexed column disables index
WHERE LOWER(email) = 'user@example.com'

-- GOOD: normalize data or use functional index
WHERE email = 'user@example.com'  -- store lowercased
```

**Connection Pooling**
```
PgBouncer / connection pool settings:
- pool_size = (CPU cores * 2) + effective_disk_spindles
- Typical: 10-20 connections per app instance
- Max DB connections = pool_size * app_instances + headroom
```

### Caching Optimization

```python
# Cache-aside pattern
def get_user(user_id: str) -> User:
    # Check cache
    cached = redis.get(f"user:{user_id}")
    if cached:
        return User.parse(cached)

    # Cache miss: fetch from DB
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)

    # Populate cache with TTL
    redis.setex(f"user:{user_id}", 300, user.serialize())  # 5 min TTL
    return user

# Cache invalidation on write
def update_user(user_id: str, data: dict) -> User:
    user = db.update("UPDATE users SET ... WHERE id = ?", user_id, data)
    redis.delete(f"user:{user_id}")  # invalidate
    return user
```

**Cache sizing:**
```
80% of traffic comes from 20% of data (Pareto principle)
Cache the hot 20%: cache_size = 0.2 * total_working_set
Monitor: cache hit rate should be >80% for effective caching
```

### Backend Code Optimization

**Avoid unnecessary work**
```python
# BAD: compute in every request
def get_report():
    data = fetch_all_records()         # expensive
    return aggregate(data)             # expensive

# GOOD: precompute and cache
def get_report():
    return redis.get('report') or rebuild_report()

def rebuild_report():                  # run on schedule
    data = fetch_all_records()
    report = aggregate(data)
    redis.setex('report', 3600, report)
    return report
```

**Batch operations**
```python
# BAD: N database calls
for user_id in user_ids:
    user = db.get_user(user_id)        # N calls

# GOOD: 1 database call
users = db.get_users_by_ids(user_ids)  # SELECT ... WHERE id IN (...)
```

**Async I/O**
```python
# BAD: sequential I/O
result_a = await fetch_service_a()
result_b = await fetch_service_b()

# GOOD: concurrent I/O
result_a, result_b = await asyncio.gather(
    fetch_service_a(),
    fetch_service_b()
)
```

### Frontend Optimization

**JavaScript bundle**
```bash
# Analyze bundle
npx webpack-bundle-analyzer dist/stats.json
npx vite-bundle-visualizer

# Key optimizations:
# 1. Code splitting (lazy loading)
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

# 2. Tree shaking (import specific, not all)
import { debounce } from 'lodash-es';  # not: import _ from 'lodash'

# 3. Dynamic imports for routes
const router = createBrowserRouter([
  { path: '/dashboard', lazy: () => import('./Dashboard') }
]);
```

**Images**
```html
<!-- Modern formats -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="..." loading="lazy" decoding="async"
       width="800" height="600">
</picture>

<!-- Responsive images -->
<img srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
     sizes="(max-width: 480px) 480px, (max-width: 800px) 800px, 1200px"
     src="large.jpg" alt="...">
```

**Critical rendering path**
```html
<!-- Preload critical resources -->
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
<link rel="preload" href="/api/initial-data" as="fetch" crossorigin>

<!-- Defer non-critical JS -->
<script src="analytics.js" defer></script>

<!-- Inline critical CSS, defer rest -->
<style>/* critical CSS inlined */</style>
<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
```

## Phase 4: Infrastructure Scaling

### Horizontal vs Vertical

```
Vertical (scale-up):
+ Simpler (no distribution complexity)
+ Better for stateful services
- Hard limit, diminishing returns
- Single point of failure

Horizontal (scale-out):
+ Linear scaling (theoretically)
+ No single point of failure
- Requires stateless services
- More complex operations

Rule: exhaust vertical options first, then horizontal.
```

### Auto-scaling

```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70   # scale at 70% CPU
  - type: Resource
    resource:
      name: memory
      target:
        type: AverageValue
        averageValue: 512Mi
```

## Phase 5: Continuous Performance Monitoring

```
Metrics to track in production:
- Request latency: p50, p95, p99 by endpoint
- Error rate: 4xx and 5xx separately
- Throughput: req/s
- DB query time: p95 by query type
- Cache hit rate
- Queue depth (if using queues)
- Memory usage trend
- CPU usage trend

Alerting thresholds:
- p99 latency > 2× baseline → PagerDuty
- Error rate > 1% for 5 min → PagerDuty
- Cache hit rate < 60% → Slack warning
- Queue depth > 10K → Slack warning
```

**Performance budget:**
```
Set a budget for each user-facing operation:
- API response: < 200ms p99
- DB query: < 50ms p99
- Cache operations: < 5ms p99
- Background jobs: < 30s p95

Enforce in CI:
- Benchmark tests fail if > budget × 1.2 (20% buffer)
```

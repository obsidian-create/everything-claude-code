---
name: incident-response
description: Handle production incidents fast — from detection through resolution and post-mortem. Covers triage, communication, diagnosis under pressure, rollback decisions, and blameless post-mortems. Use when something is broken in production or a critical system is degraded.
origin: ECC
---

# Incident Response

Systematic, calm, and fast production incident handling.

## When to Activate

- Production system is down or degraded
- Error rates have spiked
- Users are reporting failures
- Alerts have fired
- Outage is suspected

## The 5-Phase Framework

```
Detect → Triage → Diagnose → Mitigate → Resolve → Post-mortem
```

Stay calm. Slow is smooth, smooth is fast.

## Phase 1: Detect & Declare

### Severity Levels

```
SEV 1 — Critical
  - Complete service outage for all users
  - Data loss or corruption
  - Security breach
  → Immediate page, all-hands, customer comms within 30min

SEV 2 — Major
  - Major feature unavailable for most users
  - Significant performance degradation (>5× baseline)
  - Payment or auth failures
  → Page on-call, customer comms within 1h

SEV 3 — Minor
  - Minor feature degraded for some users
  - Performance regression (<2× baseline)
  - Single-region issue with failover
  → Notify team, fix within business hours

SEV 4 — Low
  - Cosmetic issues, non-critical feature broken
  - Affects <5% of users
  → Ticket, fix in next sprint
```

### Declaration Template
```
🚨 INCIDENT DECLARED — SEV[N]
Time: [UTC timestamp]
Incident Commander: @[name]
Status: Investigating

What we know:
- [observable symptom 1]
- [observable symptom 2]

What we don't know:
- Root cause
- Affected user count

Current action: [first investigation step]
Next update: [UTC timestamp]
```

## Phase 2: Triage

First 5 minutes — establish scope before diagnosis:

```
Triage checklist:
□ Is this a full outage or partial degradation?
□ Which geographic regions are affected?
□ Which user segments are affected? (all users, paid tier, specific feature)
□ Is it getting worse, stable, or recovering?
□ What is the estimated blast radius? (% users, revenue impact)
□ Did anything change in the last 2 hours? (deploy, config, traffic spike)
```

### Quick Checks (30 seconds each)

```bash
# 1. Check service health
curl -o /dev/null -s -w "%{http_code}" https://api.example.com/health

# 2. Check error rates in logs
kubectl logs --tail=100 deployment/api | grep -c ERROR

# 3. Check recent deploys
kubectl rollout history deployment/api
git log --oneline -10

# 4. Check infrastructure
kubectl get pods --all-namespaces | grep -v Running
kubectl top nodes

# 5. Check external dependencies
# Is the DB up? Cache? Third-party APIs?
```

## Phase 3: Diagnose

### Structured Hypothesis Testing

```
Don't fix before you understand. But don't spend >15min on diagnosis before attempting mitigation.

Hypothesis priority order:
1. Recent deployment (highest probability)
2. Configuration change
3. Traffic spike / resource exhaustion
4. Dependency failure (DB, cache, external API)
5. Data-driven failure (bad input from specific source)
6. Infrastructure failure (hardware, network)
```

### Diagnostic Signals

**Logs**
```bash
# Application logs
kubectl logs -f deployment/api --since=30m | grep -E "ERROR|FATAL|PANIC"

# Filter by trace ID for request tracing
kubectl logs deployment/api | grep "trace_id=abc123"

# Structured log querying (Loki, CloudWatch, Datadog)
{app="api"} |= "error" | json | level="error" | __error__="" | rate[5m]
```

**Metrics**
```
Check in order:
1. Request rate: traffic spike or drop?
2. Error rate: 5xx % — which endpoints?
3. Latency p99: which endpoints are slow?
4. CPU/Memory: any resource exhaustion?
5. DB connections: pool saturated?
6. Cache hit rate: sudden drop?
7. Queue depth: processing backed up?
```

**Traces**
```
Find a sample failed trace:
1. Get a failed request ID from logs
2. Search distributed trace for that ID
3. Identify which service/span failed first
4. That's your fault domain
```

### Common Incident Signatures

| Symptom | Likely Cause | First Check |
|---|---|---|
| Error rate spike after deploy | Bad code | Rollback |
| Gradual slowdown over hours | Memory leak | Heap profile, restart |
| Sudden spike in 503s | Pod crash loop | kubectl describe pod |
| DB timeout errors | Missing index, lock contention | pg_stat_statements, pg_locks |
| External API 502s | Third-party outage | Status page of dependency |
| Traffic drops to zero | DNS failure, LB misconfiguration | DNS lookup, LB health |
| Random 5xx for subset of users | Unhealthy pod in rotation | kubectl get pods, health check |
| Spike in 4xx | Bad client or schema mismatch after deploy | Request logs, schema diff |

## Phase 4: Mitigate

**Bias toward fast mitigation over perfect fix.**

The goal is to stop user pain immediately. Fix the root cause after.

### Mitigation Playbook

**Option 1: Rollback (fastest, highest confidence)**
```bash
# If last deploy is suspected
kubectl rollout undo deployment/api
# Or:
git revert HEAD && push to production

# Verify
kubectl rollout status deployment/api
curl https://api.example.com/health
```

**Option 2: Feature flag / kill switch**
```
Disable the broken feature without a deploy.
Every risky feature should have a flag.
```

**Option 3: Scale up**
```bash
# If resource exhaustion
kubectl scale deployment/api --replicas=10
# Or increase pod resources temporarily
```

**Option 4: Restart / recycle**
```bash
# If memory leak or corrupted state
kubectl rollout restart deployment/api
# Pods restart one at a time (rolling restart — zero downtime)
```

**Option 5: Traffic shed**
```
Enable maintenance mode or rate limit to reduce load.
Shed non-critical traffic to protect core functionality.
```

**Option 6: Failover**
```
Switch to backup region, replica DB, or fallback service.
```

### Decision Framework

```
Is a rollback available? → YES → Rollback immediately, investigate after
↓ NO

Did a config change cause this? → YES → Revert config
↓ NO

Is it resource exhaustion? → YES → Scale up
↓ NO

Is a single component failing? → YES → Restart that component
↓ NO

Is it a data issue? → YES → Identify and quarantine bad data
↓ NO

Can we shed load to stabilize? → YES → Rate limit / maintenance mode
↓ NO

Escalate: bring in more people, consider broader failover
```

## Phase 5: Communication

### During Incident

**Internal updates (every 15-30 min):**
```
[HH:MM UTC] Status Update
Current status: [Investigating|Mitigating|Monitoring|Resolved]

Progress:
- [What we've ruled out]
- [What we've confirmed]
- [What we're doing now]

Next update: [HH:MM UTC]
```

**Customer-facing status page:**
```
Do not speculate. Write what you know.

Investigating: "We are investigating reports of [symptom]. We will update in 30 minutes."
Identified: "We have identified the cause of [symptom] and are working on a fix."
Monitoring: "A fix has been deployed. We are monitoring to confirm resolution."
Resolved: "This incident has been resolved. [N] users were affected for [duration]."
```

### Escalation

```
Escalate when:
- You've been investigating for 15 min with no clear hypothesis
- Mitigation failed
- Data loss is occurring or suspected
- Security is involved
- You need someone with more context
```

## Phase 6: Post-Mortem

**Blameless post-mortems.** People make mistakes; systems allow them. Fix systems.

### Post-Mortem Template

```markdown
# Incident Post-Mortem: [Title]

**Date:** YYYY-MM-DD
**Duration:** HH:MM — HH:MM UTC (X hours Y minutes)
**Severity:** SEV[N]
**Incident Commander:** [Name]
**Authors:** [Names]

## Summary
[2-3 sentence summary of what happened, impact, and resolution]

## Impact
- Users affected: ~[N] users / [X]% of traffic
- Revenue impact: ~$[N]
- Duration of impact: [X] minutes

## Timeline (UTC)
- HH:MM — [event]
- HH:MM — [event]
- HH:MM — [Incident declared]
- HH:MM — [Root cause identified]
- HH:MM — [Mitigation deployed]
- HH:MM — [Incident resolved]

## Root Cause
[Technical explanation of what actually went wrong. Be specific and factual.]

## Contributing Factors
- [Factor 1: e.g., "No integration test covered this code path"]
- [Factor 2: e.g., "Monitoring alert threshold was too high"]

## What Went Well
- [What worked in the response]
- [What worked in the system]

## What Went Wrong
- [Where the response was slow]
- [Where tools/runbooks were missing]

## Action Items
| Action | Owner | Due | Priority |
|--------|-------|-----|----------|
| Add integration test for X | @dev | YYYY-MM-DD | P1 |
| Lower alert threshold for Y | @ops | YYYY-MM-DD | P1 |
| Add circuit breaker for Z | @dev | YYYY-MM-DD | P2 |

## Lessons Learned
[What should every engineer know about this system after reading this?]
```

### Action Item Principles

```
Good action items:
✓ Specific: "Add index on orders.user_id" (not "improve DB performance")
✓ Ownable: one person responsible
✓ Measurable: clear definition of done
✓ Preventing recurrence: not just "fix the bug"

Bad action items:
✗ "Be more careful" — not actionable
✗ "Monitor better" — not specific
✗ "Improve testing" — not ownable
```

## Runbook Template

Create runbooks for recurring incident types:

```markdown
# Runbook: [Incident Type]

**Symptoms:** [observable signals that trigger this runbook]
**Oncall trigger:** [alert name or condition]

## Quick Diagnosis
1. [Check X]
2. [Check Y]

## Mitigation
Option A (rollback):
  1. [Step]
  2. [Step]

Option B (restart):
  1. [Step]

## Escalation
If unresolved after 30min: page @[person] with context: [what to include]

## Prevention
[How this is prevented long-term]
```

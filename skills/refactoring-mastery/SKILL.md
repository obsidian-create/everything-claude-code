---
name: refactoring-mastery
description: Safe, confident refactoring at any scale — from renaming variables to redesigning entire modules. Covers the Strangler Fig pattern, extract-transform-replace cycles, test-first refactoring, and managing risk during large-scale code changes.
origin: ECC
---

# Refactoring Mastery

Change code structure without changing behavior — safely, incrementally, and confidently.

## When to Activate

- Code is hard to understand or modify
- Adding a feature requires changing too many places
- Tests are brittle and change-resistant
- Code violates DRY, SRP, or other design principles
- Technical debt is slowing the team

## Core Principle

**Refactor = change structure, not behavior.** If behavior changes, that is not refactoring — it is feature work. Keep them separate.

```
Red:    Tests pass (baseline)
Refactor: Change structure only
Green:  Tests still pass (behavior preserved)
```

Never refactor without a test safety net. If tests don't exist, write them first.

## The Pre-Refactor Checklist

```
Before touching code:
□ Test coverage exists for the code being changed
□ All current tests pass
□ Behavior is understood (read the code, understand the contract)
□ Scope is defined (what exactly will change and what won't)
□ Rollback plan exists (branch, feature flag, or small enough to revert)
□ Stakeholders notified (if it's a shared interface)
```

## Refactoring Catalog

### 1. Extract Function

Move a block of code with a single purpose into a named function.

```python
# BEFORE: comment explains what a block does
def process_order(order):
    # validate payment
    if order.total <= 0:
        raise ValueError("invalid total")
    if not order.payment_method:
        raise ValueError("no payment method")
    card = order.payment_method
    if card.expires < today():
        raise ValueError("card expired")

    # charge card
    result = payment_gateway.charge(card, order.total)
    ...

# AFTER: the comment becomes the function name
def process_order(order):
    validate_payment(order)
    result = charge_card(order)
    ...

def validate_payment(order):
    if order.total <= 0:
        raise ValueError("invalid total")
    if not order.payment_method:
        raise ValueError("no payment method")
    if order.payment_method.expires < today():
        raise ValueError("card expired")

def charge_card(order):
    return payment_gateway.charge(order.payment_method, order.total)
```

**Rule:** A function should do ONE thing. If you can write "and" in its description, split it.

### 2. Rename for Clarity

Names should reveal intent, not implementation.

```python
# BEFORE: cryptic names
def calc(x, lst, f=0.1):
    return sum([i[1] for i in lst if i[0] == x]) * (1 - f)

# AFTER: readable names
def calculate_order_total(user_id, order_items, discount_rate=0.1):
    user_items = [item for item in order_items if item.user_id == user_id]
    subtotal = sum(item.price for item in user_items)
    return subtotal * (1 - discount_rate)
```

**Renaming safely:**
1. Use IDE refactoring tool (not find-replace)
2. Verify all call sites updated
3. Run tests
4. Search for string literals referencing the old name (serialization, logs, tests)

### 3. Replace Magic Numbers/Strings

```python
# BEFORE: magic numbers
if user.subscription_tier == 3:
    max_requests = 10000

if response.status_code == 429:
    time.sleep(60)

# AFTER: named constants
ENTERPRISE_TIER = 3
ENTERPRISE_MAX_REQUESTS = 10_000
HTTP_RATE_LIMITED = 429
RATE_LIMIT_BACKOFF_SECONDS = 60

if user.subscription_tier == ENTERPRISE_TIER:
    max_requests = ENTERPRISE_MAX_REQUESTS

if response.status_code == HTTP_RATE_LIMITED:
    time.sleep(RATE_LIMIT_BACKOFF_SECONDS)
```

### 4. Extract Class / Module

When a class has too many responsibilities:

```python
# BEFORE: User does too much
class User:
    def validate_email(self): ...
    def hash_password(self): ...
    def send_welcome_email(self): ...
    def generate_invoice(self): ...
    def update_subscription(self): ...
    def log_activity(self): ...

# AFTER: single responsibility per class
class User:
    def __init__(self, email, password_hash): ...

class UserAuth:
    def validate_email(self, email): ...
    def hash_password(self, password): ...

class UserNotifications:
    def send_welcome_email(self, user): ...

class UserBilling:
    def generate_invoice(self, user): ...
    def update_subscription(self, user, plan): ...
```

### 5. Replace Conditional with Polymorphism

```python
# BEFORE: type-checking conditionals
def calculate_shipping(order):
    if order.type == "standard":
        return order.weight * 0.5
    elif order.type == "express":
        return order.weight * 1.5 + 10
    elif order.type == "overnight":
        return order.weight * 2 + 25
    elif order.type == "international":
        return order.weight * 3 + 50

# AFTER: polymorphism
class ShippingStrategy(ABC):
    @abstractmethod
    def calculate(self, weight: float) -> float: ...

class StandardShipping(ShippingStrategy):
    def calculate(self, weight): return weight * 0.5

class ExpressShipping(ShippingStrategy):
    def calculate(self, weight): return weight * 1.5 + 10

class OvernightShipping(ShippingStrategy):
    def calculate(self, weight): return weight * 2 + 25

# Adding new type = add new class, no existing code changes (Open/Closed)
```

### 6. Introduce Parameter Object

When a function takes many related parameters:

```python
# BEFORE: too many parameters
def create_user(first_name, last_name, email, street, city, state, zip_code, country):
    ...

# AFTER: grouped into objects
@dataclass
class Name:
    first: str
    last: str

@dataclass
class Address:
    street: str
    city: str
    state: str
    zip_code: str
    country: str

def create_user(name: Name, email: str, address: Address):
    ...
```

### 7. Replace Nested Conditionals with Guard Clauses

```python
# BEFORE: arrow code (deeply nested)
def process_payment(order):
    if order is not None:
        if order.total > 0:
            if order.payment_method is not None:
                if not order.payment_method.expired:
                    return payment_gateway.charge(order)

# AFTER: early returns (guard clauses)
def process_payment(order):
    if order is None:
        raise ValueError("order required")
    if order.total <= 0:
        raise ValueError("order total must be positive")
    if order.payment_method is None:
        raise ValueError("payment method required")
    if order.payment_method.expired:
        raise ValueError("payment method expired")

    return payment_gateway.charge(order)
```

## Large-Scale Refactoring Strategies

### Strangler Fig Pattern

For replacing a large module without big-bang rewrites:

```
1. Identify the boundary (the interface used by callers)
2. Create new implementation behind same interface
3. Route small percentage of traffic/calls to new implementation
4. Verify new implementation is correct
5. Gradually increase routing until 100%
6. Delete old implementation

Timeline: weeks to months depending on complexity
Risk: very low (incremental, reversible at each step)
```

### Branch by Abstraction

For replacing a concrete dependency:

```
1. Create abstraction (interface/protocol) over current implementation
2. Make current implementation satisfy the abstraction
3. Make production code depend on abstraction (not concrete)
4. Build new implementation satisfying the abstraction
5. Switch (via flag or config) to new implementation
6. Delete old implementation

Use when: replacing DB, cache, external API, payment provider
```

### Parallel Run

Verify new implementation correctness before switching:

```python
def get_recommendations(user_id):
    # Run both implementations
    old_result = old_recommender.get(user_id)
    new_result = new_recommender.get(user_id)

    # Log discrepancies
    if old_result != new_result:
        log_discrepancy(user_id, old_result, new_result)

    # Return old result while validating (flip when confident)
    return old_result
```

### Mikado Method

For refactoring with complex dependencies:

```
1. Make the change you want (naively)
2. See what breaks
3. Note each breakage as a prerequisite
4. Revert ALL changes
5. Pick smallest prerequisite and make that change
6. Repeat from step 2 for that change
7. Work bottom-up through the dependency graph

Result: an ordered task list where each step is safe and mergeable
```

## Test Strategy During Refactoring

### Write Characterization Tests First

When code lacks tests:

```python
# Characterization test: capture CURRENT behavior, even if wrong
def test_current_discount_behavior():
    """Captures current behavior before refactoring."""
    result = legacy_calculate_discount(order_total=100, user_tier="gold")
    # Even if this seems wrong, this is what the code currently does
    assert result == 15  # document current behavior
```

Then refactor while keeping characterization tests passing.

### Test at Multiple Levels

```
Unit tests:    each extracted function in isolation
Integration:   modules working together
Golden master: full output snapshot (serialize → compare)
```

### Approval Testing

For complex outputs:

```python
def test_invoice_generation():
    invoice = generate_invoice(sample_order)
    # First run: create golden file
    # Subsequent runs: compare against golden file
    approve(invoice.to_string(), reporter=FileLauncher())
```

## Refactoring Safety Rules

```
Rule 1: Never refactor and add features in the same commit
Rule 2: Commit after each atomic refactoring step (extract function, rename)
Rule 3: Keep refactoring PRs separate from feature PRs
Rule 4: Red → Green → Refactor (TDD cycle enforces this)
Rule 5: If tests don't exist, write them before refactoring
Rule 6: If a refactoring takes more than 2 hours, it's too big — split it
Rule 7: When in doubt, use the Mikado method
```

## Code Smell Catalog

| Smell | Symptom | Refactoring |
|---|---|---|
| Long Method | Function > 20 lines | Extract Function |
| Large Class | Class > 200 lines | Extract Class |
| Feature Envy | Method uses another class's data more than its own | Move Method |
| Data Clumps | Same 3+ params appear together | Introduce Parameter Object |
| Primitive Obsession | Using strings/ints for domain concepts | Extract Value Object |
| Switch Statements | switch/if-else on type | Replace with Polymorphism |
| Divergent Change | One class changes for many reasons | Extract Class (by SRP) |
| Shotgun Surgery | One change requires edits in many files | Move/Consolidate |
| Magic Numbers | Unexplained numeric literals | Replace with Named Constants |
| Dead Code | Unreachable or unused code | Delete it |
| Nested Callbacks | Callback hell / pyramid of doom | Promises/async-await |
| God Object | One class knows/does too much | Extract multiple classes |

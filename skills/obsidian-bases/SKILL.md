---
name: obsidian-bases
description: Create and edit Obsidian Bases (.base) files — database-like views of vault notes with filters, formulas, and multiple view types (table, cards, list, map).
origin: https://github.com/kepano/obsidian-skills
---

# Obsidian Bases

Use this skill when creating or editing `.base` files in an Obsidian vault. Bases provide database-like views over notes using YAML configuration.

## File Structure

A `.base` file is YAML. Minimal structure:

```yaml
filters:
  where:
    property: status
    operator: "=="
    value: active

views:
  - type: table
    name: Active Notes
```

## Filters

Filters narrow which notes appear. Apply globally or per view.

### Operators

| Operator | Meaning |
|----------|---------|
| `==` | equals |
| `!=` | not equals |
| `>` `<` `>=` `<=` | numeric/date comparison |

### Logical Combinators

```yaml
filters:
  where:
    and:
      - property: status
        operator: "=="
        value: active
      - property: priority
        operator: ">"
        value: 2
```

```yaml
filters:
  where:
    or:
      - property: tag
        operator: "=="
        value: project
      - property: tag
        operator: "=="
        value: task
```

## Formulas

Formulas compute values from note properties. Reference them like regular properties.

```yaml
formulas:
  progress: "if(total > 0, done / total * 100, 0)"
  age: "duration(now(), date(created)).days"
  label: "if(priority > 3, 'High', 'Normal')"
```

### Available Functions

- `if(condition, trueVal, falseVal)`
- `date(value)` — parse a date
- `now()` — current datetime
- `duration(date1, date2)` — returns duration object
- `.days`, `.hours` — access numeric parts of a duration
- `.round()` — round a number
- String concatenation with `+`

> **Important:** Use single quotes for string literals inside formulas that contain double quotes.

## Views

```yaml
views:
  - type: table
    name: All Tasks
    properties:
      - title
      - status
      - due
    groupBy: status
    limit: 50
    summary:
      done: count

  - type: cards
    name: Project Cards
    properties:
      - title
      - description
      - cover

  - type: list
    name: Simple List

  - type: map
    name: Locations
    latitudeProperty: lat
    longitudeProperty: lng
```

View types: `table`, `cards`, `list`, `map`.

## Property Types

| Category | Examples |
|----------|---------|
| Note frontmatter | `status`, `priority`, `due`, `tags` |
| File properties | `file.name`, `file.mtime`, `file.ctime`, `file.size`, `file.path` |
| Formula properties | defined under `formulas:` |

## Workflow

1. Create a `.base` file with valid YAML
2. Define scope with `filters`
3. Add `formulas` for computed properties (optional)
4. Configure one or more `views`
5. Validate YAML syntax
6. Test in Obsidian

## Examples

### Task Tracker

```yaml
filters:
  where:
    property: type
    operator: "=="
    value: task

formulas:
  overdue: "if(date(due) < now(), true, false)"

views:
  - type: table
    name: Tasks
    properties:
      - title
      - status
      - due
      - overdue
    groupBy: status
```

### Reading List

```yaml
filters:
  where:
    property: tags
    operator: "=="
    value: book

views:
  - type: cards
    name: Books
    properties:
      - title
      - author
      - status
      - rating
```

### Daily Note Index

```yaml
filters:
  where:
    property: file.name
    operator: "=="
    value: "{{date:YYYY-MM-DD}}"

views:
  - type: list
    name: Today
```

## Embedding in Markdown

```markdown
![[my-base.base]]
![[my-base.base|My View Name]]
```

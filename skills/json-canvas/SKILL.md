---
name: json-canvas
description: Create and edit JSON Canvas (.canvas) files for Obsidian — nodes (text, file, link, group), edges, colors, and layout. Use when building visual canvases or mind maps.
origin: https://github.com/kepano/obsidian-skills
---

# JSON Canvas

Use this skill when creating or editing `.canvas` files. Follows the [JSON Canvas Spec 1.0](https://jsoncanvas.org/spec/1.0/).

## File Structure

```json
{
  "nodes": [],
  "edges": []
}
```

Both arrays are optional but must be present as arrays (not null).

## Nodes

Array order determines z-index: first = bottom layer, last = top layer.

### Generic Node Attributes

| Attribute | Required | Type | Description |
|-----------|----------|------|-------------|
| `id` | Yes | string | Unique 16-char hex (e.g. `"6f0ad84f44ce9c17"`) |
| `type` | Yes | string | `text`, `file`, `link`, or `group` |
| `x` | Yes | integer | X position (top-left corner, increases right) |
| `y` | Yes | integer | Y position (top-left corner, increases down) |
| `width` | Yes | integer | Width in pixels |
| `height` | Yes | integer | Height in pixels |
| `color` | No | canvasColor | Preset `"1"`–`"6"` or hex `"#FF0000"` |

### Text Node

```json
{
  "id": "6f0ad84f44ce9c17",
  "type": "text",
  "x": 0,
  "y": 0,
  "width": 400,
  "height": 200,
  "text": "# Hello World\n\nThis is **Markdown** content."
}
```

> **Newline pitfall:** Use `\n` in JSON strings — not `\\n`. The literal `\\n` renders as the characters `\` and `n` in Obsidian.

### File Node

```json
{
  "id": "a1b2c3d4e5f67890",
  "type": "file",
  "x": 500,
  "y": 0,
  "width": 400,
  "height": 300,
  "file": "Notes/My Note.md",
  "subpath": "#Section Heading"
}
```

`subpath` is optional — links to a heading (`#Heading`) or block (`#^block-id`).

### Link Node

```json
{
  "id": "c3d4e5f678901234",
  "type": "link",
  "x": 1000,
  "y": 0,
  "width": 400,
  "height": 200,
  "url": "https://obsidian.md"
}
```

### Group Node

Groups are visual containers. Position child nodes within the group's bounds.

```json
{
  "id": "d4e5f6789012345a",
  "type": "group",
  "x": -50,
  "y": -50,
  "width": 1000,
  "height": 600,
  "label": "Project Overview",
  "color": "4",
  "background": "Attachments/bg.png",
  "backgroundStyle": "cover"
}
```

`backgroundStyle`: `cover`, `ratio`, or `repeat`.

## Edges

```json
{
  "id": "0123456789abcdef",
  "fromNode": "6f0ad84f44ce9c17",
  "fromSide": "right",
  "fromEnd": "none",
  "toNode": "a1b2c3d4e5f67890",
  "toSide": "left",
  "toEnd": "arrow",
  "color": "2",
  "label": "leads to"
}
```

| Attribute | Required | Default | Values |
|-----------|----------|---------|--------|
| `id` | Yes | — | unique hex string |
| `fromNode` | Yes | — | existing node `id` |
| `toNode` | Yes | — | existing node `id` |
| `fromSide` | No | — | `top` `right` `bottom` `left` |
| `toSide` | No | — | `top` `right` `bottom` `left` |
| `fromEnd` | No | `none` | `none` `arrow` |
| `toEnd` | No | `arrow` | `none` `arrow` |
| `color` | No | — | canvasColor |
| `label` | No | — | string |

## Colors

| Preset | Color |
|--------|-------|
| `"1"` | Red |
| `"2"` | Orange |
| `"3"` | Yellow |
| `"4"` | Green |
| `"5"` | Cyan |
| `"6"` | Purple |

Or use hex: `"#FF0000"`. Preset RGB values are app-defined.

## ID Generation

Generate 16-character lowercase hexadecimal strings (64-bit random):

```
"6f0ad84f44ce9c17"
"a3b2c1d0e9f8a7b6"
```

IDs must be unique across **both** nodes and edges in the same file.

## Layout Guidelines

- Canvas is infinite; coordinates can be negative
- `x` increases right, `y` increases down; position = top-left corner
- Space nodes 50–100px apart
- Leave 20–50px padding inside groups
- Align to grid (multiples of 10 or 20) for cleaner layouts

| Node Type | Suggested Width | Suggested Height |
|-----------|----------------|-----------------|
| Small text | 200–300 | 80–150 |
| Medium text | 300–450 | 150–300 |
| Large text | 400–600 | 300–500 |
| File preview | 300–500 | 200–400 |
| Link preview | 250–400 | 100–200 |

## Workflows

### Create a New Canvas

1. Create `.canvas` file with `{"nodes": [], "edges": []}`
2. Generate unique 16-char hex IDs for each node
3. Add nodes with required fields
4. Add edges referencing valid node IDs
5. Validate: parse JSON, verify all `fromNode`/`toNode` exist

### Add a Node

1. Read and parse the existing `.canvas` file
2. Generate a unique ID (check for collisions with existing nodes and edges)
3. Choose position avoiding overlaps (50–100px spacing)
4. Append node to `nodes` array
5. Optionally add connecting edges

### Connect Two Nodes

1. Identify source and target node IDs
2. Generate unique edge ID
3. Set `fromNode` and `toNode`
4. Optionally set `fromSide`/`toSide` and `label`
5. Append to `edges` array

## Validation Checklist

- [ ] All `id` values are unique across nodes and edges
- [ ] Every `fromNode` and `toNode` references an existing node ID
- [ ] Required fields present per type (`text` for text, `file` for file, `url` for link)
- [ ] `type` is one of: `text`, `file`, `link`, `group`
- [ ] `fromSide`/`toSide` are one of: `top`, `right`, `bottom`, `left`
- [ ] `fromEnd`/`toEnd` are one of: `none`, `arrow`
- [ ] Color presets are `"1"`–`"6"` or valid hex
- [ ] JSON is valid and parseable (no unescaped newlines in strings)

## References

- [JSON Canvas Spec 1.0](https://jsoncanvas.org/spec/1.0/)
- [JSON Canvas GitHub](https://github.com/obsidianmd/jsoncanvas)

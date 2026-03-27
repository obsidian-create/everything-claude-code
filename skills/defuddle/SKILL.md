---
name: defuddle
description: Extract clean readable Markdown from web pages using the defuddle CLI. More token-efficient than WebFetch. Use for online documentation, articles, and blog posts.
origin: https://github.com/kepano/obsidian-skills
---

# Defuddle

Use this skill when extracting content from web pages. Defuddle strips navigation, ads, and boilerplate, returning clean Markdown — saving tokens compared to raw HTML from WebFetch.

## When to Use

Prefer defuddle over WebFetch for:
- Online documentation
- Articles and blog posts
- Any standard webpage with a main content body

Use WebFetch directly for: raw JSON APIs, sitemaps, specialized data sources without prose content.

## Basic Usage

### Extract Markdown from a URL

```bash
defuddle parse <url> --md
```

### Save to File

```bash
defuddle parse <url> --md > output.md
defuddle parse <url> --md -o output.md
```

### Get Metadata Only

```bash
defuddle parse <url> --property title
defuddle parse <url> --property description
defuddle parse <url> --property domain
defuddle parse <url> --property author
defuddle parse <url> --property published
```

## Output Formats

| Flag | Output |
|------|--------|
| `--md` | Clean Markdown (default for reading) |
| `--json` | Full JSON with content + metadata |
| `--html` | Cleaned HTML |

## Token Efficiency

Defuddle removes: navigation menus, headers/footers, sidebars, cookie banners, ads, scripts, and other non-content elements. The resulting Markdown is significantly smaller than raw HTML, reducing token usage when passing content to an AI.

## Integration with Obsidian

Save extracted content directly into a vault:

```bash
defuddle parse <url> --md -o vault/Clippings/article-title.md
```

Then add frontmatter before saving for use with Obsidian Bases:

```bash
defuddle parse <url> --json | jq '{title: .title, url: .url, content: .markdown}'
```

## Examples

### Clip a Documentation Page

```bash
defuddle parse https://docs.example.com/getting-started --md
```

### Save an Article with Metadata

```bash
defuddle parse https://example.com/article --json > article.json
```

### Get Just the Title

```bash
defuddle parse https://example.com/article --property title
```

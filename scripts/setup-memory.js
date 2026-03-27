#!/usr/bin/env node
/**
 * setup-memory.js — Initialize the persistent cross-session memory system.
 *
 * Creates:
 *   ~/.claude/memory/CORE.md        — Long-term memory store (loaded every session)
 *   ~/.claude/memory/projects/      — Per-project memory files
 *   ~/.claude/memory/topics/        — Topic-based knowledge files
 *
 * Usage:
 *   node scripts/setup-memory.js
 *   node scripts/setup-memory.js --reset   (overwrites CORE.md with fresh template)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const MEMORY_DIR = path.join(os.homedir(), '.claude', 'memory');
const CORE_FILE = path.join(MEMORY_DIR, 'CORE.md');
const PROJECTS_DIR = path.join(MEMORY_DIR, 'projects');
const TOPICS_DIR = path.join(MEMORY_DIR, 'topics');

const RESET = process.argv.includes('--reset');

const CORE_TEMPLATE = `# Persistentes Gedächtnis — Kern-Wissen

> Diese Datei wird bei JEDEM neuen Claude Code Chat automatisch geladen.
> Sie ist dein dauerhaftes Gedächtnis über alle Sessions hinweg.
> Aktualisiert: ${new Date().toISOString().split('T')[0]}

---

## 👤 Persönliche Informationen

<!-- Wer du bist, deine Rolle, dein technischer Hintergrund -->
- **Erstellt:** ${new Date().toISOString().split('T')[0]}
- **Sprache:** Deutsch bevorzugt

---

## 🎯 Aktive Ziele & Projekte

<!-- Laufende Projekte und ihre aktuellen Ziele -->

---

## 🏗️ Architektur-Entscheidungen

<!-- Wichtige technische Entscheidungen die project-übergreifend gelten -->

---

## ⚙️ Arbeitsweisen & Präferenzen

<!-- Wie du arbeitest, was dir wichtig ist, bevorzugte Patterns -->
- Antworten auf Deutsch
- Präzise und direkt, ohne unnötige Erklärungen

---

## 💡 Schlüssel-Erkenntnisse

<!-- Wichtige Dinge die in früheren Sessions gelernt oder entschieden wurden -->

---

## 📝 Session-Verlauf

<!-- Chronologisches Log wichtiger Sessions -->

---

## 🔗 Wichtige Ressourcen

<!-- Links, Repos, Credentials-Hinweise, APIs die regelmäßig genutzt werden -->
`;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[setup-memory] Created: ${dir}`);
  }
}

function main() {
  // Create directories
  ensureDir(MEMORY_DIR);
  ensureDir(PROJECTS_DIR);
  ensureDir(TOPICS_DIR);

  // Create CORE.md if missing or --reset flag
  if (!fs.existsSync(CORE_FILE) || RESET) {
    fs.writeFileSync(CORE_FILE, CORE_TEMPLATE, 'utf8');
    console.log(`[setup-memory] ${RESET ? 'Reset' : 'Created'}: ${CORE_FILE}`);
  } else {
    console.log(`[setup-memory] Already exists (use --reset to overwrite): ${CORE_FILE}`);
  }

  // Create .gitignore in memory dir (don't leak personal data)
  const gitignore = path.join(MEMORY_DIR, '.gitignore');
  if (!fs.existsSync(gitignore)) {
    fs.writeFileSync(gitignore, '*\n', 'utf8');
    console.log(`[setup-memory] Created .gitignore in memory dir (keeps memory local)`);
  }

  console.log('\n[setup-memory] ✓ Memory system ready.');
  console.log(`[setup-memory] Memory file: ${CORE_FILE}`);
  console.log('[setup-memory] ');
  console.log('[setup-memory] Available commands:');
  console.log('[setup-memory]   /remember [text]  — Save something to long-term memory');
  console.log('[setup-memory]   /recall [query]   — Recall relevant memory');
  console.log('[setup-memory]   /forget [id]      — Remove a specific memory entry');
}

main();

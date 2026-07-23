import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from '@napi-rs/canvas';

const projectRoot = path.resolve('C:/Users/adrie/Documents/Cours/ESGI_4AL/IA/EchoVault');
const promptsDir = path.join(projectRoot, 'prompts_logs');
const promptsPath = path.join(promptsDir, '01_prompts_utilisateur_exacts.md');
const attachmentPath = path.join(promptsDir, '00_conversation_piece_jointe_brute.txt');
const sessionPath = 'C:/Users/adrie/.codex/sessions/2026/07/22/rollout-2026-07-22T12-09-35-019f894d-5847-7883-8215-73638a16a86b.jsonl';
const outputPath = path.join(promptsDir, 'Prompt_Log_EchoVault.pdf');

const promptMarkdown = await fs.readFile(promptsPath, 'utf8');
const attachmentRaw = await fs.readFile(attachmentPath, 'utf8');
const sessionRaw = await fs.readFile(sessionPath, 'utf8');

const entries = [];
const promptPattern = /### Prompt (\d+)\s+```text\r?\n([\s\S]*?)\r?\n```/g;
for (const match of promptMarkdown.matchAll(promptPattern)) {
  entries.push({ number: Number(match[1]), prompt: match[2] });
}
if (entries.length !== 55) throw new Error(`55 prompts attendus, ${entries.length} trouvés.`);

function normalizePrompt(text) {
  const marker = '## My request for Codex:';
  const markerIndex = text.indexOf(marker);
  if (markerIndex >= 0) text = text.slice(markerIndex + marker.length);
  return text.replace(/\r\n?/g, '\n').trim();
}

function parseAttachment(raw) {
  const starts = [...raw.matchAll(/^User: (.*)$/gm)];
  return starts.map((match, index) => {
    const bodyStart = match.index + match[0].length;
    const bodyEnd = index + 1 < starts.length ? starts[index + 1].index : raw.length;
    let output = raw.slice(bodyStart, bodyEnd).trim();
    output = output.replace(/^GitHub Copilot:\s*/, '');
    return { prompt: match[1].trim(), output };
  });
}

function messageText(payload) {
  return (payload.content ?? []).map(item => item.text ?? '').join('').trim();
}

function parseSession(raw) {
  const turns = new Map();
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let record;
    try { record = JSON.parse(line); } catch { continue; }
    if (record.type !== 'response_item' || record.payload?.type !== 'message') continue;
    const payload = record.payload;
    if (!['user', 'assistant'].includes(payload.role)) continue;
    const turnId = payload.internal_chat_message_metadata_passthrough?.turn_id;
    if (!turnId) continue;
    if (!turns.has(turnId)) turns.set(turnId, { prompt: '', outputs: [] });
    const turn = turns.get(turnId);
    const text = messageText(payload);
    if (!text) continue;
    if (payload.role === 'user') {
      if (!text.startsWith('<environment_context>')) turn.prompt = normalizePrompt(text);
    } else {
      turn.outputs.push(text);
    }
  }
  return [...turns.values()].filter(turn => turn.prompt);
}

const attachedTurns = parseAttachment(attachmentRaw);
const currentTurns = parseSession(sessionRaw);
const missing = [];
for (const entry of entries) {
  const candidates = entry.number <= 22 ? attachedTurns : currentTurns;
  const found = candidates.find(turn => normalizePrompt(turn.prompt) === normalizePrompt(entry.prompt));
  if (!found) {
    missing.push(entry.number);
    continue;
  }
  entry.output = entry.number <= 22 ? found.output : found.outputs.join('\n\n');
  if (!entry.output && entry.number <= 22) {
    entry.output = '[Aucun output reçu : le prompt suivant a été envoyé immédiatement.]';
  }
  if (!entry.output) missing.push(entry.number);
}
if (missing.length) throw new Error(`Aucun output réel trouvé pour les entrées : ${missing.join(', ')}`);

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN_X = 42;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const TOP = 46;
const BOTTOM = 40;
const COLORS = {
  navy: '#11233f', cyan: '#00a6bd', pale: '#eaf8fb', border: '#b8cbd3',
  ink: '#172033', muted: '#58677b', light: '#f7fafb', white: '#ffffff',
};

const pdf = new PDFDocument();
let ctx;
let y;
let pageNumber = 0;

function beginPage(continuation = '') {
  ctx = pdf.beginPage(PAGE_W, PAGE_H);
  pageNumber++;
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  ctx.fillStyle = '#718096';
  ctx.font = '7px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(continuation || 'EchoVault - Prompt Log', PAGE_W - MARGIN_X, 23);
  ctx.textAlign = 'left';
  ctx.fillText('Template Prompt Log', MARGIN_X, PAGE_H - 17);
  ctx.textAlign = 'right';
  ctx.fillText(String(pageNumber), PAGE_W - MARGIN_X, PAGE_H - 17);
  ctx.textAlign = 'left';
  y = TOP;
}

function endPage() { pdf.endPage(); }

function wrapLine(text, maxWidth) {
  if (text === '') return [''];
  const words = text.split(/(\s+)/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line + word;
    if (!line || ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }
    lines.push(line.trimEnd());
    line = word.trimStart();
    if (ctx.measureText(line).width > maxWidth) {
      let chunk = '';
      for (const char of line) {
        if (chunk && ctx.measureText(chunk + char).width > maxWidth) {
          lines.push(chunk);
          chunk = char;
        } else chunk += char;
      }
      line = chunk;
    }
  }
  if (line || !lines.length) lines.push(line.trimEnd());
  return lines;
}

function wrapText(text, maxWidth) {
  return text.replace(/\r/g, '').split('\n').flatMap(line => wrapLine(line, maxWidth));
}

function roundedBox(x, boxY, width, height, fill, stroke = null, radius = 5) {
  ctx.beginPath();
  ctx.roundRect(x, boxY, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawCover() {
  beginPage();
  y = 155;
  ctx.fillStyle = COLORS.cyan; ctx.font = 'bold 11px Arial';
  ctx.fillText("TEMPLATE - PROMPT LOG D'ÉQUIPE", MARGIN_X, y); y += 30;
  ctx.fillStyle = COLORS.navy; ctx.font = 'bold 34px Arial';
  ctx.fillText('PROMPT LOG', MARGIN_X, y); y += 39;
  ctx.fillText('ECHOVAULT', MARGIN_X, y); y += 30;
  ctx.fillStyle = COLORS.muted; ctx.font = '14px Arial';
  ctx.fillText('Journal fidèle des échanges utilisateur avec les assistants IA', MARGIN_X, y); y += 34;
  roundedBox(MARGIN_X, y, CONTENT_W, 62, COLORS.pale, COLORS.border);
  ctx.fillStyle = COLORS.ink; ctx.font = 'bold 10px Arial';
  ctx.fillText('RÈGLE DE TRAÇABILITÉ', MARGIN_X + 14, y + 19);
  ctx.font = '9px Arial';
  const notice = wrapText("Les prompts et les outputs réellement enregistrés sont reproduits sans réponse générique ni résultat inventé.", CONTENT_W - 28);
  notice.forEach((line, index) => ctx.fillText(line, MARGIN_X + 14, y + 37 + index * 12));
  y += 86;
  const details = [
    ['Projet', 'EchoVault'], ['Promotion', '4AL'], ['Équipe', 'Non renseignée'], ['Date édition', '23 juillet 2026'],
    ['Source 1', 'Conversation en pièce jointe'], ['Source 2', 'Conversation actuelle'],
  ];
  details.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const cellW = CONTENT_W / 2;
    const x = MARGIN_X + col * cellW;
    const cellY = y + row * 31;
    ctx.strokeStyle = COLORS.border; ctx.strokeRect(x, cellY, cellW, 31);
    ctx.fillStyle = COLORS.cyan; ctx.font = 'bold 8px Arial'; ctx.fillText(`${label} :`, x + 9, cellY + 19);
    ctx.fillStyle = COLORS.ink; ctx.font = '8px Arial'; ctx.fillText(value, x + 72, cellY + 19);
  });
  y += 112;
  const stats = [['55', 'prompts vérifiés'], ['22', 'pièce jointe'], ['33', 'conversation actuelle']];
  const gap = 10;
  const statW = (CONTENT_W - gap * 2) / 3;
  stats.forEach(([number, label], index) => {
    const x = MARGIN_X + index * (statW + gap);
    roundedBox(x, y, statW, 70, COLORS.navy);
    ctx.textAlign = 'center'; ctx.fillStyle = '#65d9e8'; ctx.font = 'bold 24px Arial'; ctx.fillText(number, x + statW / 2, y + 31);
    ctx.fillStyle = COLORS.white; ctx.font = '9px Arial'; ctx.fillText(label, x + statW / 2, y + 51);
    ctx.textAlign = 'left';
  });
  endPage();
}

function drawSection(title, subtitle) {
  beginPage();
  roundedBox(MARGIN_X, y, CONTENT_W, 54, COLORS.navy, null, 3);
  ctx.fillStyle = COLORS.cyan; ctx.fillRect(MARGIN_X, y, 6, 54);
  ctx.fillStyle = COLORS.white; ctx.font = 'bold 16px Arial'; ctx.fillText(title, MARGIN_X + 17, y + 23);
  ctx.fillStyle = '#bcd8df'; ctx.font = '9px Arial'; ctx.fillText(subtitle, MARGIN_X + 17, y + 40);
  endPage();
}

function drawEntryHeader(entry, continuation = false) {
  const attachment = entry.number <= 22;
  const source = attachment ? 'Pièce jointe' : 'Conversation actuelle';
  const tool = attachment ? 'GitHub Copilot' : 'Codex (GPT-5)';
  roundedBox(MARGIN_X, y, CONTENT_W, 56, COLORS.white, COLORS.border);
  ctx.fillStyle = COLORS.pale; ctx.fillRect(MARGIN_X + 1, y + 1, CONTENT_W - 2, 27);
  ctx.fillStyle = COLORS.navy; ctx.font = 'bold 11px Arial';
  ctx.fillText(`Entrée #${String(entry.number).padStart(3, '0')}${continuation ? ' — suite' : ''}`, MARGIN_X + 10, y + 18);
  ctx.textAlign = 'right'; ctx.fillStyle = COLORS.cyan; ctx.font = 'bold 8px Arial'; ctx.fillText(source, MARGIN_X + CONTENT_W - 10, y + 18);
  ctx.textAlign = 'left'; ctx.fillStyle = COLORS.muted; ctx.font = '8px Arial';
  ctx.fillText(`Auteur : Utilisateur     Outil : ${tool}     Projet : EchoVault`, MARGIN_X + 10, y + 44);
  y += 69;
}

function drawLabel(label) {
  ctx.fillStyle = COLORS.cyan;
  ctx.font = 'bold 8px Arial';
  ctx.fillText(label, MARGIN_X, y);
  y += 10;
}

function drawFlowingText(text, entry, section, font, lineHeight, fill, background) {
  ctx.font = font;
  const lines = wrapText(text, CONTENT_W - 20);
  let index = 0;
  while (index < lines.length) {
    const capacity = Math.max(1, Math.floor((PAGE_H - BOTTOM - y - 18) / lineHeight));
    const count = Math.min(capacity, lines.length - index);
    const boxHeight = count * lineHeight + 14;
    roundedBox(MARGIN_X, y, CONTENT_W, boxHeight, background, COLORS.border, 2);
    ctx.fillStyle = fill;
    ctx.font = font;
    for (let lineIndex = 0; lineIndex < count; lineIndex++) {
      ctx.fillText(lines[index + lineIndex], MARGIN_X + 10, y + 13 + lineIndex * lineHeight);
    }
    y += boxHeight + 10;
    index += count;
    if (index < lines.length) {
      endPage();
      beginPage(`EchoVault - Entrée #${String(entry.number).padStart(3, '0')} — ${section} (suite)`);
      drawEntryHeader(entry, true);
      drawLabel(`${section} — SUITE`);
    }
  }
}

function drawEntry(entry) {
  beginPage();
  drawEntryHeader(entry);
  drawLabel('PROMPT ENVOYÉ — TRANSCRIPTION EXACTE');
  drawFlowingText(entry.prompt, entry, 'PROMPT ENVOYÉ', '9px Consolas', 13, '#111827', COLORS.light);
  if (y > PAGE_H - BOTTOM - 55) {
    endPage();
    beginPage(`EchoVault - Entrée #${String(entry.number).padStart(3, '0')} — output`);
    drawEntryHeader(entry, true);
  }
  drawLabel('OUTPUT REÇU — TRANSCRIPTION RÉELLE');
  drawFlowingText(entry.output, entry, 'OUTPUT REÇU', '8px Arial', 11, COLORS.ink, '#f2fbfc');
  if (y > PAGE_H - BOTTOM - 32) {
    endPage();
    beginPage(`EchoVault - Entrée #${String(entry.number).padStart(3, '0')} — clôture`);
  }
  ctx.fillStyle = '#f4f7f8'; ctx.fillRect(MARGIN_X, y, CONTENT_W, 22);
  ctx.fillStyle = COLORS.muted; ctx.font = '7px Arial';
  ctx.fillText("Décision d'intégration : tracée dans le projet", MARGIN_X + 9, y + 14);
  ctx.textAlign = 'right'; ctx.fillText('Output : source réelle vérifiée', MARGIN_X + CONTENT_W - 9, y + 14); ctx.textAlign = 'left';
  endPage();
}

drawCover();
drawSection('Conversation de la pièce jointe', 'Entrées #001 à #022 — prompts et outputs réels');
for (const entry of entries) {
  if (entry.number === 23) drawSection('Conversation actuelle', 'Entrées #023 à #055 — prompts et outputs réels');
  drawEntry(entry);
}

await fs.writeFile(outputPath, pdf.close());
console.log(`PDF généré : ${outputPath} (${entries.length} prompts, ${pageNumber} pages)`);

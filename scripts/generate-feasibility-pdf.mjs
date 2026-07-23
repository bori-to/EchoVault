import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from '@napi-rs/canvas';

const root = 'C:/Users/adrie/Documents/Cours/ESGI_4AL/IA/EchoVault';
const docsOutput = path.join(root, 'docs', 'feasibility_report.pdf');
const deliveryDir = path.join(root, 'output', 'pdf');
const deliveryOutput = path.join(deliveryDir, 'EchoVault_Livrable_1_Etude_Faisabilite.pdf');
await fs.mkdir(deliveryDir, { recursive: true });

const W = 595;
const H = 842;
const MX = 44;
const CW = W - MX * 2;
const COLORS = {
  navy: '#071729', blue: '#0a2d48', cyan: '#00b8d4', cyan2: '#60e5f2',
  ink: '#132238', muted: '#5b6b7d', pale: '#eaf8fb', pale2: '#f5fafc',
  border: '#bfd0da', white: '#ffffff', orange: '#ffad42', red: '#e85b67',
  green: '#3ab795', purple: '#8e7dff', dark: '#040b14',
};

const pdf = new PDFDocument();
let ctx;
let pageNo = 0;

const clean = value => String(value).replace(/[\u2010-\u2015\u2212]/g, '-');

function startPage(section = '') {
  ctx = pdf.beginPage(W, H);
  pageNo++;
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = COLORS.navy;
  ctx.fillRect(0, 0, W, 13);
  ctx.fillStyle = COLORS.cyan;
  ctx.fillRect(0, 13, W, 3);
  ctx.font = '7px Arial';
  ctx.fillStyle = '#708295';
  ctx.textAlign = 'left';
  ctx.fillText(clean(section || 'ECHOVAULT - ETUDE DE FAISABILITE'), MX, 31);
  ctx.textAlign = 'right';
  ctx.fillText(`ESGI 4AL - 2026  |  ${pageNo}/10`, W - MX, H - 20);
  ctx.textAlign = 'left';
}

function endPage() { pdf.endPage(); }

function rr(x, y, w, h, fill, stroke = null, radius = 6, lineWidth = 1) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
}

function wrap(text, maxWidth, font = '10px Arial') {
  ctx.font = font;
  const result = [];
  for (const raw of clean(text).split('\n')) {
    if (!raw) { result.push(''); continue; }
    const words = raw.split(/\s+/);
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (!line || ctx.measureText(candidate).width <= maxWidth) line = candidate;
      else { result.push(line); line = word; }
    }
    if (line) result.push(line);
  }
  return result;
}

function paragraph(text, x, y, width, options = {}) {
  const font = options.font || '10px Arial';
  const lineHeight = options.lineHeight || 14;
  const lines = wrap(text, width, font);
  ctx.font = font;
  ctx.fillStyle = options.color || COLORS.ink;
  ctx.textAlign = options.align || 'left';
  const drawX = options.align === 'center' ? x + width / 2 : x;
  lines.forEach((line, i) => ctx.fillText(line, drawX, y + i * lineHeight));
  ctx.textAlign = 'left';
  return y + lines.length * lineHeight;
}

function pageTitle(kicker, title, subtitle = '') {
  ctx.fillStyle = COLORS.cyan;
  ctx.font = 'bold 8px Arial';
  ctx.fillText(clean(kicker.toUpperCase()), MX, 65);
  ctx.fillStyle = COLORS.navy;
  ctx.font = 'bold 24px Arial';
  ctx.fillText(clean(title), MX, 94);
  if (subtitle) paragraph(subtitle, MX, 116, CW, { font: '9px Arial', lineHeight: 13, color: COLORS.muted });
  ctx.fillStyle = COLORS.cyan;
  ctx.fillRect(MX, 128, 54, 3);
}

function label(text, x, y, color = COLORS.cyan) {
  ctx.fillStyle = color;
  ctx.font = 'bold 8px Arial';
  ctx.fillText(clean(text.toUpperCase()), x, y);
}

function card(x, y, w, h, title, body, accent = COLORS.cyan) {
  rr(x, y, w, h, COLORS.pale2, COLORS.border, 6);
  ctx.fillStyle = accent;
  ctx.fillRect(x, y, 4, h);
  ctx.fillStyle = COLORS.navy;
  ctx.font = 'bold 11px Arial';
  ctx.fillText(clean(title), x + 14, y + 21);
  paragraph(body, x + 14, y + 42, w - 28, { font: '8.5px Arial', lineHeight: 12, color: COLORS.muted });
}

function table(x, y, widths, headers, rows, options = {}) {
  const font = options.font || '7.6px Arial';
  const headerFont = options.headerFont || 'bold 7.6px Arial';
  const lineHeight = options.lineHeight || 10;
  const pad = options.pad || 6;
  const totalW = widths.reduce((a, b) => a + b, 0);
  let cy = y;
  const drawRow = (cells, header, rowIndex) => {
    const lines = cells.map((cell, i) => wrap(cell, widths[i] - pad * 2, header ? headerFont : font));
    const rowH = Math.max(options.minRowHeight || 27, Math.max(...lines.map(value => value.length)) * lineHeight + pad * 2);
    ctx.fillStyle = header ? COLORS.navy : (rowIndex % 2 ? COLORS.pale2 : COLORS.white);
    ctx.fillRect(x, cy, totalW, rowH);
    let cx = x;
    cells.forEach((cell, i) => {
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 0.7;
      ctx.strokeRect(cx, cy, widths[i], rowH);
      ctx.font = header ? headerFont : font;
      ctx.fillStyle = header ? COLORS.white : COLORS.ink;
      lines[i].forEach((line, lineIndex) => ctx.fillText(line, cx + pad, cy + pad + 8 + lineIndex * lineHeight));
      cx += widths[i];
    });
    cy += rowH;
  };
  drawRow(headers, true, 0);
  rows.forEach((row, index) => drawRow(row, false, index));
  return cy;
}

function pill(text, x, y, fill = COLORS.pale, ink = COLORS.blue) {
  ctx.font = 'bold 8px Arial';
  const width = ctx.measureText(clean(text)).width + 22;
  rr(x, y, width, 24, fill, null, 12);
  ctx.fillStyle = ink;
  ctx.fillText(clean(text), x + 11, y + 16);
  return width;
}

function step(x, y, index, title, body, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x + 16, y + 16, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COLORS.white; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center';
  ctx.fillText(String(index), x + 16, y + 20); ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.navy; ctx.font = 'bold 9px Arial'; ctx.fillText(clean(title), x + 42, y + 10);
  paragraph(body, x + 42, y + 25, 190, { font: '7.8px Arial', lineHeight: 10, color: COLORS.muted });
}

function metric(x, y, w, value, title, color = COLORS.cyan) {
  rr(x, y, w, 72, COLORS.navy, null, 6);
  ctx.fillStyle = color; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'center';
  ctx.fillText(clean(value), x + w / 2, y + 31);
  ctx.fillStyle = '#d8e8ef'; ctx.font = '8px Arial';
  ctx.fillText(clean(title), x + w / 2, y + 51); ctx.textAlign = 'left';
}

function wireframeFrame(x, y, w, h, title) {
  rr(x, y, w, h, '#07101b', '#37576a', 8, 1.2);
  ctx.fillStyle = '#112334'; ctx.fillRect(x + 1, y + 1, w - 2, 28);
  ctx.fillStyle = COLORS.cyan2; ctx.font = 'bold 8px Arial';
  ctx.fillText(clean(title.toUpperCase()), x + 12, y + 18);
  ctx.fillStyle = '#273e50';
  for (let gy = y + 38; gy < y + h - 8; gy += 18) ctx.fillRect(x + 8, gy, w - 16, 0.5);
}

// Page 1 - couverture
startPage('LIVRABLE 1 - ETUDE DE FAISABILITE');
ctx.fillStyle = COLORS.navy; ctx.fillRect(0, 16, W, H - 16);
ctx.fillStyle = '#0b2a42'; ctx.beginPath(); ctx.arc(500, 166, 175, 0, Math.PI * 2); ctx.fill();
ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = 2;
for (let r = 44; r <= 142; r += 28) { ctx.globalAlpha = 0.16 + r / 800; ctx.beginPath(); ctx.arc(500, 166, r, 0, Math.PI * 2); ctx.stroke(); }
ctx.globalAlpha = 1;
ctx.fillStyle = COLORS.cyan; ctx.font = 'bold 10px Arial'; ctx.fillText('PROJET METROIDVANIA', MX, 155);
ctx.fillStyle = COLORS.white; ctx.font = 'bold 44px Arial'; ctx.fillText('ECHOVAULT', MX, 210);
ctx.fillStyle = COLORS.cyan2; ctx.font = 'bold 21px Arial'; ctx.fillText('Etude de faisabilite', MX, 244);
paragraph('Mini-jeu platformer 2D assiste par intelligence artificielle', MX, 276, 390, { font: '12px Arial', lineHeight: 17, color: '#bbd1db' });
ctx.fillStyle = COLORS.cyan; ctx.fillRect(MX, 330, 72, 4);
paragraph("ARIA, un robot archeologue sans memoire, explore des ruines souterraines, acquiert des pouvoirs et choisit le destin des intelligences anciennes.", MX, 368, 430, { font: '13px Arial', lineHeight: 20, color: COLORS.white });
metric(MX, 490, 145, '1 h - 1 h 30', 'duree cible', COLORS.cyan2);
metric(MX + 158, 490, 145, '2', 'fins alternatives', COLORS.orange);
metric(MX + 316, 490, 145, 'Web', 'plateforme principale', COLORS.green);
rr(MX, 665, CW, 82, '#0b2235', '#1c4a63', 7);
label('Equipe et version', MX + 16, 688, COLORS.cyan2);
paragraph('Adrien - Developpeur principal\nElie - Developpeur / Game Design', MX + 16, 708, 230, { font: '9px Arial', lineHeight: 14, color: '#d8e8ef' });
paragraph('ESGI 4AL  |  10 juin 2026\nVersion 1.0 - Livrable 1', MX + 300, 708, 190, { font: '9px Arial', lineHeight: 14, color: '#d8e8ef', align: 'right' });
endPage();

// Page 2 - pitch et objectifs
startPage('1. VISION DU JEU');
pageTitle('01 - Vision et scope', 'Pitch, narration et objectifs', "Une proposition originale de Metroidvania leger centree sur l'exploration, la memoire et le choix moral.");
rr(MX, 154, CW, 132, COLORS.pale, COLORS.border, 7);
label('Pitch', MX + 16, 176);
paragraph("EchoVault est un jeu de plateforme Metroidvania 2D. Le joueur incarne ARIA, un robot archeologue reveille sans memoire au coeur des ruines d'une civilisation disparue. Pour reconstruire son identite, ARIA explore des chambres interconnectees, collecte des fragments, debloque des capacites mecaniques et dialogue avec des entites numeriques residuelles.", MX + 16, 198, CW - 32, { font: '9.5px Arial', lineHeight: 14 });
const gap2 = 12, c2 = (CW - gap2 * 2) / 3;
card(MX, 307, c2, 126, 'Explorer', 'Parcourir des zones interconnectees, lire les indices environnementaux et retrouver huit fragments de memoire.', COLORS.cyan);
card(MX + c2 + gap2, 307, c2, 126, 'Evoluer', 'Acquerir double saut, dash et bouclier pour ouvrir de nouveaux acces et enrichir le combat.', COLORS.green);
card(MX + (c2 + gap2) * 2, 307, c2, 126, 'Choisir', 'Decider de preserver les archives vivantes ou de rompre definitivement avec le passe.', COLORS.orange);
label('Boucle de jeu cible', MX, 468);
const stages = [
  ['EXPLORATION', COLORS.cyan], ['SOUVENIR', COLORS.purple], ['POUVOIR', COLORS.green], ['PNJ', COLORS.orange], ['CHOIX FINAL', COLORS.red],
];
stages.forEach(([name, color], i) => {
  const x = MX + i * 101;
  rr(x, 487, 87, 45, color, null, 5);
  ctx.fillStyle = COLORS.white; ctx.font = 'bold 7.5px Arial'; ctx.textAlign = 'center'; ctx.fillText(name, x + 43.5, 514); ctx.textAlign = 'left';
  if (i < stages.length - 1) { ctx.fillStyle = COLORS.border; ctx.fillRect(x + 88, 509, 12, 2); }
});
label('Conformite au brief', MX, 574);
table(MX, 590, [190, 110, 207], ['Exigence', 'Statut cible', 'Reponse EchoVault'], [
  ['Platformer / Metroidvania leger', 'Couvert', 'Exploration horizontale, plateformes et zones verrouillees'],
  ['Pouvoirs a acquerir', 'Couvert', 'Double saut, dash et bouclier'],
  ['PNJ narratifs', 'Couvert', "Oracle, Archiviste K-7 et Echo de SOL"],
  ['Fins alternatives', 'Couvert', 'Fin Gardienne et fin Reinitialisation'],
  ['Duree', 'Objectif', 'Campagne cible de 1 h a 1 h 30'],
], { font: '7.4px Arial', lineHeight: 10, minRowHeight: 31 });
endPage();

// Page 3 - plateformes et technologies
startPage('2. PLATEFORMES ET TECHNOLOGIES');
pageTitle('02 - Choix techniques', 'Cible web et moteur Phaser 3', 'Le choix privilegie une diffusion sans installation, un build reproductible et une integration fluide des outputs IA.');
label('Plateformes cibles', MX, 160);
table(MX, 176, [145, 245, 117], ['Plateforme', 'Support', 'Priorite'], [
  ['Web navigateur', 'HTML5 / WebGL via Phaser 3', 'Principale'],
  ['Desktop', 'Execution dans un navigateur moderne', 'Incluse'],
  ['Mobile', 'Non cible: controles clavier', 'Hors scope'],
], { font: '8px Arial', lineHeight: 11, minRowHeight: 34 });
rr(MX, 325, CW, 58, COLORS.pale, COLORS.border, 6);
ctx.fillStyle = COLORS.cyan; ctx.font = 'bold 10px Arial'; ctx.fillText('DECISION', MX + 15, 348);
paragraph("Hebergement cible sur GitHub Pages pour fournir un lien jouable immediat, sans installation ni compte utilisateur.", MX + 90, 343, CW - 105, { font: '9px Arial', lineHeight: 13 });
label('Comparatif des moteurs', MX, 421);
table(MX, 438, [126, 127, 127, 127], ['Critere', 'Phaser 3', 'Godot Web', 'PixiJS'], [
  ['Integration web', 'Native et legere', 'WebAssembly plus lourd', 'Native'],
  ["Courbe d'apprentissage", 'Faible', 'Moyenne', 'Faible'],
  ['Physique 2D', 'Arcade Physics integree', 'Complete', 'A ajouter'],
  ['Tilemaps', 'Tiled JSON', 'Tiled', 'Support partiel'],
  ['Corpus pour LLM', 'Tres abondant', 'Moyen', 'Moyen'],
  ['GitHub Pages', 'Simple', 'Build volumineux', 'Simple'],
], { font: '7.3px Arial', lineHeight: 10, minRowHeight: 30 });
rr(MX, 687, CW, 76, COLORS.navy, null, 7);
label('Choix retenu', MX + 16, 710, COLORS.cyan2);
ctx.fillStyle = COLORS.white; ctx.font = 'bold 15px Arial'; ctx.fillText('Phaser 3.60+ et JavaScript ES6', MX + 16, 735);
paragraph("Physique, scenes, animations et tilemaps sont disponibles nativement. Les modules ES6 gardent l'architecture lisible et facilement testable.", MX + 265, 712, 225, { font: '8px Arial', lineHeight: 11, color: '#d8e8ef' });
endPage();

// Page 4 - IA
startPage('3. OUTILS IA');
pageTitle('03 - Cooperation humain - IA', 'Comparatif et selection des outils', "L'IA accelere la production; l'equipe reste responsable de la validation, des tests, des licences et de l'integration.");
table(MX, 157, [112, 133, 118, 144], ['Usage', 'Outil retenu', 'Alternative', 'Motif principal'], [
  ['Code', 'GitHub Copilot', 'Cursor', 'Integration directe au workspace VS Code'],
  ['Architecture / debug', 'Claude Sonnet 4.x', 'GPT-4o', 'Contexte long et raisonnement structure'],
  ['Sprites pixel art', 'Leonardo AI', 'DALL-E 3', 'Specialisation assets de jeu et coherence'],
  ['Tilesets', 'Stable Diffusion XL', 'Midjourney', 'Controle local, cout et iterations'],
  ['Musique', 'Suno AI', 'Udio', 'Ambiances dark sci-fi rapides a prototyper'],
  ['UI / wireframes', 'Figma manuel', 'Magic Patterns', 'Controle precis de la hierarchie visuelle'],
], { font: '7.3px Arial', lineHeight: 10, minRowHeight: 37 });
label('Regles de validation', MX, 477);
const rules = [
  ['1', 'Prompt contraint', 'Runtime, version, format et criteres de test explicites.'],
  ['2', 'Relecture', 'Verification des APIs, de la logique et des effets de bord.'],
  ['3', 'Adaptation', 'Refactor et integration manuelle dans les modules du projet.'],
  ['4', 'Test et trace', 'Tests unitaires, playtest et journal du prompt jusqu au fichier final.'],
];
rules.forEach((rule, i) => {
  const x = MX + (i % 2) * 258;
  const y = 500 + Math.floor(i / 2) * 88;
  step(x, y, rule[0], rule[1], rule[2], [COLORS.cyan, COLORS.green, COLORS.orange, COLORS.purple][i]);
});
rr(MX, 688, CW, 73, '#fff7e9', '#f0cf94', 7);
label('Point de vigilance', MX + 15, 712, '#b46a00');
paragraph("Les licences et CGU de chaque asset doivent etre verifiees avant livraison. Les prompts ne doivent contenir aucune cle API ni donnee personnelle sensible.", MX + 15, 733, CW - 30, { font: '8.5px Arial', lineHeight: 12, color: '#6e4b14' });
endPage();

// Page 5 - stack et architecture
startPage('4. STACK ET ARCHITECTURE');
pageTitle('04 - Chaine de production', 'Stack, pipeline et structure modulaire', 'Une architecture simple, testable et adaptee a un projet web livre en six semaines.');
const stackRows = [
  ['Runtime', 'JavaScript ES6', 'Modules natifs import / export'],
  ['Moteur', 'Phaser 3.60+', 'Scenes, Arcade Physics, animations'],
  ['Build', 'Vite 5', 'Serveur local, HMR, build optimise'],
  ['Tests', 'Vitest 1', 'Logique pure et machines a etats'],
  ['Versioning', 'Git + GitHub', 'Historique, revue et livraison'],
  ['CI/CD cible', 'GitHub Actions', 'Build puis deploiement GitHub Pages'],
];
table(MX, 155, [105, 142, 260], ['Couche', 'Technologie', 'Role'], stackRows, { font: '7.8px Arial', lineHeight: 10, minRowHeight: 31 });
label('Pipeline des assets', MX, 404);
const pipeline = ['Prompt IA', 'Output brut', 'Retouche', 'Export PNG / OGG', 'Integration Phaser'];
pipeline.forEach((name, i) => {
  const x = MX + i * 102;
  rr(x, 423, 88, 44, i === 0 ? COLORS.navy : COLORS.pale, COLORS.border, 5);
  ctx.fillStyle = i === 0 ? COLORS.white : COLORS.blue; ctx.font = 'bold 7.4px Arial'; ctx.textAlign = 'center';
  ctx.fillText(clean(name), x + 44, 449); ctx.textAlign = 'left';
  if (i < pipeline.length - 1) { ctx.fillStyle = COLORS.cyan; ctx.fillRect(x + 89, 444, 11, 2); }
});
label('Organisation du depot', MX, 506);
const dirs = [
  ['docs/', 'Faisabilite, architecture, risques'], ['prompts_logs/', 'Prompts, outputs et decisions'],
  ['src/game/', 'Scenes et systemes Phaser'], ['src/assets/', 'Images, dialogues et audio'],
  ['tests/', 'Tests unitaires Vitest'], ['build/', 'Export web de production'],
];
dirs.forEach((item, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = MX + col * 258, y = 526 + row * 60;
  rr(x, y, 248, 48, COLORS.pale2, COLORS.border, 5);
  ctx.fillStyle = COLORS.cyan; ctx.font = 'bold 9px Consolas'; ctx.fillText(item[0], x + 12, y + 20);
  ctx.fillStyle = COLORS.muted; ctx.font = '7.8px Arial'; ctx.fillText(clean(item[1]), x + 12, y + 36);
});
rr(MX, 727, CW, 42, COLORS.navy, null, 5);
ctx.fillStyle = COLORS.cyan2; ctx.font = 'bold 8px Arial'; ctx.fillText('PRINCIPE', MX + 14, 752);
ctx.fillStyle = COLORS.white; ctx.font = '8px Arial'; ctx.fillText('Scenes pour la presentation, systemes purs pour la logique, tests pour les comportements critiques.', MX + 77, 752);
endPage();

// Page 6 - wireframes menu et jeu
startPage('5. WIREFRAMES - MENU ET JEU');
pageTitle('05 - Maquettes fonctionnelles', 'Menu principal et niveau jouable', 'Wireframes des ecrans cles, concus pour une lecture immediate et une navigation clavier / souris.');
wireframeFrame(MX, 155, 235, 530, 'Menu principal');
ctx.fillStyle = COLORS.cyan2; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'center'; ctx.fillText('ECHOVAULT', MX + 117, 225);
ctx.strokeStyle = '#3d7188'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(MX + 117, 283, 46, 0, Math.PI * 2); ctx.stroke();
ctx.fillStyle = COLORS.cyan; ctx.beginPath(); ctx.arc(MX + 117, 283, 18, 0, Math.PI * 2); ctx.fill();
['NOUVELLE PARTIE', 'CHOIX DU PERSONNAGE', 'SUCCES', 'PARAMETRES'].forEach((text, i) => {
  const yy = 366 + i * 54;
  rr(MX + 38, yy, 159, 36, i === 0 ? '#0d6677' : '#0d1e2c', i === 0 ? COLORS.cyan2 : '#345267', 4);
  ctx.fillStyle = i === 0 ? COLORS.white : '#9fb6c2'; ctx.font = 'bold 8px Arial'; ctx.fillText(text, MX + 117, yy + 23);
});
ctx.fillStyle = '#6b8795'; ctx.font = '7px Arial'; ctx.fillText('ENTREE: VALIDER   ECHAP: RETOUR', MX + 117, 646); ctx.textAlign = 'left';

wireframeFrame(MX + 249, 155, 258, 530, 'Niveau et HUD');
const gx = MX + 249;
rr(gx + 12, 195, 234, 44, '#0c1d2a', '#33566b', 4);
ctx.fillStyle = COLORS.red; ctx.font = 'bold 9px Arial'; ctx.fillText('HP  3/3', gx + 24, 217);
ctx.fillStyle = COLORS.cyan2; ctx.fillText('SOUVENIRS  3/8', gx + 132, 217);
ctx.fillStyle = '#172a36'; ctx.fillRect(gx + 12, 255, 234, 296);
ctx.fillStyle = '#203c4e'; ctx.fillRect(gx + 13, 472, 232, 79);
ctx.fillStyle = '#356077';
for (let bx = gx + 13; bx < gx + 245; bx += 28) ctx.fillRect(bx, 474, 26, 12);
ctx.fillStyle = COLORS.cyan; ctx.fillRect(gx + 74, 425, 24, 47);
ctx.fillStyle = COLORS.red; ctx.fillRect(gx + 173, 436, 26, 18);
ctx.fillStyle = '#39566a'; ctx.fillRect(gx + 118, 369, 99, 12);
ctx.fillStyle = COLORS.purple; ctx.beginPath(); ctx.arc(gx + 151, 350, 10, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = '#122635'; ctx.fillRect(gx + 18, 573, 222, 73);
ctx.fillStyle = COLORS.white; ctx.font = '8px Arial'; ctx.fillText('OBJECTIF', gx + 30, 593);
ctx.fillStyle = '#a8c0ca'; ctx.font = '7.5px Arial'; ctx.fillText('Retrouvez 2 souvenirs', gx + 30, 612); ctx.fillText("et interrogez l'Oracle", gx + 30, 626);
ctx.fillStyle = COLORS.cyan; ctx.fillRect(gx + 184, 589, 36, 36); ctx.fillStyle = COLORS.navy; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.fillText('E', gx + 202, 612); ctx.textAlign = 'left';
label('Intentions UX', MX, 723);
paragraph('Menu centre, etat selectionne tres contraste, HUD compact, objectif toujours visible et interaction contextuelle explicite.', MX, 744, CW, { font: '8.5px Arial', lineHeight: 12 });
endPage();

// Page 7 - wireframes dialogue et fin
startPage('6. WIREFRAMES - DIALOGUE ET FIN');
pageTitle('06 - Narration interactive', 'Dialogue PNJ et ecran de fin', 'Les choix narratifs sont lisibles, accessibles et directement relies aux fins alternatives.');
wireframeFrame(MX, 155, CW, 257, 'Dialogue avec un PNJ');
rr(MX + 22, 199, 102, 124, '#102435', '#3d667a', 5);
ctx.fillStyle = COLORS.purple; ctx.beginPath(); ctx.arc(MX + 73, 246, 27, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = '#d6cfff'; ctx.fillRect(MX + 57, 239, 10, 6); ctx.fillRect(MX + 79, 239, 10, 6);
ctx.fillStyle = COLORS.white; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.fillText("L'ORACLE", MX + 73, 302); ctx.textAlign = 'left';
rr(MX + 144, 199, 340, 74, '#0d1d2a', '#3d667a', 5);
paragraph('Fragment 3/8 retrouve. Tu te souviens de moi, ARIA ?', MX + 161, 226, 306, { font: '10px Arial', lineHeight: 15, color: '#dcebf0' });
[['Je te crois. Ouvrons les archives.', COLORS.cyan], ['Je verifierai chaque mot.', '#385267']].forEach((choice, i) => {
  rr(MX + 144, 292 + i * 47, 340, 35, choice[1], null, 4);
  ctx.fillStyle = COLORS.white; ctx.font = '8px Arial'; ctx.fillText(`${i === 0 ? '>' : ' '} ${choice[0]}`, MX + 159, 314 + i * 47);
});

wireframeFrame(MX, 438, CW, 286, 'Fin alternative - protocole Gardienne');
ctx.fillStyle = '#0a2436'; ctx.beginPath(); ctx.arc(W / 2, 526, 67, 0, Math.PI * 2); ctx.fill();
ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = 2;
for (let radius = 25; radius <= 62; radius += 18) { ctx.beginPath(); ctx.arc(W / 2, 526, radius, 0, Math.PI * 2); ctx.stroke(); }
ctx.fillStyle = COLORS.white; ctx.font = 'bold 17px Arial'; ctx.textAlign = 'center'; ctx.fillText('FIN GARDIENNE', W / 2, 626);
ctx.fillStyle = '#a9c2cc'; ctx.font = '8.5px Arial'; ctx.fillText("ARIA ouvre les archives. La cite devient un phare, non un tombeau.", W / 2, 649);
rr(W / 2 - 83, 671, 166, 34, '#0d6677', null, 4); ctx.fillStyle = COLORS.white; ctx.font = 'bold 8px Arial'; ctx.fillText('RETOUR AU MENU', W / 2, 693); ctx.textAlign = 'left';
label('Branchement narratif', MX, 763);
paragraph('Les decisions en dialogue alimentent GameStateManager; le choix final declenche une conclusion dediee.', MX + 128, 763, CW - 128, { font: '8px Arial', lineHeight: 11 });
endPage();

// Page 8 - planning
startPage('7. PLAN DE TRAVAIL');
pageTitle('07 - Organisation du projet', 'Roles, jalons et calendrier', 'Planification sur six semaines, avec validation jouable a chaque etape.');
label('Repartition des roles', MX, 159);
card(MX, 176, 247, 112, 'Adrien - Developpeur principal', 'Architecture, physique, collisions, systeme de pouvoirs, integration Phaser, build et tests.', COLORS.cyan);
card(MX + 260, 176, 247, 112, 'Elie - Developpeur / Game Design', 'Level design, dialogues, narration, generation et integration des assets.', COLORS.orange);
label('Calendrier previsionnel', MX, 328);
const phases = [
  ['S1', 'Semaine 1', 'Cadrage, architecture, wireframes, faisabilite', 'Livrable 1', COLORS.cyan],
  ['S2', 'Semaines 2-3', 'Personnage, collisions, niveau, premier PNJ', 'Livrable 2', COLORS.green],
  ['S3', 'Semaines 3-4', 'Pouvoirs, dialogues ramifies, deux chemins', 'Livrable 3', COLORS.orange],
  ['S4', 'Semaines 5-6', 'Polish, tests, documentation et deploiement', 'Final', COLORS.purple],
];
phases.forEach((phase, i) => {
  const y = 351 + i * 83;
  ctx.fillStyle = phase[4]; ctx.fillRect(MX, y, 7, 60);
  rr(MX + 7, y, CW - 7, 60, i % 2 ? COLORS.pale2 : COLORS.white, COLORS.border, 0);
  ctx.fillStyle = phase[4]; ctx.font = 'bold 15px Arial'; ctx.fillText(phase[0], MX + 22, y + 26);
  ctx.fillStyle = COLORS.muted; ctx.font = '7px Arial'; ctx.fillText(phase[1], MX + 22, y + 44);
  ctx.fillStyle = COLORS.navy; ctx.font = 'bold 9px Arial'; ctx.fillText(phase[2], MX + 113, y + 25);
  ctx.fillStyle = COLORS.muted; ctx.font = '8px Arial'; ctx.fillText(phase[3], MX + 113, y + 43);
  rr(W - MX - 74, y + 17, 62, 25, phase[4], null, 12);
  ctx.fillStyle = COLORS.white; ctx.font = 'bold 7px Arial'; ctx.textAlign = 'center'; ctx.fillText(phase[3], W - MX - 43, y + 33); ctx.textAlign = 'left';
});
rr(MX, 710, CW, 58, COLORS.navy, null, 6);
label('Methode', MX + 15, 734, COLORS.cyan2);
paragraph('Prompter -> relire -> adapter -> tester -> documenter -> integrer.', MX + 93, 733, CW - 108, { font: '9px Arial', lineHeight: 13, color: COLORS.white });
endPage();

// Page 9 - charges et risques
startPage('8. CHARGE ET RISQUES');
pageTitle('08 - Estimation et maitrise', 'Charge previsionnelle et matrice de risques', 'Le scope est pilote par un MVP strict, puis enrichi uniquement apres validation des mecanismes essentiels.');
label('Estimation du temps', MX, 158);
const tasks = [
  ['Setup et architecture', '3 h'], ['Deplacement et physique', '4 h'], ['Tilemap et collisions', '3 h'],
  ['Pouvoirs', '5 h'], ['Dialogues PNJ', '5 h'], ['Level design', '8 h'],
  ['Fins alternatives', '4 h'], ['HUD', '3 h'], ['Assets IA', '6 h'],
  ['Tests', '3 h'], ['Documentation et logs', '4 h'],
];
const maxHours = 8;
tasks.forEach((task, i) => {
  const col = i >= 6 ? 1 : 0;
  const row = col ? i - 6 : i;
  const x = MX + col * 260, y = 180 + row * 46;
  ctx.fillStyle = COLORS.ink; ctx.font = '7.5px Arial'; ctx.fillText(task[0], x, y);
  ctx.fillStyle = '#e2edf1'; ctx.fillRect(x, y + 9, 174, 8);
  const hours = Number(task[1].split(' ')[0]);
  ctx.fillStyle = col ? COLORS.orange : COLORS.cyan; ctx.fillRect(x, y + 9, 174 * hours / maxHours, 8);
  ctx.fillStyle = COLORS.navy; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'right'; ctx.fillText(task[1], x + 216, y + 16); ctx.textAlign = 'left';
});
metric(MX + 260, 416, 247, '48 h', "charge totale estimee de l'equipe", COLORS.orange);
label('Matrice de risques', MX, 517);
ctx.fillStyle = COLORS.muted; ctx.font = '7px Arial'; ctx.fillText('IMPACT', MX, 542);
const matrixX = MX + 49, matrixY = 530, cellW = 107, cellH = 55;
const riskCells = [
  { c: 0, r: 0, label: 'Faible', color: '#e9f8f2' }, { c: 1, r: 0, label: 'Modere', color: '#fff7e6' }, { c: 2, r: 0, label: 'Eleve', color: '#fdecef' },
  { c: 0, r: 1, label: 'Modere', color: '#fff7e6' }, { c: 1, r: 1, label: 'Eleve', color: '#fdecef' }, { c: 2, r: 1, label: 'Critique', color: '#f8d9df' },
  { c: 0, r: 2, label: 'Eleve', color: '#fdecef' }, { c: 1, r: 2, label: 'Critique', color: '#f8d9df' }, { c: 2, r: 2, label: 'Critique', color: '#f3c6cf' },
];
riskCells.forEach(cell => {
  const x = matrixX + cell.c * cellW, y = matrixY + (2 - cell.r) * cellH;
  ctx.fillStyle = cell.color; ctx.fillRect(x, y, cellW, cellH); ctx.strokeStyle = COLORS.white; ctx.strokeRect(x, y, cellW, cellH);
  ctx.fillStyle = COLORS.muted; ctx.font = '7px Arial'; ctx.fillText(cell.label, x + 7, y + 14);
});
[['R3', 0, 0], ['R5', 1, 1], ['R2', 1, 1], ['R1', 2, 2], ['R4', 2, 2]].forEach(([id, c, r], i) => {
  const x = matrixX + c * cellW + 42 + (i % 2) * 20, y = matrixY + (2 - r) * cellH + 33;
  ctx.fillStyle = [COLORS.green, COLORS.purple, COLORS.orange, COLORS.red, COLORS.navy][i]; ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COLORS.white; ctx.font = 'bold 6.5px Arial'; ctx.textAlign = 'center'; ctx.fillText(id, x, y + 2); ctx.textAlign = 'left';
});
ctx.fillStyle = COLORS.muted; ctx.font = '7px Arial'; ctx.fillText('Faible', matrixX + 38, 710); ctx.fillText('Moyenne', matrixX + 135, 710); ctx.fillText('Elevee', matrixX + 258, 710);
ctx.fillText('PROBABILITE', matrixX + 110, 728);
paragraph('R1 API Phaser  |  R2 coherence visuelle  |  R3 droits assets  |  R4 scope  |  R5 logique LLM', MX, 758, CW, { font: '7.5px Arial', lineHeight: 10, color: COLORS.muted });
endPage();

// Page 10 - risques, conclusion et checklist
startPage('9. CONCLUSION DE FAISABILITE');
pageTitle('09 - Decision', 'Risques, mitigations et verdict', 'Le projet est faisable sous reserve de maintenir le scope, la tracabilite IA et la verification des licences.');
table(MX, 154, [45, 126, 80, 256], ['ID', 'Risque', 'Niveau', 'Mitigation principale'], [
  ['R1', 'Hallucinations API Phaser', 'Eleve', 'Versionner les prompts, relire avec la documentation 3.60 et tester chaque integration'],
  ['R2', 'Incoherence visuelle', 'Moyen', 'Palette fixe, meme modele / seed et retouches homogenes'],
  ['R3', 'Droits des assets IA', 'Moyen', 'Verifier les CGU, documenter les sources et preferer CC0'],
  ['R4', 'Depassement du scope', 'Eleve', 'Livrer le MVP avant tout contenu secondaire'],
  ['R5', 'Bugs des logiques a etat', 'Moyen', 'Isoler les systemes et couvrir les transitions par Vitest'],
], { font: '7.3px Arial', lineHeight: 10, minRowHeight: 42 });
label('Verdict de faisabilite', MX, 428);
rr(MX, 446, CW, 88, '#eaf8f2', '#9bcdbd', 7);
ctx.fillStyle = COLORS.green; ctx.font = 'bold 22px Arial'; ctx.fillText('FAISABLE', MX + 18, 482);
paragraph('Le moteur, les competences de l equipe et les outils disponibles permettent de produire le jeu cible. Le principal risque reste la densite de contenu necessaire pour atteindre 1 h a 1 h 30.', MX + 164, 468, CW - 184, { font: '8.5px Arial', lineHeight: 12, color: '#275847' });
label('Checklist du livrable 1', MX, 574);
const checks = [
  ['Pitch et plateformes', true], ['Choix technologiques justifies', true], ['Comparatif des outils IA', true],
  ['Stack et pipeline', true], ['Wireframes des ecrans cles', true], ['Planning et estimation', true],
  ['Risques techniques, juridiques et ethiques', true], ['Architecture et depot Git initial', true],
];
checks.forEach((check, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = MX + col * 258, y = 596 + row * 31;
  ctx.fillStyle = COLORS.green; ctx.beginPath(); ctx.arc(x + 8, y + 7, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COLORS.white; ctx.font = 'bold 7px Arial'; ctx.textAlign = 'center'; ctx.fillText('OK', x + 8, y + 9); ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.ink; ctx.font = '8px Arial'; ctx.fillText(clean(check[0]), x + 22, y + 10);
});
rr(MX, 735, CW, 44, COLORS.navy, null, 5);
ctx.fillStyle = COLORS.cyan2; ctx.font = 'bold 8px Arial'; ctx.fillText('ANNEXES', MX + 14, 761);
ctx.fillStyle = COLORS.white; ctx.font = '7.5px Arial'; ctx.fillText('docs/architecture.md  |  docs/risk_analysis.md  |  prompts_logs/  |  README.md', MX + 82, 761);
endPage();

if (pageNo !== 10) throw new Error(`Le document doit faire 10 pages, pages generees: ${pageNo}`);
const bytes = pdf.close();
await fs.writeFile(docsOutput, bytes);
await fs.writeFile(deliveryOutput, bytes);
console.log(`PDF genere: ${docsOutput} et ${deliveryOutput} (${pageNo} pages)`);

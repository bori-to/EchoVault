const CHARACTERS = Object.freeze([
  Object.freeze({
    id: 'aria',
    name: 'ARIA',
    role: 'ÉQUILIBRÉE',
    description: 'Polyvalente, idéale pour découvrir le Coffre.',
    tint: 0x80deea,
    accent: '#80deea',
    weapon: Object.freeze({ id: 'laser', name: 'LASER ARC', damage: 1,
      cooldown: 280, chargedCooldown: 700, projectileSpeed: 500, power: 0.55 }),
    stats: Object.freeze({ hp: 3, speed: 200, jumpVelocity: -400, dashSpeed: 520,
      fireCooldown: 280, chargedCooldown: 700, bulletSpeed: 500, damage: 1 }),
  }),
  Object.freeze({
    id: 'nyx',
    name: 'NYX',
    role: 'ÉCLAIREUSE',
    description: 'Très rapide et agile, mais plus fragile.',
    tint: 0xb388ff,
    accent: '#b388ff',
    weapon: Object.freeze({ id: 'sword', name: 'LAME D’ÉCHO', damage: 2,
      cooldown: 300, range: 54, power: 0.72 }),
    stats: Object.freeze({ hp: 2, speed: 250, jumpVelocity: -445, dashSpeed: 640,
      fireCooldown: 235, chargedCooldown: 620, bulletSpeed: 560, damage: 1 }),
  }),
  Object.freeze({
    id: 'atlas',
    name: 'ATLAS',
    role: 'BASTION',
    description: 'Une armure robuste qui privilégie la survie.',
    tint: 0xffb74d,
    accent: '#ffb74d',
    weapon: Object.freeze({ id: 'hammer', name: 'MARTEAU SISMIQUE', damage: 3,
      cooldown: 760, range: 76, power: 1 }),
    stats: Object.freeze({ hp: 5, speed: 165, jumpVelocity: -360, dashSpeed: 440,
      fireCooldown: 360, chargedCooldown: 860, bulletSpeed: 460, damage: 1 }),
  }),
  Object.freeze({
    id: 'volt',
    name: 'VOLT',
    role: 'ASSAUT',
    description: 'Des tirs puissants en échange d’une mobilité réduite.',
    tint: 0xff6e80,
    accent: '#ff6e80',
    weapon: Object.freeze({ id: 'plasma', name: 'CANON PLASMA', damage: 2,
      cooldown: 520, chargedCooldown: 980, projectileSpeed: 390, power: 0.9 }),
    stats: Object.freeze({ hp: 3, speed: 185, jumpVelocity: -385, dashSpeed: 490,
      fireCooldown: 430, chargedCooldown: 920, bulletSpeed: 620, damage: 2 }),
  }),
]);

let selectedId = 'aria';

export function getCharacters() { return CHARACTERS; }

export function selectCharacter(id) {
  if (!CHARACTERS.some(character => character.id === id)) return false;
  selectedId = id;
  return true;
}

export function getSelectedCharacter() {
  return CHARACTERS.find(character => character.id === selectedId) || CHARACTERS[0];
}

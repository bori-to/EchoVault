export const ACHIEVEMENTS = Object.freeze([
  { id: 'awakening', title: 'RÉVEIL', description: 'Commencer une partie.', parent: null, column: 1.5, row: 0 },
  { id: 'memory_one', title: 'PREMIER ÉCHO', description: 'Trouver un souvenir.', parent: 'awakening', column: 0, row: 1 },
  { id: 'memory_four', title: 'EXPLORATEUR', description: 'Trouver 4 souvenirs.', parent: 'memory_one', column: 0, row: 2 },
  { id: 'archivist', title: 'ARCHIVISTE', description: 'Réunir les 8 souvenirs.', parent: 'memory_four', column: 0, row: 3 },
  { id: 'first_blood', title: 'RIPOSTE', description: 'Vaincre un ennemi.', parent: 'awakening', column: 1, row: 1 },
  { id: 'hunter', title: 'CHASSEUR', description: 'Vaincre 10 ennemis.', parent: 'first_blood', column: 1, row: 2 },
  { id: 'phase_two', title: 'SURCHARGE', description: 'Atteindre la phase 2 du Gardien.', parent: 'hunter', column: 1, row: 3 },
  { id: 'guardian', title: 'BRISE-GARDIEN', description: 'Vaincre le boss final.', parent: 'phase_two', column: 1, row: 4 },
  { id: 'first_module', title: 'AUGMENTÉ', description: 'Débloquer un pouvoir.', parent: 'awakening', column: 2, row: 1 },
  { id: 'full_arsenal', title: 'UNITÉ COMPLÈTE', description: 'Débloquer les 3 pouvoirs.', parent: 'first_module', column: 2, row: 2 },
  { id: 'shield_block', title: 'INTACT', description: 'Bloquer un coup avec le bouclier.', parent: 'full_arsenal', column: 2, row: 3 },
  { id: 'wayfinder', title: 'RÉSEAU STABLE', description: 'Activer 3 checkpoints.', parent: 'shield_block', column: 2, row: 4 },
  { id: 'first_ending', title: 'CHOIX FINAL', description: 'Terminer EchoVault.', parent: 'awakening', column: 3, row: 1 },
  { id: 'speedrun', title: 'ÉCHO FULGURANT', description: 'Terminer en moins de 15 minutes.', parent: 'first_ending', column: 3, row: 2 },
  { id: 'two_endings', title: 'DEUX VÉRITÉS', description: 'Découvrir les deux fins.', parent: 'first_ending', column: 3, row: 3 },
]);

const STORAGE_KEY = 'echovault.achievements.v1';

export class AchievementManager {
  constructor(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
    this.storage = storage;
    this.unlocked = new Set();
    this.endings = new Set();
    this.load();
  }

  load() {
    try {
      const saved = JSON.parse(this.storage?.getItem(STORAGE_KEY) || '{}');
      this.unlocked = new Set(Array.isArray(saved.unlocked) ? saved.unlocked : []);
      this.endings = new Set(Array.isArray(saved.endings) ? saved.endings : []);
    } catch (_) {
      this.unlocked = new Set();
      this.endings = new Set();
    }
  }

  save() {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify({
        unlocked: [...this.unlocked], endings: [...this.endings],
      }));
    } catch (_) { /* stockage indisponible */ }
  }

  unlock(id) {
    const achievement = ACHIEVEMENTS.find(item => item.id === id);
    if (!achievement || this.unlocked.has(id)) return null;
    this.unlocked.add(id);
    this.save();
    return achievement;
  }

  recordEnding(ending) {
    this.endings.add(ending);
    this.save();
    return this.endings.size;
  }

  isUnlocked(id) { return this.unlocked.has(id); }
  getUnlockedCount() { return this.unlocked.size; }
  getTotal() { return ACHIEVEMENTS.length; }
}

export const achievements = new AchievementManager();

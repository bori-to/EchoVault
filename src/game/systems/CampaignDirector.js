export const TARGET_PLAYTIME_MINUTES = 60;
export const CAMPAIGN_ACTS = 8;

export const STORY_WITNESSES = Object.freeze([
  Object.freeze({ x: 700, y: 338, name: "L'Oracle", requires: 2, id: 'oracle', waves: 5 }),
  Object.freeze({ x: 1820, y: 408, name: 'AEGIS-4', requires: 4, id: 'aegis', waves: 5 }),
  Object.freeze({ x: 2740, y: 368, name: 'SIBYL', requires: 6, id: 'sibyl', waves: 6 }),
  Object.freeze({ x: 3650, y: 378, name: 'Archiviste K-7', requires: 8, id: 'archivist', waves: 6 }),
  Object.freeze({ x: 4440, y: 288, name: 'Écho de MIRA', requires: 10, id: 'mira', waves: 6 }),
  Object.freeze({ x: 5020, y: 278, name: 'Écho de SOL', requires: 12, id: 'sol', waves: 6 }),
]);

export function getCampaignPacing() {
  return {
    acts: CAMPAIGN_ACTS,
    witnesses: STORY_WITNESSES.length,
    requiredFragments: STORY_WITNESSES.at(-1).requires,
    defenseWaves: STORY_WITNESSES.reduce((total, witness) => total + witness.waves, 0),
    targetMinutes: TARGET_PLAYTIME_MINUTES,
  };
}

export function estimateCampaignMinutes({
  minutesPerSector = 3,
  secondsPerWave = 42,
  minutesPerRiddle = 2,
  riddleCount = 3,
  storyAndBossMinutes = 13,
} = {}) {
  const pacing = getCampaignPacing();
  return pacing.witnesses * minutesPerSector +
    pacing.defenseWaves * secondsPerWave / 60 +
    riddleCount * minutesPerRiddle + storyAndBossMinutes;
}

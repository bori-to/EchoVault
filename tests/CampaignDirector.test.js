import { describe, expect, it } from 'vitest';
import { CAMPAIGN_ACTS, estimateCampaignMinutes, getCampaignPacing, STORY_WITNESSES } from '../src/game/systems/CampaignDirector.js';

describe('CampaignDirector', () => {
  it('définit huit actes et six témoins obligatoires', () => {
    expect(CAMPAIGN_ACTS).toBe(8);
    expect(STORY_WITNESSES).toHaveLength(6);
  });

  it('augmente les prérequis jusqu’aux douze souvenirs', () => {
    expect(STORY_WITNESSES.map(witness => witness.requires)).toEqual([2, 4, 6, 8, 10, 12]);
  });

  it('programme trente-quatre vagues de défense', () => {
    expect(getCampaignPacing().defenseWaves).toBe(34);
  });

  it('produit une estimation proche d’une heure avec le rythme de référence', () => {
    expect(estimateCampaignMinutes()).toBeGreaterThanOrEqual(55);
    expect(estimateCampaignMinutes()).toBeLessThanOrEqual(65);
  });
});

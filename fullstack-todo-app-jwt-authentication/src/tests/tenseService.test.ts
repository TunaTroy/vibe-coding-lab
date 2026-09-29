import { TenseRepository } from '../repositories/tenseRepository';
import { LevelService } from '../services/levelService';
import { TenseService } from '../services/tenseService';

const tenses = [
  { id: 'tense-1', code: 'ONE', name: 'First', order: 1 },
  { id: 'tense-2', code: 'TWO', name: 'Second', order: 2 },
];

function makeService(passedBossIds: string[], includeSecondBoss = false) {
  const bosses = [
    { id: 'boss-1', tenseId: 'tense-1', groupIndex: 1 },
    ...(includeSecondBoss ? [{ id: 'boss-2', tenseId: 'tense-1', groupIndex: 2 }] : []),
  ];
  const repository = {
    findAllTenses: jest.fn().mockResolvedValue(tenses),
    findPublishedBosses: jest.fn().mockResolvedValue([...bosses].reverse()),
    findPassedBossIds: jest.fn().mockResolvedValue(passedBossIds.map(bossId => ({ bossId }))),
  } as unknown as TenseRepository;
  return new TenseService(repository, {} as LevelService);
}

describe('TenseService BossCheckpoint unlocks', () => {
  it('keeps the next tense locked before the previous Boss is passed', async () => {
    const result = await makeService([]).getAllTenses('user-1');
    expect(result.map(tense => tense.isUnlocked)).toEqual([true, false]);
  });

  it('unlocks the next tense after the previous final Boss is passed', async () => {
    const result = await makeService(['boss-1']).getAllTenses('user-1');
    expect(result.map(tense => tense.isUnlocked)).toEqual([true, true]);
  });

  it('requires the latest published checkpoint when a tense has multiple Bosses', async () => {
    const result = await makeService(['boss-1'], true).getAllTenses('user-1');
    expect(result.map(tense => tense.isUnlocked)).toEqual([true, false]);
  });
});

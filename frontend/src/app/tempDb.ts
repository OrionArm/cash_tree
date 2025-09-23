import type { Encounter, EncounterType } from '../shared/use_game';

class TempDb {
  private encounters: Encounter[] = [];
  private initialized = false;

  private randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  private initIfNeeded() {
    if (this.initialized) return;
    const STEP_PX = 64;
    const WORLD_LENGTH_PX = 64 * 200;
    const types: EncounterType[] = ['npc', 'monster', 'chest'];
    const used: number[] = [];
    const count = 18;
    const generated: Encounter[] = [];

    for (let i = 0; i < count; i++) {
      let x = Math.round(this.randomBetween(8, (WORLD_LENGTH_PX - 8) / STEP_PX)) * STEP_PX;
      let attempts = 0;
      while (used.some((u) => Math.abs(u - x) < STEP_PX * 4) && attempts < 20) {
        x = Math.round(this.randomBetween(8, (WORLD_LENGTH_PX - 8) / STEP_PX)) * STEP_PX;
        attempts++;
      }
      used.push(x);
      const type = types[Math.floor(Math.random() * types.length)];
      const title = type === 'npc' ? 'Путник' : type === 'monster' ? 'Монстр' : 'Сундук';
      const description =
        type === 'npc'
          ? 'Незнакомец машет рукой'
          : type === 'monster'
            ? 'Враг преграждает путь'
            : 'Старый сундук покрытый пылью';
      generated.push({ id: `${type}-${x}-${i}`, x, type, resolved: false, title, description });
    }
    generated.sort((a, b) => a.x - b.x);
    this.encounters = generated;
    this.initialized = true;
  }

  async fetchEncounters(): Promise<Encounter[]> {
    this.initIfNeeded();
    await new Promise((r) => setTimeout(r, 250));
    return this.encounters.map((e) => ({ ...e }));
  }


}

export const tempDb = new TempDb();

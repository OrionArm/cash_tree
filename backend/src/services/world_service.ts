export interface WorldEvent {
  eventId: string;
  type: string;
  title: string;
  description: string;
  imageUrl?: string;
  requiresAction: boolean;
  actions?: string[];
  rewards?: any;
}

export class WorldService {
  private worldEvents: Map<number, WorldEvent> = new Map();

  constructor() {
    this.initializeWorldEvents();
  }

  async getEventAtPosition(position: number): Promise<WorldEvent | null> {
    return this.worldEvents.get(position) || null;
  }

  getAllEvents(): WorldEvent[] {
    const events: WorldEvent[] = Array.from(this.worldEvents.values()).filter(
      Boolean,
    ) as WorldEvent[];

    return events;
  }

  private initializeWorldEvents(): void {
    this.worldEvents.set(5, {
      eventId: 'world-event-5',
      type: 'npc_encounter',
      title: 'Странный старик',
      description:
        'Старый мудрец сидит у дороги и что-то бормочет себе под нос',
      imageUrl: '/sprites/npc.svg',
      requiresAction: true,
      actions: ['talk', 'ignore'],
    });

    this.worldEvents.set(10, {
      eventId: 'world-event-10',
      type: 'treasure',
      title: 'Заброшенный сундук',
      description: 'Старый деревянный сундук лежит в кустах',
      imageUrl: '/sprites/chest.svg',
      requiresAction: true,
      actions: ['open', 'ignore'],
      rewards: {
        gold: 100,
        experience: 50,
      },
    });

    this.worldEvents.set(8, {
      eventId: 'world-event-15',
      type: 'monster',
      title: 'Монстр',
      description: 'Из леса выбегает голодный волк',
      imageUrl: '/sprites/monster.svg',
      requiresAction: true,
      actions: ['fight', 'run'],
    });

    this.worldEvents.set(10, {
      eventId: 'world-event-20',
      type: 'monster',
      title: 'Древний дракон',
      description: 'Мощное мифическое существо охраняет сокровища',
      imageUrl: '/sprites/monster2.svg',
      requiresAction: true,
      actions: ['fight', 'run'],
    });
  }
}

export const worldService = new WorldService();

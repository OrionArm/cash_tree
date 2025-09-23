import { GameEventDto } from '../dto/response/player';

export class EventService {
  generateEvents(position: number): GameEventDto[] {
    const events: GameEventDto[] = [];

    // Вероятность события (30% шанс)
    if (Math.random() < 0.3) {
      const eventType = this.getRandomEventType();
      const event = this.createEvent(eventType, position);
      events.push(event);
    }

    return events;
  }

  private getRandomEventType():
    | 'npc_encounter'
    | 'treasure'
    | 'monster'
    | 'shop'
    | 'random_event' {
    const types = [
      'npc_encounter',
      'treasure',
      'monster',
      'shop',
      'random_event',
    ];
    const weights = [0.4, 0.2, 0.2, 0.1, 0.1]; // NPC встреча чаще всего

    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return types[i] as any;
      }
    }

    return 'npc_encounter';
  }

  private createEvent(type: string, position: number): GameEventDto {
    const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    switch (type) {
      case 'npc_encounter':
        return this.createNpcEncounter(eventId);
      case 'treasure':
        return this.createTreasureEvent(eventId);
      case 'monster':
        return this.createMonsterEvent(eventId);
      case 'shop':
        return this.createShopEvent(eventId);
      default:
        return this.createRandomEvent(eventId);
    }
  }

  private createNpcEncounter(id: string): GameEventDto {
    const npcs = [
      {
        title: 'Путник',
        description: 'Незнакомец машет рукой и улыбается',
        imageUrl: '/images/npc_traveler.png',
        actions: ['talk', 'ignore'],
      },
      {
        title: 'Торговец',
        description: 'Купец предлагает свои товары',
        imageUrl: '/images/npc_merchant.png',
        actions: ['trade', 'ignore'],
      },
      {
        title: 'Мудрец',
        description: 'Старый мудрец сидит у дороги',
        imageUrl: '/images/npc_wizard.png',
        actions: ['ask_advice', 'ignore'],
      },
    ];

    const npc = npcs[Math.floor(Math.random() * npcs.length)];

    return {
      id,
      type: 'npc_encounter',
      title: npc.title,
      description: npc.description,
      imageUrl: npc.imageUrl,
      requiresAction: true,
      actions: npc.actions,
    };
  }

  private createTreasureEvent(id: string): GameEventDto {
    return {
      id,
      type: 'treasure',
      title: 'Сундук с сокровищами',
      description: 'Вы нашли старый сундук, покрытый пылью',
      imageUrl: '/images/treasure_chest.png',
      requiresAction: true,
      actions: ['open', 'ignore'],
      rewards: {
        gold: Math.floor(Math.random() * 50) + 10,
        experience: Math.floor(Math.random() * 20) + 5,
      },
    };
  }

  private createMonsterEvent(id: string): GameEventDto {
    return {
      id,
      type: 'monster',
      title: 'Дикий зверь',
      description: 'Из кустов выпрыгивает агрессивное существо',
      imageUrl: '/images/monster.png',
      requiresAction: true,
      actions: ['fight', 'run'],
    };
  }

  private createShopEvent(id: string): GameEventDto {
    return {
      id,
      type: 'shop',
      title: 'Бродячий торговец',
      description: 'Торговец разложил свой товар на обочине',
      imageUrl: '/images/shop.png',
      requiresAction: true,
      actions: ['browse', 'ignore'],
    };
  }

  private createRandomEvent(id: string): GameEventDto {
    return {
      id,
      type: 'random_event',
      title: 'Странное происшествие',
      description: 'Что-то необычное происходит вокруг вас',
      imageUrl: '/images/mystery.png',
      requiresAction: true,
      actions: ['investigate', 'ignore'],
    };
  }
}

export const eventService = new EventService();

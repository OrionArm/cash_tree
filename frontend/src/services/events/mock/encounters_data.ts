import type { EncounterEvent } from '../type';

export const encounterData: EncounterEvent[] = [
  {
    eventId: 'OBJ01',
    type: 'npc_encounter',
    title: 'Торговый центр',
    description:
      'Групповой чат друзей и сбор денег на подарок. Важна проверка личности и безопасный способ оплаты.',
    imageUrl: '/encounter/OBJ01.png',
    topic: 'Антифрод/соц.инжиниринг',
    position: 5,
    dialogId: 'CH01_S1',
  },
  {
    eventId: 'OBJ02',
    type: 'npc_encounter',
    title: 'ЖК',
    description:
      'Поиск грузчиков и доставки через объявления. Риски предоплаты и фиктивных исполнителей.',
    imageUrl: '/encounter/OBJ02.png',
    topic: 'Бюджет/антифрод',
    position: 10,
    dialogId: 'CH02_S1',
  },
  {
    eventId: 'OBJ06',
    type: 'npc_encounter',
    title: 'Онлайн-университет',
    description:
      'Онлайн-курс с пробным периодом. Нужна дисциплина и настройка напоминаний, чтобы не переплачивать.',
    imageUrl: '/encounter/OBJ06.png',
    topic: 'Подписки/долгосрочные цели',
    position: 15,
    dialogId: 'CH06_S1',
  },
  {
    eventId: 'OBJ03',
    type: 'npc_encounter',
    title: 'Магазин техники',
    description:
      'Магазин техники, расширенная гарантия и возвраты. Важно читать условия и проверять продавца.',
    imageUrl: '/encounter/OBJ03.png',
    topic: 'Партнёры/страхование',
    position: 20,
    dialogId: 'CH03_S1',
  },
  {
    eventId: 'OBJ04',
    type: 'npc_encounter',
    title: 'Путешествие',
    description:
      'Билеты, зарубежные платежи, связь и страховка. Подготовка экономит деньги и нервы.',
    imageUrl: '/encounter/OBJ04.png',
    topic: 'Платежи/валюта/страховка',
    position: 26,
    dialogId: 'CH04_S1',
  },
  {
    eventId: 'OBJ05',
    type: 'npc_encounter',
    title: 'Дальняя поездка на авто',
    description:
      'План маршрута, платные дороги и топливо у партнёров. Осторожнее с фейковыми уведомлениями о штрафах.',
    imageUrl: '/encounter/OBJ05.png',
    topic: 'Партнёры/штрафы/QR',
    position: 36,
    dialogId: 'CH05_S1',
  },
];

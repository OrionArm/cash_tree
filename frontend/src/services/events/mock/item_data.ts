// export type ItemName =
//   | 'Защитный PIN-чекер'
//   | 'Полис-щит'
//   | 'Бонус-карта партнёра'
//   | 'Смарт-автоплатёж'
//   | 'Антифрод-токен'
//   | 'Подушка безопасности'
//   | 'Целевой календарь'
//   | 'Финсоветник';

type ItemName =
  | 'Бонус-карта партнёра'
  | 'Смарт-автоплатёж'
  | 'Защитный PIN-чекер'
  | 'Кофе-термокружка'
  | 'Сейф-карта'
  | 'Целевой календарь'
  | 'Антифрод-токен'
  | 'Пауэрбанк'
  | 'Сезонный заряд'
  | 'Статус «Знаток»'
  | 'Энерго-перекус'
  | 'Промокод-купон'
  | 'Финсоветник'
  | 'Полис-щит'
  | 'Отпускное настроение' //??
  | 'Ранний подъём' //??
  | 'Простуда';

export type ItemId =
  | 'pin-checker'
  | 'policy-shield'
  | 'bonus-card'
  | 'auto-payment'
  | 'anti-fraud-token'
  | 'target-calendar'
  | 'fin-advisor'
  | 'coffee-termocup'
  | 'safe-card'
  | 'powerbank'
  | 'season-charge'
  | 'smart-guy'
  | 'energy-meal'
  | 'promocode'
  | 'vacation-mood'
  | 'early-awakening'
  | 'cold';

export type Item = {
  id: ItemId;
  name: ItemName;
  description: string;
  image: string;
};

export const mockItems: Item[] = [
  {
    id: 'pin-checker',
    name: 'Защитный PIN-чекер',
    description: 'Специальное устройство для безопасной проверки PIN-кодов',
    image: '/item/pin_checker.png',
  },
  {
    id: 'policy-shield',
    name: 'Полис-щит',
    description: 'Страховая защита от финансовых рисков',
    image: '/item/policy_shield.png',
  },
  {
    id: 'bonus-card',
    name: 'Бонус-карта партнёра',
    description: 'Карта с бонусными программами от партнёров банка',
    image: '/item/partner_bonus_card.png',
  },
  {
    id: 'auto-payment',
    name: 'Смарт-автоплатёж',
    description: 'Автоматические платежи с умным управлением',
    image: '/item/smart_autopayment.png',
  },
  {
    id: 'anti-fraud-token',
    name: 'Антифрод-токен',
    description: 'Токен для защиты от мошеннических операций',
    image: '/item/antifrod_token.png',
  },
  {
    id: 'target-calendar',
    name: 'Целевой календарь',
    description: 'Календарь для планирования финансовых целей',
    image: '/item/target_calendar.png',
  },
  {
    id: 'fin-advisor',
    name: 'Финсоветник',
    description: 'Персональный финансовый консультант',
    image: '/item/fin_advisor.png',
  },
  {
    id: 'coffee-termocup',
    name: 'Кофе-термокружка',
    description: 'Термокружка для поддержания энергии в течение дня',
    image: '/item/coffee_termocup.png',
  },
  {
    id: 'safe-card',
    name: 'Сейф-карта',
    description: 'Защищённая банковская карта с повышенной безопасностью',
    image: '/item/safe_card.png',
  },
  {
    id: 'powerbank',
    name: 'Пауэрбанк',
    description: 'Портативное зарядное устройство для мобильных устройств',
    image: '/item/powerbank.png',
  },
  {
    id: 'season-charge',
    name: 'Сезонный заряд',
    description: 'Специальный бонус, активируемый в определённые сезоны',
    image: '/item/season_charge.png',
  },
  {
    id: 'smart-guy',
    name: 'Статус «Знаток»',
    description: 'Престижный статус для опытных пользователей банковских услуг',
    image: '/item/smart_guy.png',
  },
  {
    id: 'energy-meal',
    name: 'Энерго-перекус',
    description: 'Питательный перекус для восстановления энергии',
    image: '/item/energy_meal.png',
  },
  {
    id: 'promocode',
    name: 'Промокод-купон',
    description: 'Купон со скидкой на различные товары и услуги',
    image: '/item/promocode.png',
  },
  {
    id: 'vacation-mood',
    name: 'Отпускное настроение',
    description: 'Специальный бонус для путешествий и отдыха',
    image: '/item/vacation_mood.png',
  },
  {
    id: 'early-awakening',
    name: 'Ранний подъём',
    description: 'Бонус за раннее начало дня и активный образ жизни',
    image: '/item/early_awakening.png',
  },
  {
    id: 'cold',
    name: 'Простуда',
    description: 'Неприятное состояние, которое снижает продуктивность',
    image: '/item/cold.png',
  },
];

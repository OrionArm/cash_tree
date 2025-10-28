import { use } from 'react';
import { fetchShopItems } from '@/shared/local_api';
import type { ShopItem } from '@/services/events/mock/shop_data';
import ShopItemsList from './shop_items_list';

const shopItemsPromise = fetchShopItems();

export default function ShopDataLoader() {
  const shopItems: ShopItem[] = use(shopItemsPromise);

  return <ShopItemsList items={shopItems} />;
}

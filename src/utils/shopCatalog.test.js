import { SHOP_ITEMS } from './shopCatalog';
import { PRODUCT_VARIANT_MAP } from './constants';
test('retail catalog and custom set singles match Shopify prices', () => {
  expect(SHOP_ITEMS).toHaveLength(9);
  SHOP_ITEMS.forEach(item => {
    const single = item.id.startsWith('single-');
    expect(item.pricing).toEqual(single ? { oneTime: 15, subscription: 14 } : item.id === 'bundle-6' ? { oneTime: 65, subscription: 54.99 } : { oneTime: 39.99, subscription: 29.99 });
    if (single) expect(PRODUCT_VARIANT_MAP[item.name].pricing).toEqual(item.pricing);
  });
});

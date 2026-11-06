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

test('bundles are pre-orders shipping Nov 17, 2026; single bottles are not', () => {
  const bundles = SHOP_ITEMS.filter(item => item.category === 'bundles');
  expect(bundles.map(item => item.preorder)).toEqual(bundles.map(() => ({ shipsOn: 'Nov 17, 2026' })));
  expect(SHOP_ITEMS.filter(item => item.category !== 'bundles' && item.preorder)).toEqual([]);
});

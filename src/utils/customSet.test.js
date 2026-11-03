import { calculateSetTotals } from './helpers';
import { productsData } from './constants';

const bottles = Object.values(productsData).flat();

test('a full custom 6-bottle set subscribes at the advertised $54.99 a month', () => {
  expect(calculateSetTotals(bottles).subscription).toBe(54.99);
  expect(calculateSetTotals([...bottles.slice(0, 5), bottles[0]]).subscription).toBe(54.99);
});

test('an incomplete set is priced per bottle', () => {
  expect(calculateSetTotals(bottles.slice(0, 2)).subscription).toBeCloseTo(18.32);
  expect(calculateSetTotals(bottles).oneTime).toBeCloseTo(119.94);
});

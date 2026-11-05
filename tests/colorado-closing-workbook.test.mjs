import test from 'node:test';
import assert from 'node:assert/strict';
import { COLORADO_ADDITIONAL_CLOSING_CASES as cases, solveColoradoClosingCase as solve } from '../config/colorado/closing-practical-cases.mjs';

test('five additional cases retain independently checked settlement totals', () => {
  const expected = [
    [2,8848000,24264000,48448000],
    [3,796000,13976000,35862063],
    [4,90000,14311000,42490000],
    [6,9561000,8221000,10461000],
    [7,5190000,2264000,5990000]
  ];
  for(const [number,buyer,seller,cash] of expected){
    const item=cases.find(c=>c.number===number), result=solve(item);
    assert.equal(result.buyerCashCents,buyer,`problem ${number}: buyer`);
    assert.equal(result.sellerCashCents,seller,`problem ${number}: seller`);
    assert.equal(result.cashSourcesCents,cash,`problem ${number}: sources`);
    assert.equal(result.cashDisbursementsCents,cash,`problem ${number}: disbursements`);
    assert.equal(item.fromPreparedCommissionContract,false);
    assert.equal(item.observedMinutes,null);
  }
});

test('changed tax allocation affects both parties equally without inventing cash proceeds', () => {
  const item=cases[0], base=solve(item);
  const changed=solve({...item,taxes:{...item.taxes,annual:3840}});
  assert.equal(changed.taxProrationCents-base.taxProrationCents,10000);
  assert.equal(changed.buyerCashCents-base.buyerCashCents,-10000);
  assert.equal(changed.sellerCashCents-base.sellerCashCents,-10000);
  const assumption=solve(cases.find(c=>c.number===6));
  assert.equal(assumption.noncashPrincipalCents,27500000);
  assert.equal(assumption.cashSourcesCents,10461000);
});

test('invalid inputs and ambiguous cash/noncash financing are rejected', () => {
  const item=cases[0];
  for(const price of [NaN,Infinity,-1,1.001]) assert.throws(()=>solve({...item,price}));
  assert.throws(()=>solve({...item,financing:{cashProceeds:100,noncashPrincipal:100}}));
  assert.throws(()=>solve({...item,taxes:{...item.taxes,sellerDays:361}}));
  assert.throws(()=>solve({...item,taxes:{...item.taxes,yearDays:0}}));
});

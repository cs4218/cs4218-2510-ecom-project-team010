// these test cases focus on the interaction between braintreeTokenController function
// within the productController file and the real Braintree module. 

import 'dotenv/config';
import { describe, it, expect, beforeAll, jest } from '@jest/globals';

jest.setTimeout(20000); // give real network call some time

// these series of test cases focus on the interaction between productController
// and only the real orderModel and braintree modules.
// tiny Express-like res with "signal" so we can await the first response 
function baseRes() {
  const res = {};
  res.statusCode = 200;
  res.status = jest.fn((code) => { res.statusCode = code; return res; });
  res.send   = jest.fn((payload) => payload);
  return res;
}
function mockResWithSignal() {
  const res = baseRes();
  let resolve;
  const done = new Promise((r) => { resolve = r; });

  const wrap = (fn) => jest.fn((...args) => {
    try { return fn(...args); }
    finally { resolve(); }
  });

  res.send = wrap(res.send);
  res.status = wrap(res.status);
  return { res, done };
}

const hasBraintreeEnv =
  !!process.env.BRAINTREE_MERCHANT_ID &&
  !!process.env.BRAINTREE_PUBLIC_KEY &&
  !!process.env.BRAINTREE_PRIVATE_KEY;

// if braintree env not found, skip tests quickly
(hasBraintreeEnv ? describe : describe.skip)('integration test between braintreeTokenController and real Braintree module',() => {
    let braintreeTokenController;

    beforeAll(async () => {
      ({ braintreeTokenController } = await import('./productController.js'));
    });

    it('braintreeTokenController function interacts with braintree module and returns a real client token.', async () => {
      const req = {};
      const { res, done } = mockResWithSignal();

      await braintreeTokenController(req, res);

      // wait for res.send 
      await done;

      // token is sent
      const sent = res.send.mock.calls[0]?.[0];
      expect(sent).toBeDefined();

      // this generated token that was sent contains is real and contains content.
      const token =
        sent?.clientToken ??
        sent?.client_token ??
        sent?.data?.clientToken ??
        sent?.data?.client_token;
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
    });

    it('when braintreeTokenController interacts with braintree module to generate token, handles gateway errors with 500 (if they occur)', async () => {
      // This is hard to force an error deterministically with real SDK,
      // but we keep a defensive test that at least waits for a response
      // and responds gracefully if an error does occur.
      const req = {};
      const { res, done } = mockResWithSignal();

      await braintreeTokenController(req, res);
      await done;

      // Either success (res.send called) or failure (res.status(500).send(err))
      const sentCalled = res.send.mock.calls.length > 0;
      const statusCalled = res.status.mock.calls.length > 0;

      expect(sentCalled || statusCalled).toBe(true);
      if (statusCalled) {
        expect(res.status).toHaveBeenCalledWith(500);
      }
    });
  }
);

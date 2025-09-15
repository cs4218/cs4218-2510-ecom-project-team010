jest.mock('../models/orderModel.js', () => ({
  __esModule: true,
  default: jest.fn(() => ({ save: jest.fn() })),
}));

jest.mock('braintree', () => {
  const BraintreeGateway = jest.fn(() => ({
    clientToken: { generate: jest.fn() },
    transaction: { sale: jest.fn() },
  }));
  return {
    __esModule: true,
    default: {
      BraintreeGateway,
      Environment: { Sandbox: 'Sandbox' },
    },
  };
});

jest.mock('dotenv', () => ({
  __esModule: true,
  default: { config: jest.fn() },
  config: jest.fn(),
}));

import braintree from 'braintree';
import { braintreeTokenController } from '../controllers/productController.js';

const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
  json: jest.fn(),
});

describe('testing braintreeTokenController', () => {
  let gateway; // hold the SAME instance the controller uses

  beforeAll(() => {
    // capture the instance created when the controller was imported
    gateway = braintree.BraintreeGateway.mock.results[0]?.value;
    // safety: if some runner imported controller later, create once now
    if (!gateway) {
      gateway = new braintree.BraintreeGateway({});
    }
  });

  beforeEach(() => {
    gateway.clientToken.generate.mockReset();
    gateway.transaction.sale.mockReset();
  });

  it('client token is successfully generated', async () => {
    const req = {};
    const res = makeRes();

    gateway.clientToken.generate.mockImplementation((opts, cb) => {
      cb(null, { clientToken: '123' });
    });

    await braintreeTokenController(req, res);

    expect(gateway.clientToken.generate).toHaveBeenCalledWith({}, expect.any(Function));
    expect(res.send).toHaveBeenCalledWith({ clientToken: '123' });
  });

  it('returns 500 when token generation fails', async () => {
    const req = {};
    const res = makeRes();

    gateway.clientToken.generate.mockImplementation((opts, cb) => {
      cb(new Error('fail'), null);
    });

    await braintreeTokenController(req, res);

    expect(gateway.clientToken.generate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.any(Error));
  });
});
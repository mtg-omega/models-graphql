import { sequelize } from 'mtg-omega-models-sql';

import { handler } from '../src';

import event from './assets/event1.json';

describe('Serverless endpoint', () => {
  beforeEach(() => sequelize.sync({ force: true }));

  it('should reply to the api event', () => handler(event, null, (err, res) => {
    expect(err).toBeNull();
    expect(res).toBeDefined();

    expect(res.statusCode).toBe(200);
    expect(res.headers).toBeDefined();
    expect(res.body).toBeDefined();
  }));
});

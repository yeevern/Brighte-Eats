import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db';

// Reset the leads table before each test so tests don't affect each other
beforeEach(() => {
  db.exec('DELETE FROM leads');
});

// A valid lead payload we can reuse across tests
const validLead = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  mobile: '0412345678',
  postcode: '2000',
  services: ['delivery'],
};

describe('POST /leads', () => {
  it('saves and returns the lead on the happy path', async () => {
    const res = await request(app).post('/leads').send(validLead);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'Jane Smith',
      email: 'jane@example.com',
      mobile: '0412345678',
      postcode: '2000',
      services: ['delivery'],
    });
    // The database should have assigned an id
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 with a field error when name is missing', async () => {
    const { name: _name, ...withoutName } = validLead;

    const res = await request(app).post('/leads').send(withoutName);

    expect(res.status).toBe(400);
    expect(res.body.errors.name).toBeDefined();
  });

  it('returns 400 when no services are selected', async () => {
    const res = await request(app)
      .post('/leads')
      .send({ ...validLead, services: [] });

    expect(res.status).toBe(400);
    expect(res.body.errors.services).toBeDefined();
  });
});

describe('GET /leads', () => {
  it('returns all leads that were created', async () => {
    // Seed two leads
    await request(app).post('/leads').send(validLead);
    await request(app)
      .post('/leads')
      .send({ ...validLead, name: 'Bob Jones', email: 'bob@example.com', services: ['payment'] });

    const res = await request(app).get('/leads');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('returns only leads for the requested service when filtering', async () => {
    await request(app).post('/leads').send(validLead);
    await request(app)
      .post('/leads')
      .send({ ...validLead, name: 'Bob Jones', email: 'bob@example.com', services: ['payment'] });

    const res = await request(app).get('/leads?service=delivery');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Jane Smith');
  });
});

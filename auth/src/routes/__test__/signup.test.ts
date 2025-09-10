import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'testsupertest@test.com',
      password: 'supertest'
    })
    .expect(201);
});

it('returns a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'testsupertesttest.com',
      password: 'supertest'
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'testsupertest@test.com',
      password: 'sup'
    })
    .expect(400);
});

it('returns a 400 with missing credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testsupertest@test.com'
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
      password: 'supertest'
    })
    .expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testsupertest@test.com',
      password: 'supertest'
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testsupertest@test.com',
      password: 'supertest'
    })
    .expect(400);
});

it('sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testsupertest@test.com',
      password: 'supertest'
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
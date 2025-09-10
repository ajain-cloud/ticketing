import request from 'supertest';
import { app } from '../../app';

it('returns a 400 on invalid signin email', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'testsupertesttest.com',
      password: 'supertest'
    })
    .expect(400);
});

it('returns a 400 on empty signin password', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'testsupertest@test.com',
      password: ''
    })
    .expect(400);
});

it('fails when a email that does not exist is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'passwordsss'
    })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
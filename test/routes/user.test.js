const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');

const MAIN_ROUTE = '/v1/users';
const mail = `${Date.now()}@mail.com`;

let user;

beforeAll(async () => {
  const res = await app.services.user.save({
    name: 'User Account',
    mail: `${Date.now()}@mail.com`,
    passwd: '123',
  });
  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo!');
});

test('Deve listar todos os usuários', () => {
  return request(app)
    .get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Deve inserir usuário com sucesso', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .send({
      name: 'Walter Mitty',
      mail,
      passwd: '123',
    })
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Walter Mitty');
      expect(res.body).not.toHaveProperty(`passwd`);
    });
});

test('Deve armazenar senha criptografada', async () => {
  const res = await request(app)
    .post(MAIN_ROUTE)
    .send({
      name: 'Walter Mitty',
      mail: `${Date.now()}@mail.com`,
      passwd: '123',
    })
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(201);

  const { id } = res.body;
  const userDB = await app.services.user.findOne({ id });
  expect(userDB.passwd).not.toBeUndefined();
  expect(userDB.passwd).not.toBe('123');
});

test('Não deve inserir usuário sem nome', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .send({
      mail: 'penis@penis.com',
      passwd: '123',
    })
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Nome é um atributo obrigatório');
    });
});

test('Não deve inserir usuário sem email', async () => {
  const result = await request(app)
    .post(MAIN_ROUTE)
    .send({
      name: 'penis',
      passwd: '123',
    })
    .set('authorization', `bearer ${user.token}`);
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Email é um atributo obrigatório');
});

test('Não deve inserir usúario sem senha', async () => {
  const result = await request(app)
    .post(MAIN_ROUTE)
    .send({
      name: 'penis',
      mail: 'test@test.com',
    })
    .set('authorization', `bearer ${user.token}`);
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Senha é um atributo obrigatório');
});

test('Não deve inserir usuário com email existente', async () => {
  return request(app)
    .post(MAIN_ROUTE)
    .send({
      name: 'Walter Mitty',
      mail,
      passwd: '123',
    })
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email já cadastrado');
    });
});

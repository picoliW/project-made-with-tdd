test('Devo conhecer as principais assertivas do jest', () => {
  let number = null;
  expect(number).toBeNull();
  number = 10;
  expect(number).not.toBeNull();
});

test('Devo saber trabalhar com objetos', () => {
  const obj = { name: 'John', mail: 'john@mail.com' };

  expect(obj.name).toBe('John');

  const obj2 = { name: 'John', mail: 'john@mail.com' };
  expect(obj).toEqual(obj2);
});

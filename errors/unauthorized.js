/* Создаем класс. Этот класс наследует стандартную ошибку и добавляет свойство
статуса кода */

class Unauthorized extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

module.exports = Unauthorized;

/* Создаем класс. Этот класс наследует стандартную ошибку и добавляет свойство
статуса кода */

class Forbidden extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}

module.exports = Forbidden;

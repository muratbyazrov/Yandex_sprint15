/* Создаем класс. Этот класс наследует стандартную ошибку и добавляет свойство
статуса кода */

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

module.exports = NotFoundError;

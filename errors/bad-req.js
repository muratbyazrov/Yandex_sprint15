/* Создаем класс. Этот класс наследует стандартную ошибку и добавляет свойство
статуса кода */

class BadReq extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = BadReq;

// модуль для создания токенов
const jwt = require('jsonwebtoken');

// подключим класс с ошибкой для централизованного упраления ошибками
const Unauthorized = require('../errors/unauthorized');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  // убеждаемся, что он заголовок есть и начинается с Bearer
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new Unauthorized('Необходима авторизация!');
  }
  // если токен есть, надо его извлечь без Bearer с помощью replace
  const token = authorization.replace('Bearer ', '');
  /*
  убедимся, что токен именно тот, который ранее пользователь присылал.
  Метод принимает на вход два параметра: токен и секретный ключ, которым этот токен был подписан.
  Метод `jwt.verify` вернёт пейлоуд токена, если тот прошёл проверку.
  Если же с токеном что-то не так, нам вернётся ошибка
  Чтобы её обработать, нужно обернуть метод `jwt.verify` в `try...catch`:
  */
  let payload;
  try {
    const { JWT_SECRET = 'secret-key' } = process.env;
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // в ошибке выше проверяется, есть ли токен вообще, а тут правильный ли он
    next(new Unauthorized('Ошибка авторизации'));
  }

  req.user = payload;
  // этот next к централизации ошибок не относится. Когда авторизация пройдена, идем к след шагу
  next();
};

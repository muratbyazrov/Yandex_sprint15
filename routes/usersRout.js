// У express есть метод Router, который позволяет навешивать обработчики
const usersRouter = require('express').Router();

// подключим предварительную валидацию с помощью библиотек
const { celebrate, Joi } = require('celebrate');
// подключили валидацию id. Пришлось ставить доп. модуль https://www.npmjs.com/package/joi-objectid
Joi.objectId = require('joi-objectid')(Joi);

// подключаем удобный валидатор - использовался в схемах. Здесь для создания кастомного валидатора
const validator = require('validator');
// подключаем класс ошибки
const BadReq = require('../errors/bad-req');

// подключили мидлвер для авторизации
const auth = require('../middlewares/auth');

// Экспортировали обработчики
const {
  getUsers, getUserById, createUser, login,
} = require('../controllers/users');

// применяем нужные обработчики при соответсвующих запросах
// auth - это мидлвер для авторизации. После неё идут роуты, кторые нужно авторизовывать
usersRouter.get('/', auth, getUsers);
usersRouter.get('/:id', celebrate({
  // валидируем параметр запроса. Для этого подгрузили доп. модуль выше
  params: Joi.object().keys({
    id: Joi.objectId(),
  }),
}), auth, getUserById);
usersRouter.post('/signup', celebrate({
  // body должно быть объектом с ключами name, about, ... с такими-то параметрами
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.required().custom((value) => {
      if (!validator.isURL(value)) {
        throw new BadReq('В поле \'аватар\' вставьте ссылку на ваше фото');
      } else { return value; }
    }),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }).unknown(true),
}), createUser);
usersRouter.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

module.exports = usersRouter;

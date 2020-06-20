// У express есть метод Router, который позволяет навешивать обработчики
const usersRouterSignup = require('express').Router();
const usersRouterSignin = require('express').Router();

// подключим предварительную валидацию с помощью библиотек
const { celebrate, Joi } = require('celebrate');

// подключаем удобный валидатор - использовался в схемах. Здесь для создания кастомного валидатора
const validator = require('validator');
// подключаем класс ошибки
const BadReq = require('../errors/bad-req');

// Экспортировали обработчики
const {
  createUser, login,
} = require('../controllers/users');

usersRouterSignup.post('/', celebrate({
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
usersRouterSignin.post('/', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

module.exports = { usersRouterSignup, usersRouterSignin };

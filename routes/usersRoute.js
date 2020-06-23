// У express есть метод Router, который позволяет навешивать обработчики
const usersRouter = require('express').Router();


// подключим предварительную валидацию с помощью библиотек
const { celebrate, Joi } = require('celebrate');
// подключили валидацию id. Пришлось ставить доп. модуль https://www.npmjs.com/package/joi-objectid
Joi.objectId = require('joi-objectid')(Joi);

// подключили мидлвер для авторизации
const auth = require('../middlewares/auth');

// Экспортировали обработчики
const {
  getUsers, getUserById,
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


module.exports = { usersRouter };

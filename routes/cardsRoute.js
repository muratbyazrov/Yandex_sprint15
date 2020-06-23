// У express есть метод Router, который позволяет навешивать обработчики
const cardsRouter = require('express').Router();

// подключим предварительную валидацию с помощью библиотек
const { celebrate, Joi } = require('celebrate');
// подключили валидацию id. Пришлось ставить доп. модуль https://www.npmjs.com/package/joi-objectid
Joi.objectId = require('joi-objectid')(Joi);

// подключили мидлвер для авторизации
const { default: validator } = require('validator');
const auth = require('../middlewares/auth');

// Экспортировали обработчики
const { getCards, createCard, deleteCard } = require('../controllers/cards');
const BadReq = require('../errors/bad-req');

// применяем нужные обработчики при соответсвующих запроссах
// auth - это мидлвер для авторизации. После неё идут роуты, кторые нужно авторизовывать
cardsRouter.get('/', auth, getCards);
cardsRouter.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.required().custom((value) => {
      if (!validator.isURL(value)) {
        throw new BadReq('В поле \'link\' вставьте ссылку');
      } else { return value; }
    }),
  }),
}), auth, createCard);
cardsRouter.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.objectId(),
  }),
}), auth, deleteCard);

module.exports = cardsRouter;

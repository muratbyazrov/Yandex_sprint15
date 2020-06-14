// У express есть метод Router, который позволяет навешивать обработчики
const cardsRouter = require('express').Router();

// подключим предварительную валидацию с помощью библиотек
const { celebrate, Joi } = require('celebrate');

// подключили мидлвер для авторизации
const auth = require('../middlewares/auth');

// Экспортировали обработчики
const { getCards, createCard, deleteCard } = require('../controllers/cards');

// применяем нужные обработчики при соответсвующих запроссах
// auth - это мидлвер для авторизации. После неё идут роуты, кторые нужно авторизовывать
cardsRouter.get('/', auth, getCards);
cardsRouter.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
  }).unknown(true),
}), auth, createCard);
cardsRouter.delete('/:cardId', auth, deleteCard);

module.exports = cardsRouter;

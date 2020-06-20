// подключаем схуму карточек
const Cards = require('../models/card');

// Подключим класс ошибки
const NotFoundError = require('../errors/not-found-err');
const Forbidden = require('../errors/forbidden');


/* обработчик, который выдает все карточки. Подробнее читать у user */
module.exports.getCards = (req, res, next) => {
  Cards.find({})
    .then((user) => res.send({ data: user }))
    .catch(next);
};

/* Обработчик, который создает карточки. Получает имя и пользователя
Надо переделать, так как параметр owner должен быть автоматическим */
module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Cards.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch(next);
};

/* обработчик для удаления карточек. Если карточки по переданному ID нет, то mongoos по
умолчанию отправлет {null}. Чтобы исправить это, используем сначала findById, потому что
orFail почему-то не работает на методе findByIdAndRemove.
!Почему с использованием asinc await - надо проверить. Попробовать убрать.
Инструкция throw генерирует исключение и обработка кода переходит в следующий блок catch.
Получается, что next будет вызван с аргументом-ошибкой и запрос перейдёт в обработчик ошибки,
но уже со статусом и сообщением. Так как мы создали экземпляр ошибки
*/
module.exports.deleteCard = async (req, res, next) => {
  await Cards.findById(req.params.cardId)
    .orFail(new NotFoundError('Нет такой карточки'))
    .then((card) => {
      if (JSON.stringify(card.owner) !== JSON.stringify(req.user._id)) {
        throw new Forbidden('карточка существует, но она не ваша');
      }
      return card.remove()
        .then(res.send({ data: card }));
    })
    .catch(next);
};

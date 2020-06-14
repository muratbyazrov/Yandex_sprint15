// модуль для хеширования пароля
const bcrypt = require('bcrypt');

// модуль для создания токенов
const jwt = require('jsonwebtoken');

// подключили схему пользователя
const User = require('../models/user');

// Подключим класс ошибки
const NotFoundError = require('../errors/not-found-err');
const BadReq = require('../errors/bad-req');
const Unauthorized = require('../errors/unauthorized');

/* Создаем обработчик, который передает в ответе всех пользователей.
Метод findOne возвращает первый документ, соответствующий запросу. В данном случае, так как
в запросе пусто, возвращаются все документы из БД, так они все сразу удовлетворяют запросу.
Здесь мы подключили next - для централизованной обработки ошибок. обработчик next
находится в конце файла app.js. Запись .catch(next) равносильна .catch(err => next(err));
А когда в next есть аргумент, то запрос перейдет в обработчи ошибки
*/
module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

/* Создаем обработчик, который возвращает пользователя по ID. По умолчанию
мангус возвращает {null}, если документов с искомым ID нет. Чтобы исправить это, используется
orFail. Используется с asinc await. await звставляет интерпретатор JS ждать, пока код справа от
неё не выполнится. Если пользователя нет orFail создает экземпляр ошибки NotFoundError.
Запись .catch(next) равносильна .catch(err => next(err)). А когда в next есть аргумент, то
запрос перейдет в обработчи ошибки.
*/
module.exports.getUserById = async (req, res, next) => {
  await User.findById(req.params.id)
    .orFail(new NotFoundError('Нет такого пользователя'))
    .then((user) => res.send({ data: user }))
    .catch(next);
};

/* Обработчик, который создает пользователей по разработанной схеме User. Для этого сначала
получаем необходимые данные из тела запроса и передаем их методу create модели User */
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  // метод bcrypt создает для входящего пароля хеш с солью 10.
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, about, avatar, email, password: hash,
      })
        .then((user) => res.send({
          name: user.name, about: user.about, avatar: user.avatar, email: user.email,
        }))
        // Создается экзмепляр 'плохого запроса'
        .catch((err) => next(new BadReq(err.message)));
    });
};


/*
***Этот обработчик принимает пароль и логин и пытается авторизовать пользователя
***findUserByCredentials - это статический метод, который мы создали для проверки
логина и пароля. Если логин или пароль оказываются неправильными, выдаем ошибку.
Если верно, то создаем токен методом sign сроком 7 дней. Токен мы зыписываем в куки
для безопасности приложения, так как в куки у JS нет доступа.
***Если метод findUserByCredentials вернул пользователя(то есть логин и пароль правильные),
то мы создаем токен с помощью метода jwn.sign. На вход принимает пейлоуд - полезный груз токена
и ключевое слово которое надо хранить в переменной окружения на сервере.
Так же мы передали срок хранения токена !но так как токен мы храним в куки, а у куки есть свой
срок хранения, то скорее всего для самого токена срок хранения не нужен.
В express cookie устанавливают методом res.cookie. Этот метод на вход принимает
ключ и значение ключа jwt:token. Так же можно задать максимальный срок жизни.
Чтобы по умолчанию к кукам не было домтупа из JS, включают опцию httpOnly: true
*/

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  // доставли из переменной окружения секретный ключ. Переменная в файле .env
  const { JWT_SECRET } = process.env;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 86400 * 7,
          httpOnly: true,
        });
      res.send({ message: 'авторизация прошла успешна. Токен записан в куки' });
    })
    // создается экземпляр ошибки авторизации
    .catch((err) => next(new Unauthorized(err.message)));
};

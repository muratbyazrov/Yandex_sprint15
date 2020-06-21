// Подключили библиотеку экспресс
const express = require('express');

/* Этот пакет позволяет загружать пересменные из файла с расширением env,
где хранят переменную с секретым ключом. После этого env-переменные
из файла добавятся в process.env */
require('dotenv').config();

// mongoos - это некий сопоставитель, который помогает подружить JS с документами в MongoDB
const mongoose = require('mongoose');

// Этот модуль объединяет приходящие пакеты из запросв. Они доступны так: const { body } = req;
const bodyParser = require('body-parser');

// модуль, чтобы удобно извлекать токен из куков
const cookieParser = require('cookie-parser');

// Это модуль модуль нужен для безопасности https://expressjs.com/ru/advanced/best-practice-security.html
const helmet = require('helmet');

/* Этот модуль так же для безопасности, а миенно Для защиты от DDoS.
Материалы:
https://medium.com/webbdev/23-рекомендации-по-защите-node-js-приложений-e3fbc348f92
https://www.npmjs.com/package/express-rate-limit
*/
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// здесь мы подключили спец. мидлвер из библиотеки celebrate для предвартельной ошибки. См код роута
const { errors } = require('celebrate');

// подключили логгеры - запись запросов и ошибок
const { requestLogger, errorLogger } = require('./middlewares/logger');

// Подключили роуты
const { usersRouter } = require('./routes/usersRoute');
const { signin, signup } = require('./routes/index');
const cardsRouter = require('./routes/cardsRoute');
// const path = require('path');

// Так мы создали приложение на экспресс
const app = express();

// Лучше поставить helmet в начале как мидлвэр. Тогда все запросы будут проходить через него
app.use(helmet());

app.use(limiter);

/* В Node есть переменные окружения. Достать их можно из объекта process.env.
В частности, есть переменная PORT. Все переменные окружения пишут с заглавных букв */
const { PORT = 3000 } = process.env;

/* Все методы для работы с пакетами находятся в объекте bodyParser.
В данном случае испльзовали метод для собирания JSON-формата */
app.use(bodyParser.json());

// подключаем логгер ошибок
app.use(errorLogger);

// подключаем логгер запросов
app.use(requestLogger);

// Краш тест
app.use('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(cookieParser()); // подключаем парсер кук как мидлвэр

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use('/signup', signup);
app.use('/signin', signin);

app.all('/*', (req, res) => {
  res.status(404).send({ message: 'Запрашиваемый ресурс не найден' });
});

// подключаем логгер ошибок
app.use(errorLogger);

// обработчик ошибок celebrate
app.use(errors());

/*
Делаем централизованную обработку ошибок. Для этого добавляем мидлвер в конце
всех app.use. Первый параметр err - это ошибка. Чтобы ошибка сюда прилетела, надо
чтобы next в другим местах кода вызывался с аргументом - экземпляром ошибки:
next(new Error('Ошибка авторизации'));
*/
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    // проверяем статус и выставляем сообщение в зависимости от него
    message: statusCode === 500
      ? 'На сервере произошла ошибка'
      : message,
  });
});

// подключили монго. Тут меняется только название БД - mestodb
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
})
  // eslint-disable-next-line no-console
  .then(() => { console.log('БД подключена!'); })
  // eslint-disable-next-line no-console
  .catch(() => { console.log('БД не подключена(('); });


// Наше приложение буде слушать запросы, которые приходят на PORT
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});

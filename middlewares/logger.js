// Библиотеки для логирования - записи действий на сервере;
const winston = require('winston');
const expressWinston = require('express-winston');

/*
***логгируем два типа информации — запросы к серверу и ошибки, которые на нём происходят
***Опция transports отвечает за то, куда нужно писать лог;
***transports — это массив, в него можно записать и другие транспорты. Например,
логи можно писать в консоль или в сторонний сервис аналитики, но мы ограничимся файлом
*** Вторая опция — format отвечает за формат записи логов. Мы указали json
*/
const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: 'request.log' }),
  ],
  format: winston.format.json(),
});

/*
Отдельный логгер ошибок нужен для того, чтобы в случае возникновения ошибки, в лог записывалась
информация о ней  имя ошибки, сообщение, её стектрейс
*/
const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
  ],
});

module.exports = {
  requestLogger,
  errorLogger,
};

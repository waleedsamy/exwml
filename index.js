'use strict';
var winston = require('winston');
var rewriters = require('./rewriters');
var middleware = require('./middleware');

if (!process.env.LOG_FORMAT || process.env.LOG_FORMAT !== 'pretty') {
    process.env.LOG_FORMAT = 'json';
}

var recommendLevel = function() {
    if (process.env.LOG_LEVEL &&
        Object.keys(winston.config.syslog.levels).includes(process.env.LOG_LEVEL)) {
        return process.env.LOG_LEVEL;
    } else if (process.env.NODE_ENV === 'development') {
        return 'debug';
    } else {
        return 'info';
    }
}

var CONSOLE_OPTIONS = {
    humanReadableUnhandledException: process.env.LOG_FORMAT === 'pretty',
    silent: process.env.LOG_SUPPRESS === 'true',
    colorize: process.env.LOG_FORMAT === 'pretty',
    timestamp: !(process.env.LOG_FORMAT === 'pretty'),
    json: !(process.env.LOG_FORMAT === 'pretty'),
    stringify: !(process.env.LOG_FORMAT === 'pretty'),
    prettyPrint: !(process.env.LOG_FORMAT === 'pretty')
};

var options = {
    level: recommendLevel(),
    transports: [new winston.transports.Console(CONSOLE_OPTIONS)],
    exceptionHandlers: [new winston.transports.Console(CONSOLE_OPTIONS)],
    levels: winston.config.syslog.levels,
    rewriters: process.env.NODE_ENV === 'development' ? [rewriters.generalInfo, rewriters.xRequestId] : [rewriters.generalInfo, rewriters.xRequestId, rewriters.redactCriticalData]
};

global.logger = new winston.Logger(options);

logger.info("Logger is configured with LOG_FORMAT=%s and threshold=%s", process.env.LOG_FORMAT, recommendLevel(), CONSOLE_OPTIONS);

module.exports = {
    XRequestId: middleware.XRequestId,
    expressWinston: middleware.expressWinston
}

import { createLogger, transports, format } from 'winston';
import * as moment from 'moment';
import chalk = require('chalk');

const colorMap = {
    emerg: 'black',
    alert: 'black',
    crit: 'black',
    error: 'black',
    warning: 'black',
    notice: 'black',
    info: 'black',
    debug: 'black',
};
const backgroundColorMap = {
    emerg: 'white',
    alert: 'red',
    crit: 'blue',
    error: 'red',
    warning: 'orange',
    notice: 'blue',
    info: 'blue',
    debug: 'green',
};

const consoleTransport = new transports.Console({
    format: {
        transform: function({ level, message, durationMs }) {
            const timeStamp = moment().format('YYYY-MM-DD hh:mm:ss');
            console.log(
                chalk.reset(`[${timeStamp}]`),
                chalk.bgKeyword(backgroundColorMap[level]).keyword(colorMap[level])(` ${level} `),
                chalk.italic(durationMs ? `${message} in ${durationMs}ms` : message),
            );
            return false;
        },
    },
});

export const logger = createLogger({
    exitOnError: false,
    transports: [
        consoleTransport,
        new transports.File({
            filename: './desolid.log',
            level: 'warn',
            format: format.combine(format.timestamp(), format.json()),
            tailable: true,
        }),
    ],
});

export const log: (string) => void = logger.info.bind(logger);

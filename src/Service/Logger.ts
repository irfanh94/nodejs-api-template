import {injectable} from "inversify";
import {createLogger, format, Logger as WinstonLogger, LoggerOptions, transports as WinstonTransports} from "winston";
import * as WinstonTransport from "winston-transport";

const {
    combine,
    timestamp,
    prettyPrint,
    errors
} = format;

export type MetaLog = {
    processId?: string,
    [key: string]: string|number|object|unknown
};

@injectable()
export class Logger {

    private readonly winston: WinstonLogger

    constructor() {
        const formats = [];

        const transports: WinstonTransport[] = [
            new WinstonTransports.Console()
        ];

        if (typeof errors === "function")
            formats.push(errors({stack: true}));

        if (typeof timestamp === "function")
            formats.push(timestamp());

        if (typeof prettyPrint === "function")
            formats.push(prettyPrint());

        const options: LoggerOptions = {
            level: 'info',
            transports: transports
        };

        if (typeof combine === "function")
            options.format = combine(...formats);

        this.winston = createLogger(options);
    }

    public info(message: any, meta?: MetaLog): void {
        this.winston.info(message, meta);
    }

    public debug(message: any, meta?: MetaLog): void {
        this.winston.debug(message, meta);
    }

    public error(message: any, meta?: MetaLog): void {
        this.winston.error(message, meta);
    }

}
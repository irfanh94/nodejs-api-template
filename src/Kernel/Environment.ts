import {injectable} from "inversify";
import {config} from "dotenv";

export enum EnvironmentKeys {
    APP_ENV = "APP_ENV",
    APP_NAME = "APP_NAME",
    APP_SECRET = "APP_SECRET",
    APP_HTTP_PORT = "APP_HTTP_PORT",
    APP_HTTP_BODY_LIMIT = "APP_HTTP_BODY_LIMIT",
    APP_HTTP_CORS = "APP_HTTP_CORS",
    DATABASE_URL = "DATABASE_URL",
    DATABASE_CONNECTION_LIMIT = "DATABASE_CONNECTION_LIMIT"
}

export type EnvironmentVariables = {[key in EnvironmentKeys]: string};

@injectable()
export class Environment {

    private readonly env: EnvironmentVariables;

    constructor() {
        this.env = <EnvironmentVariables>{
            ...config().parsed,
            ...config({path: process.cwd() + "/.env.local", override: true}).parsed,
            ...process.env
        };
    }

    public get(key: EnvironmentKeys): string {
        return this.env[key];
    }

    public getAll(): {[key: string]: string} {
        return this.env;
    }
}
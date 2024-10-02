import {Container} from "inversify";
import {IndexController} from "../Http/Controller/IndexController";
import {Environment} from "./Environment";
import {UserAuthentication} from "../Service/Authentication/UserAuthentication";
import {DbManager} from "../Db/DbManager";
import {UserRepository} from "../Db/Repository/UserRepository";
import {JwtAuthenticationMiddleware} from "../Http/Middleware/JwtAuthenticationMiddleware";
import {RequestValidatorMiddleware} from "../Http/Middleware/RequestValidatorMiddleware";
import {AuthenticateController} from "../Http/Controller/AuthenticateController";
import {AccountController} from "../Http/Controller/AccountController";
import {Logger} from "../Service/Logger";

export const container = new Container();

container.bind(Environment).toSelf();

// controllers
container.bind(IndexController).toSelf();
container.bind(AuthenticateController).toSelf();
container.bind(AccountController).toSelf();

// controllers middlewares
container.bind(JwtAuthenticationMiddleware).toSelf();
container.bind(RequestValidatorMiddleware).toSelf();

// services
container.bind(Logger).toSelf();
container.bind(UserAuthentication).toSelf();

// repository
container.bind(DbManager).toSelf();
container.bind(UserRepository).toSelf();
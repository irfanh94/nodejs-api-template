import {BaseHttpController, controller, httpPost} from "inversify-express-utils";
import { body } from 'express-validator';
import {Request} from "express";
import {inject} from "inversify";
import {UserRepository} from "../../Db/Repository/UserRepository";
import {RequestValidatorMiddleware} from "../Middleware/RequestValidatorMiddleware";
import * as bcrypt from "bcryptjs";
import {UserAuthentication} from "../../Service/Authentication/UserAuthentication";
import {JsonResult} from "inversify-express-utils/lib/results";
import {Logger} from "../../Service/Logger";

@controller("/authenticate")
export class AuthenticateController extends BaseHttpController {

    constructor(
        @inject(UserRepository) private readonly userRepository: UserRepository,
        @inject(UserAuthentication) private readonly userAuthentication: UserAuthentication,
        @inject(Logger) private readonly logger: Logger
    ) {
        super();
    }

    @httpPost(
        "/email-and-password",
        body("email").isEmail().withMessage("email must be valid"),
        body("password").isString().withMessage("password must be string").notEmpty().withMessage("password must not be empty"),
        RequestValidatorMiddleware
    )
    public async authenticateWithEmailAndPassword(request: Request): Promise<JsonResult> {
        try {
            const body = request.body as {email: string, password: string};

            const user = (await this.userRepository.getUserByEmails([body.email])).pop();

            if (!user)
                return this.json({code: "wrong_credentials"}, 401);

            if (!bcrypt.compareSync(body.password, user.password))
                return this.json({code: "wrong_credentials"}, 401);

            return this.json({
                token: await this.userAuthentication.createToken({id: user.id, email: user.email}),
                user: user
            });
        } catch (error) {
            this.logger.error(error, {processId: request.processId});

            return this.json({
                code: "internal_server_error"
            }, 500);
        }
    }

}
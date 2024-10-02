import {BaseHttpController, controller, httpPost} from "inversify-express-utils";
import { body } from 'express-validator';
import {Request} from "express";
import {inject} from "inversify";
import {UserRepository} from "../../Db/Repository/UserRepository";
import {RequestValidatorMiddleware} from "../Middleware/RequestValidatorMiddleware";
import * as bcrypt from "bcryptjs";
import {UserAuthentication} from "../../Service/Authentication/UserAuthentication";

@controller("/authenticate")
export class AuthenticateController extends BaseHttpController {

    constructor(
        @inject(UserRepository) private readonly userRepository: UserRepository,
        @inject(UserAuthentication) private readonly userAuthentication: UserAuthentication
    ) {
        super();
    }

    @httpPost(
        "/email-and-password",
        body("email").isEmail().withMessage("email must be valid"),
        body("password").isString().withMessage("password must be string").notEmpty().withMessage("password must not be empty"),
        RequestValidatorMiddleware
    )
    public async authenticateWithEmailAndPassword(request: Request) {
        const body = request.body as {email: string, password: string};

        const user = (await this.userRepository.getUserByEmails([body.email])).pop();

        if (!user)
            return this.json({code: "wrong_credentials"}, 404);

        if (!bcrypt.compareSync(body.password, user.password))
            return this.json({code: "wrong_credentials"}, 404);

        return {
            token: await this.userAuthentication.createToken({id: user.id, email: user.email}),
            user: user
        };
    }

}
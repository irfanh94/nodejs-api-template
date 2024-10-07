import {BaseHttpController, controller, httpPost} from "inversify-express-utils";
import {RequestValidatorMiddleware} from "../Middleware/RequestValidatorMiddleware";
import {body} from "express-validator";
import {Request} from "express";
import {DuplicateRecordException} from "../../Exception/DuplicateRecordException";
import {inject} from "inversify";
import {SignUpService} from "../../Service/User/SignUpService";
import {Logger} from "../../Service/Logger";
import {UserAuthentication} from "../../Service/Authentication/UserAuthentication";

@controller("/sign-up")
export class SignUpController extends BaseHttpController {

    constructor(
        @inject(SignUpService) private readonly signUpService: SignUpService,
        @inject(UserAuthentication) private readonly userAuthentication: UserAuthentication,
        @inject(Logger) private readonly logger: Logger
    ) {
        super();
    }

    @httpPost(
        "/",
        body("email").isEmail().withMessage("email must be valid"),
        body("password")
            .isString().withMessage("password must be string")
            .isLength({min: 8}).withMessage("password must contain at least 8 characters"),
        RequestValidatorMiddleware
    )
    public async signUp(request: Request) {
        const body = request.body as {email: string, password: string};

        try {
            const user = await this.signUpService.register(body.email, body.password);

            return this.json({
                token: await this.userAuthentication.createToken({id: user.id, email: user.email}),
                user: user
            });
        } catch (error) {
            if (error instanceof DuplicateRecordException)
                return this.json({code: "user_exists"}, 422);

            this.logger.error(error, {processId: request.processId});
            return this.json({code: "internal_server_error"}, 500);
        }
    }

}
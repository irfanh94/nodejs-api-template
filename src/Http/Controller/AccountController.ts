import {BaseHttpController, controller, httpGet} from "inversify-express-utils";
import {JwtAuthenticationMiddleware} from "../Middleware/JwtAuthenticationMiddleware";
import {Request} from "express";
import {inject} from "inversify";
import {UserRepository} from "../../Db/Repository/UserRepository";

@controller("/account")
export class AccountController extends BaseHttpController {

    constructor(
        @inject(UserRepository) private readonly userRepository: UserRepository
    ) {
        super();
    }

    @httpGet(
        "/",
        JwtAuthenticationMiddleware
    )
    private get(request: Request) {
        if (!request.authenticatedUser)
            return this.json({code: "not_authenticated"}, 401);

        return request.authenticatedUser.user;
    }

}
import {BaseMiddleware} from "inversify-express-utils";
import {inject, injectable} from "inversify";
import {NextFunction, Request, Response} from "express";
import {Environment} from "../../Kernel/Environment";
import {UserRepository} from "../../Db/Repository/UserRepository";
import {UserAuthentication} from "../../Service/Authentication/UserAuthentication";
import {AuthenticatedUser} from "../../Service/Authentication/AuthenticatedUser";
import {Logger} from "../../Service/Logger";

@injectable()
export class JwtAuthenticationMiddleware extends BaseMiddleware {

    constructor(
        @inject(Environment) private readonly environment: Environment,
        @inject(Logger) private readonly logger: Logger,
        @inject(UserRepository) private readonly userRepository: UserRepository,
        @inject(UserAuthentication) private readonly userAuthentication: UserAuthentication
    ) {
        super();
    }

    public async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
        if (response.headersSent) {
            return next("route");
        }

        try {
            const jwtPayload = this.userAuthentication.getJwtFromRequest(request);

            if (!jwtPayload) {
                response.status(401).json({code: "not_authenticated"});
                return;
            }

            const user = (await this.userRepository.getUserByIds([jwtPayload.id])).pop();

            if (!user) {
                response.status(403).json({code: "not_authenticated"});
                return;
            }

            request.authenticatedUser = new AuthenticatedUser(user);

        } catch (error) {
            this.logger.error(error, {processId: request.processId});
            response.status(403).json({code: "not_authenticated"});
        }

        next();
    }

}
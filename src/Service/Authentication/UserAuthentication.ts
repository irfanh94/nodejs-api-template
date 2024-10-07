import {verify} from "jsonwebtoken";
import {Request} from "express";
import {inject, injectable} from "inversify";
import {Environment, EnvironmentKeys} from "../../Kernel/Environment";
import {JwtPayload} from "./Types";
import {sign} from "jsonwebtoken";

@injectable()
export class UserAuthentication {

    constructor(
        @inject(Environment) private readonly environment: Environment
    ) {}

    public getJwtFromRequest(request: Request): JwtPayload|null {
        const token = (<string>request.headers['x-access-token'] ?? '').trim();

        if (token.length <= 0)
            return null;

        return this.verifyToken(token);
    }

    public verifyToken(token: string): JwtPayload|null {
        try {
            return <JwtPayload>verify(token, this.environment.get(EnvironmentKeys.APP_SECRET));
        } catch (error) {
            return null;
        }
    }

    public async createToken(payload: JwtPayload): Promise<string> {
        return sign(
            payload,
            this.environment.get(EnvironmentKeys.APP_SECRET)
        );
    }

}
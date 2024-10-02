import {Prisma} from "@prisma/client";
import {GetFindResult} from "@prisma/client/runtime/library";

export class AuthenticatedUser {

    constructor(
        public readonly user: GetFindResult<Prisma.$UserEntityPayload, any, any>
    ) {}

}
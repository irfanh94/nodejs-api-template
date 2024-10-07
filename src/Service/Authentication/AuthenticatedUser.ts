import {UserEntity} from "@prisma/client";

export class AuthenticatedUser {

    constructor(
        public readonly user: UserEntity
    ) {}

}
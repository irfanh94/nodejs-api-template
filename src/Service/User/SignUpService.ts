import {inject, injectable} from "inversify";
import {UserEntity} from "@prisma/client";
import {UserRepository} from "../../Db/Repository/UserRepository";
import {DuplicateRecordException} from "../../Exception/DuplicateRecordException";
import {UuidV7} from "../../Common/UuidV7";
import {hashSync, genSaltSync} from "bcryptjs";

@injectable()
export class SignUpService {

    constructor(
        @inject(UserRepository) private readonly userRepository: UserRepository
    ) {}

    public async register(email: string, password: string): Promise<UserEntity> {
        email = email.toLowerCase();

        let user = (await this.userRepository.getUserByEmails([email])).pop();

        if (user)
            throw new DuplicateRecordException("User already exists.");

        return this.userRepository.createUser(
            UuidV7.new(),
            email,
            hashSync(password, genSaltSync(13))
        );
    }

}
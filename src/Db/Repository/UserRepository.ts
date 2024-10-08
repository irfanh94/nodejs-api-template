import {inject, injectable} from "inversify";
import {DbManager} from "../DbManager";
import {Prisma} from "@prisma/client";
import {UuidV7} from "../../Common/UuidV7";
import {UserEntity} from "@prisma/client";

@injectable()
export class UserRepository {

    private readonly dbClient: Prisma.UserEntityDelegate;

    constructor(
        @inject(DbManager) dbManager: DbManager
    ) {
        this.dbClient = dbManager.getClient().userEntity;
    }

    public getUserByEmails(emails: string[]) {
        return this.dbClient.findMany({
            where: {
                email: {
                    in: emails
                }
            }
        });
    }

    public getUserByIds(ids: string[]) {
        return this.dbClient.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
    }

    public createUser(id: UuidV7, email: string, password: string) {
        return this.dbClient.create({
            data: {
                id: id.toString(),
                email: email,
                password: password
            }
        }) as Promise<UserEntity>;
    }

    public deleteUsers(ids: UuidV7[]) {
        return this.dbClient.deleteMany({
            where: {
                id: {
                    in: ids.map(id => id.toString())
                }
            }
        })
    }
}
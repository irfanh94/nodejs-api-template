import {inject, injectable} from "inversify";
import {DbManager} from "../DbManager";
import {Prisma} from "@prisma/client";

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

}
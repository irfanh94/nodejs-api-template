import {inject, injectable} from "inversify";
import {Environment, EnvironmentKeys} from "../Kernel/Environment";
import {PrismaClient} from "@prisma/client";

@injectable()
export class DbManager {

    private readonly client: PrismaClient;

    constructor(
        @inject(Environment) private readonly environment: Environment
    ) {
        const databaseUrl = this.environment.get(EnvironmentKeys.DATABASE_URL);
        const databaseConnections = this.environment.get(EnvironmentKeys.DATABASE_CONNECTION_LIMIT);

        this.client = new PrismaClient({
            datasources: {
                db: {
                    url: `${databaseUrl}?connection_limit=${databaseConnections}`
                }
            }
        });
    }

    public getClient(): PrismaClient {
        return this.client;
    }

}
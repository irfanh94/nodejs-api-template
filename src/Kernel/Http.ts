import {Container} from "inversify";
import {Environment, EnvironmentKeys} from "./Environment";
import {InversifyExpressServer} from "inversify-express-utils";
import * as express from "express";
import bodyParser from "body-parser";
import {Server} from "http";
import cors from "cors";
import {v4 as uuidV4} from "uuid";
import {Logger} from "../Service/Logger";
import {DbManager} from "../Db/DbManager";
const fileUpload = require("express-fileupload");

export class Http {

    private readonly environment: Environment;
    private readonly logger: Logger;
    private readonly server: InversifyExpressServer;
    private readonly application: express.Application;
    private readonly dbManager: DbManager;

    private httpServer: Server|null = null;

    constructor(
        container: Container
    ) {
        this.environment = container.get(Environment);
        this.logger = container.get(Logger);
        this.dbManager = container.get(DbManager);

        this.server = new InversifyExpressServer(container);

        this.server.setConfig((application) => {
            this.setupBodyParser(application);
            this.setupCors(application);
            this.setupFileUpload(application);
            this.setupProcessId(application);
        });

        this.application = this.server.build();
    }

    private setupBodyParser(application: express.Application): void {
        application.use(bodyParser.urlencoded({
            limit: this.environment.get(EnvironmentKeys.APP_HTTP_BODY_LIMIT),
            extended: true
        }));

        application.use(bodyParser.json({
            limit: this.environment.get(EnvironmentKeys.APP_HTTP_BODY_LIMIT)
        }));
    }

    private setupCors(application: express.Application): void {
        application.use(cors({
            origin: this.environment.get(EnvironmentKeys.APP_HTTP_CORS),
            optionsSuccessStatus: 200
        }));

        application.options("*", cors());
    }

    private setupFileUpload(application: express.Application): void {
        application.use(fileUpload())
    }

    private setupProcessId(application: express.Application): void {
        application.use((request, response, next): void => {
            const processId = request.header("process-id") ?? uuidV4().toString();

            (request as express.Request).processId = processId;

            response.setHeader("process-id", processId);
            next();
        });
    }

    public start(): Promise<void> {
        return new Promise((resolve) => {
            this.httpServer = this.application.listen(this.environment.get(EnvironmentKeys.APP_HTTP_PORT), () => {
                resolve();
            });
        })
    }

    public stop(): Promise<void> {
        return new Promise((resolve) => {
            this.httpServer?.closeAllConnections();
            this.httpServer?.close(() => {
                resolve();
            });
        })
    }
}
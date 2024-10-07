import "reflect-metadata";
import {container} from "./Kernel/Container";
import {Http} from "./Kernel/Http";
import {Logger} from "./Service/Logger";

const logger = container.get<Logger>(Logger);
const http = new Http(container);

http
    .start()
    .then(() => {
        logger.info("http started")
    })
    .catch((error) => {
        logger.error(error);
    });
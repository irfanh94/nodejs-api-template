import "reflect-metadata";
import {container} from "./Kernel/Container";
import {Http} from "./Kernel/Http";

const http = new Http(container);

http.start();
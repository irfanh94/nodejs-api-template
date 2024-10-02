import "express";
import {AuthenticatedUser} from "../Service/Authentication/AuthenticatedUser";

declare module "express" {
    class Request {
        processId: string
        authenticatedUser?: AuthenticatedUser
    }
}
import {BaseMiddleware} from "inversify-express-utils";
import e from "express";
import {injectable} from "inversify";
import {validationResult} from "express-validator";

@injectable()
export class RequestValidatorMiddleware extends BaseMiddleware {

    public handler(request: e.Request, response: e.Response, next: e.NextFunction) {
        if (response.headersSent) {
            return next("route");
        }

        const validationErrors = validationResult(request);

        if (!validationErrors.isEmpty()) {
            response.status(400).json({code: "bad_request", meta: validationErrors.array()});
            return false;
        }

        next();
    }

}
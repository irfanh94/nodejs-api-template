import {BaseHttpController, controller, httpGet} from "inversify-express-utils";
import {JsonResult} from "inversify-express-utils/lib/results";

@controller("/")
export class IndexController extends BaseHttpController {

    @httpGet("")
    private index(): JsonResult {
        return this.json({
            status: "ok"
        });
    }

}
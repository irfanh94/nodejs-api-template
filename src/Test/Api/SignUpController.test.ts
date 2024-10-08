import "reflect-metadata";
import {afterEach, beforeEach, describe, it} from "node:test";
import {deepStrictEqual, strictEqual} from "node:assert";
import {container} from "../../Kernel/Container";
import {Http} from "../../Kernel/Http";
import axios from "axios";
import {Environment, EnvironmentKeys} from "../../Kernel/Environment";
import AxiosXHR = Axios.AxiosXHR;
import {ErrorResponse} from "./Types";
import {faker} from '@faker-js/faker';
import {validate} from "uuid";
import {compareSync} from "bcryptjs";
import {sleep} from "../../Common/Misc";
import {UserAuthentication} from "../../Service/Authentication/UserAuthentication";

const environment: Environment = container.get(Environment);
const http = new Http(container);

const requestClient: Axios.AxiosInstance = axios.create({
    baseURL: `http://localhost:${environment.get(EnvironmentKeys.APP_HTTP_PORT)}/sign-up`,
    validateStatus: status => true
});

beforeEach(async () => {
    await sleep(100);
    await http.start();
});

afterEach(async () => {
    await http.stop();
});

describe("SignUpController", () => {
    describe("POST /sign-up", () => {
        it("should return bad request on non-existing data", async () => {
            const response = await requestClient.post("/") as AxiosXHR<ErrorResponse>;

            strictEqual(response.status, 400);
            strictEqual(response.data.code, "bad_request");
            deepStrictEqual(response.data.meta, [
                {
                    location: "body",
                    msg: "email must be valid",
                    path: "email",
                    type: "field"
                },
                {
                    location: "body",
                    msg: "password must be string",
                    path: "password",
                    type: "field"
                },
                {
                    location: "body",
                    msg: "password must contain at least 8 characters",
                    path: "password",
                    type: "field"
                }
            ]);
        });

        it('should return bad request on invalid data', async () => {
            const response = await requestClient.post("/", {
                email: "foo",
                password: "bar"
            }) as AxiosXHR<ErrorResponse>;

            strictEqual(response.status, 400);
            strictEqual(response.data.code, "bad_request");
            deepStrictEqual(response.data.meta, [
                {
                    location: "body",
                    msg: "email must be valid",
                    path: "email",
                    type: "field",
                    value: "foo"
                },
                {
                    location: "body",
                    msg: "password must contain at least 8 characters",
                    path: "password",
                    type: "field",
                    value: "bar"
                }
            ]);
        });

        it('should return user_exists on duplicate data', async () => {
            const email = faker.internet.email();
            const password = faker.internet.password({length: 8})

            const responseWithOk = await requestClient.post("/", {email, password}) as AxiosXHR<ErrorResponse>;

            strictEqual(responseWithOk.status, 200);

            const responseWithError = await requestClient.post("/", {email, password}) as AxiosXHR<ErrorResponse>;

            strictEqual(responseWithError.status, 422);
            strictEqual(responseWithError.data.code, "user_exists");
            strictEqual(responseWithError.data.meta, undefined);
        });

        it('should return user data on sign-up', async () => {
            const email = faker.internet.email();
            const password = faker.internet.password({length: 8})

            const responseWithOk = await requestClient.post("/", {email, password}) as AxiosXHR<{
                token: string,
                user: {
                    id: string,
                    email: string,
                    password: string
                }
            }>;

            const responseToken = container.get(UserAuthentication).verifyToken(responseWithOk.data.token);

            strictEqual(responseWithOk.status, 200);
            strictEqual(email.toLowerCase(), responseToken?.email);
            strictEqual(true, validate(responseToken?.id ?? ""));
            strictEqual(true, validate(responseWithOk.data.user.id));
            strictEqual(email.toLowerCase(), responseWithOk.data.user.email);
            strictEqual(true, compareSync(password, responseWithOk.data.user.password));
        });
    });
});
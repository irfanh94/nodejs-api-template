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
import {hashSync} from "bcryptjs";
import {sleep} from "../../Common/Misc";
import {UserAuthentication} from "../../Service/Authentication/UserAuthentication";
import {UserRepository} from "../../Db/Repository/UserRepository";
import {UuidV7} from "../../Common/UuidV7";

const environment: Environment = container.get(Environment);
const userRepository: UserRepository = container.get(UserRepository);
const http = new Http(container);

const requestClient: Axios.AxiosInstance = axios.create({
    baseURL: `http://localhost:${environment.get(EnvironmentKeys.APP_HTTP_PORT)}/authenticate`,
    validateStatus: status => true
});

const userId = UuidV7.new();
const userEmail = faker.internet.email().toLowerCase();
const userPassword = faker.internet.password({length: 8});
const userPasswordHashed = hashSync(userPassword, 13);

beforeEach(async () => {
    await sleep(100);
    await http.start();
    await userRepository.createUser(userId, userEmail, userPasswordHashed);
});

afterEach(async () => {
    await http.stop();
    await userRepository.deleteUsers([userId]);
});

describe("AuthenticateController", () => {
    describe("POST /email-and-password", () => {
        it("should not authenticate with empty body", async () => {
            const response = await requestClient.post("/email-and-password") as AxiosXHR<ErrorResponse>;

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
                    msg: "password must not be empty",
                    path: "password",
                    type: "field"
                }
            ]);
        });

        it("should not authenticate with wrong email and password", async () => {
            const response = await requestClient.post("/email-and-password", {
                email: userEmail,
                password: userPassword + "-false"
            }) as AxiosXHR<ErrorResponse>;

            strictEqual(response.status, 401);
            strictEqual(response.data.code, "wrong_credentials");
            strictEqual(response.data.meta, undefined);
        });

        it("should authenticate with email and password", async () => {
            const response = await requestClient.post("/email-and-password", {email: userEmail, password: userPassword}) as AxiosXHR<{
                token: string,
                user: {
                    id: string,
                    email: string,
                    password: string
                }
            }>;

            const responseToken = container.get(UserAuthentication).verifyToken(response.data.token);

            strictEqual(response.status, 200);
            strictEqual(true, responseToken !== null);
            strictEqual(userId.toString(), response.data.user.id);
            strictEqual(userEmail, response.data.user.email);
            strictEqual(userPasswordHashed, response.data.user.password);
        });
    });
});
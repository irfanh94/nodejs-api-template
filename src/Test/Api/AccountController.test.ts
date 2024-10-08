import "reflect-metadata";
import {afterEach, beforeEach, describe, it} from "node:test";
import {strictEqual} from "node:assert";
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
    baseURL: `http://localhost:${environment.get(EnvironmentKeys.APP_HTTP_PORT)}/account`,
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

describe("AccountController", () => {
    describe("GET /", () => {
        it("should not authorize with empty header", async () => {
            const response = await requestClient.get("/") as AxiosXHR<ErrorResponse>;

            strictEqual(response.status, 401);
            strictEqual(response.data.code, "not_authenticated");
            strictEqual(response.data.meta, undefined);
        });

        it("should not authorize with wrong jwt", async () => {
            const response = await requestClient.get("/", {
                headers: {
                    "x-access-token": "false-jwt"
                }
            }) as AxiosXHR<ErrorResponse>;

            strictEqual(response.status, 401);
            strictEqual(response.data.code, "not_authenticated");
            strictEqual(response.data.meta, undefined);
        });

        it("should get user data with jwt", async () => {
            const userJwt = await container.get(UserAuthentication).createToken({
                id: userId.toString(),
                email: userEmail
            });

            const response = await requestClient.get("/", {headers: {"x-access-token": userJwt}}) as AxiosXHR<{
                id: string,
                email: string,
                password: string
            }>;

            strictEqual(response.status, 200);
            strictEqual(userId.toString(), response.data.id);
            strictEqual(userEmail, response.data.email);
            strictEqual(userPasswordHashed, response.data.password);
        });
    });
});
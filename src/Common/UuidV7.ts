import {v7, validate, version} from "uuid";

export class UuidV7 {

    constructor(private readonly id: string) {
        if (!validate(this.id))
            throw new Error("UUID not valid.");

        if (version(this.id) !== 7)
            throw new Error("UUID not v7.");
    }

    public toString(): string {
        return this.id;
    }

    public static new(): UuidV7 {
        return new UuidV7(v7());
    }
}
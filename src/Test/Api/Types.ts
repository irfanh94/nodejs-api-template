export type ErrorResponse = {
    code: string,
    meta?: {
        location: string,
        msg: string,
        path: string,
        type: string,
        value?: string
    }[]
}
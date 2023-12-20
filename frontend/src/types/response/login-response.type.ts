export type LoginResponseType = {
    tokens: {accessToken: string, refreshToken: string},
    user: {name: string, lastName: string, id: number}
}
export type LoginErrorResponseType = {
    error: boolean,
    message: string
}
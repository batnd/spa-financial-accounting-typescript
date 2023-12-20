import config from "../../config/config";
import {RefreshResponseType} from "../types/response/refresh-response.type";
import {UserInfoType} from "../types/user-info.type";
import {LogoutResponseType} from "../types/response/logout-response.type";

export class Auth {
    public static accessTokenKey: string = 'accessToken';
    private static refreshTokenKey: string = 'refreshToken';
    private static userInfoKey: string = 'userInfo';

    public static async processUnauthorizedResponse(): Promise<boolean> {
        const currentUrlRoute: string = window.location.hash.split('?')[0];
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);

        if (refreshToken) {
            const response: Response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });

            if (response && response.status === 200) {
                const result: RefreshResponseType | null = await response.json();
                if (result && !result.error && result.tokens) {
                    this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    return true;
                }
            }
        }
        this.removeTokens();
        if (currentUrlRoute === '#/login' || currentUrlRoute === '#/signup') {
            return false;
        }
        location.href = '#/login';
        return false;
    }

    public static async logout(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);

        if (refreshToken) {
            const response: Response = await fetch(config.host + '/logout', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });
            if (response && response.status === 200) {
                const result: LogoutResponseType | null = await response.json();
                if (result && !result.error) {
                    this.removeTokens();
                    localStorage.removeItem(this.userInfoKey);
                    return true;
                }
            }
        }
        return false;
    }

    public static setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    private static removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    public static setUserInfo(info: UserInfoType): void {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

    public static getUserInfo(): UserInfoType | null {
        const userInfo: string | null = localStorage.getItem(this.userInfoKey);
        if (userInfo) {
            return JSON.parse(userInfo);
        }
        return null;
    }
}
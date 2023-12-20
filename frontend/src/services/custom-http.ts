import {Auth} from "./auth";
import {HttpRequestBodyType} from "../types/http-request-body.type";

export class CustomHttp {
    public static async httpRequest(url: string, method: string = "GET", body: HttpRequestBodyType | null = null): Promise<any> {
        const params: any = {
            method: method,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
            }
        };
        let token: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (token) {
            params.headers['x-auth-token'] = token;
        }

        if (body) {
            params.body = JSON.stringify(body);
        }

        const response: Response = await fetch(url, params);

        if (response.status < 200 || response.status >= 300) {
            if (response.status === 401) {
                const result: boolean = await Auth.processUnauthorizedResponse();
                if (result) {
                    return await this.httpRequest(url, method, body);
                } else {
                    return response.status;
                }
            }
            if (response.status === 400) {
                return response.status;
            }
            if (response.status === 404) {
                return response.status;
            }
            throw new Error(response.statusText);
        }
        return await response.json();
    }
}
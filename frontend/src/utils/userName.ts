import {Auth} from "../services/auth";
import {UserInfoType} from "../types/user-info.type";

export class UserName {
    public static async setUserName(): Promise<void> {
        const userDataElement: HTMLElement | null = document.getElementById('userData');
        const userData: UserInfoType | null = Auth.getUserInfo();
        if (userData && userDataElement) {
            userDataElement.innerText = `${userData.name} ${userData.lastName}`;
        } else {
            await Auth.logout();
            window.location.href = '#/login';
            return;
        }
    }
}
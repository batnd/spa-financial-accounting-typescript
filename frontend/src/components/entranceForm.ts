import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {EntranceFormType} from "../types/entrance-form.type";
import {SignupResponse} from "../types/response/signup-response";
import {LoginErrorResponseType, LoginResponseType} from "../types/response/login-response.type";

export class EntranceForm {
    readonly page: string;
    private processButton: HTMLElement | null;
    private rememberMeElement: HTMLElement | null;
    private passwordField: EntranceFormType | null;
    private passwordRepeatField: EntranceFormType | null;
    private passwordFieldValue: string | null;
    private passwordRepeatFieldValue: string | null;
    readonly allInputs: NodeListOf<HTMLElement> | null;
    private lastInput: HTMLElement;
    private fields: EntranceFormType[];

    constructor(page: string) {
        this.processButton = null;
        this.rememberMeElement = null;
        this.passwordField = null;
        this.passwordRepeatField = null;
        this.passwordFieldValue = null;
        this.passwordRepeatFieldValue = null;

        this.allInputs = document.querySelectorAll('.sign-input');
        this.lastInput = this.allInputs[this.allInputs.length - 1];

        this.page = page;
        this.fields = [];

        // --------------------------------------------------------------
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/main';
            return;
        }
        // --------------------------------------------------------------

        this.fieldsDefinition();
        this.actionsDefinition();

        this.fieldsEventsDefinition();
    }

    private actionsDefinition(): void {
        const that: EntranceForm = this;
        this.processButton = document.getElementById('processButton');
        if (this.processButton) {
            this.processButton.addEventListener('click', (): void => {
                this.processForm();
            });
        }
    }

    private fieldsDefinition(): void {
        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
            }
        ];
        if (this.page === 'signup') {
            this.fields.unshift({
                name: 'fullName',
                id: 'fullName',
                element: null,
                regex: /[А-Я][а-я]+\s[А-Я][а-я]+\s[А-Я][а-я]+/,
                valid: false,
            });
            this.fields.push({
                name: 'passwordRepeat',
                id: 'passwordRepeat',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
            });
        }
    }

    private fieldsEventsDefinition(): void {
        const that: EntranceForm = this;
        this.fields.forEach((field: EntranceFormType): void => {
            field.element = document.getElementById(field.id);
            if (field.name === 'password') {
                this.passwordField = field;
                if (field.element) {
                    field.element.onchange = function (): void {
                        that.passwordFieldValue = (field.element as HTMLInputElement).value;

                        that.validateField.call(that, field, this as HTMLElement);

                        if (that.page === 'signup') {
                            that.validateRepeatPasswordField();
                        }
                    }
                    return;
                }
            }
            if (field.name === 'passwordRepeat') {
                this.passwordRepeatField = field;
                if (field.element) {
                    field.element.onchange = function (): void {
                        that.passwordRepeatFieldValue = (field.element as HTMLInputElement).value;

                        that.validateRepeatPasswordField();
                    }
                    return;
                }
            }
            if (field.element) {
                field.element.onchange = function (): void {
                    that.validateField.call(that, field, this as HTMLElement);
                }
            }
        });

        if (this.page === 'login') {
            this.rememberMeElement = document.getElementById('rememberMe');
        }
    }

    private validateField(field: EntranceFormType, element: HTMLElement): void {
        if (!(element as HTMLInputElement).value || !(element as HTMLInputElement).value.match(field.regex)) {
            this.fieldElementInvalid(field, element);
        } else {
            this.fieldElementIsValid(field, element);
        }
        this.validateForm();
    }

    private validateRepeatPasswordField(): void {
        if (this.passwordField) {
            if (this.passwordRepeatFieldValue !== this.passwordFieldValue || this.passwordField.valid === false) {
                if (this.passwordRepeatField) this.fieldElementInvalid(this.passwordRepeatField, <HTMLElement>this.passwordRepeatField.element);
            } else {
                if (this.passwordRepeatField) this.fieldElementIsValid(this.passwordRepeatField, <HTMLElement>this.passwordRepeatField.element);
            }
            this.validateForm();
        }
    }

    private fieldElementInvalid(field: EntranceFormType, element: HTMLElement): void {
        const elem: HTMLElement = element as HTMLElement;
        elem.classList.remove('border-secondary-subtle');
        elem.classList.add('border-danger');
        elem.classList.add('border-2');
        field.valid = false;
    }

    private fieldElementIsValid(field: EntranceFormType, element: HTMLElement): void {
        const elem: HTMLElement = element as HTMLElement;
        elem.classList.add('border-secondary-subtle');
        elem.classList.remove('border-danger');
        elem.classList.remove('border-2');
        field.valid = true;
    }

    private validateForm(): boolean {
        const validForm: boolean = this.fields.every((field: EntranceFormType) => field.valid);
        const isValid: boolean = validForm;
        if (isValid) {
            if (this.processButton) this.processButton.classList.remove('disabled');
        } else {
            if (this.processButton) this.processButton.classList.add('disabled');
        }
        return isValid;
    }

    private async processForm(): Promise<void> {
        if (this.validateForm()) {
            // login
            const emailValue: string = (this.fields.find((field: EntranceFormType): boolean => field.name === 'email')!.element as HTMLInputElement).value;
            const passwordValue: string = (this.fields.find((field: EntranceFormType): boolean => field.name === 'password')!.element as HTMLInputElement).value;
            const rememberMeValue: boolean = this.rememberMeElement ? (this.rememberMeElement as HTMLInputElement).checked : false;

            this.validUser();

            if (this.page === 'signup') {
                // add for signup
                const fullNameValue = (this.fields.find((field: EntranceFormType): boolean => field.name === 'fullName')!.element as HTMLInputElement).value;
                const firstName: string = fullNameValue.split(' ')[1];
                const lastName: string = fullNameValue.split(' ')[0];
                const passwordRepeatValue: string = (this.fields.find((field: EntranceFormType): boolean => field.name === 'passwordRepeat')!.element as HTMLInputElement).value;
                try {
                    const result: SignupResponse | number = await CustomHttp.httpRequest(config.host + '/signup', 'POST', {
                        name: firstName,
                        lastName: lastName,
                        email: emailValue,
                        password: passwordValue,
                        passwordRepeat: passwordRepeatValue
                    });
                    if (result && result !== 400) {
                        if ((result as SignupResponse).error || !(result as SignupResponse).user) {
                            throw new Error((result as SignupResponse).message);
                        }
                        this.processCompleted();
                        this.processButton!.classList.add('disabled');
                    }
                    if (result === 400) {
                        this.invalidUser();
                        return;
                    }
                } catch (error) {
                    return console.log(error);
                }
            }

            try {
                const result: LoginResponseType | LoginErrorResponseType | number = await CustomHttp.httpRequest(config.host + '/login', 'POST', {
                    email: emailValue,
                    password: passwordValue,
                    rememberMe: rememberMeValue
                });
                if (result && result !== 400 && result !== 401) {
                    if ((result as LoginErrorResponseType).error ||
                        !(result as LoginResponseType).tokens.accessToken ||
                        !(result as LoginResponseType).tokens.refreshToken ||
                        !(result as LoginResponseType).user.name ||
                        !(result as LoginResponseType).user.lastName ||
                        !(result as LoginResponseType).user.id) {
                        throw new Error((result as LoginErrorResponseType).message);
                    }

                    Auth.setTokens((result as LoginResponseType).tokens.accessToken, (result as LoginResponseType).tokens.refreshToken);
                    Auth.setUserInfo((result as LoginResponseType).user);

                    if (this.page === 'login') {
                        this.processCompleted();
                        if (this.processButton) this.processButton.classList.add('disabled');
                    }

                    if (this.page === 'signup') {
                        setTimeout((): void => {
                            this.processCompletedClear();
                            location.href = '#/main';
                        }, 3000);
                        return;
                    }
                    if (this.page === 'login') {
                        setTimeout((): void => {
                            this.processCompletedClear();
                            location.href = '#/main';
                        }, 3000);
                        return;
                    }
                }
                if (result === 401 || result === 400) {
                    if (this.page === 'login') {
                        this.invalidUser();
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    private invalidUser(): void {
        const invalidUser: HTMLElement = document.createElement('div');
        invalidUser.className = 'form-invalidUser text-danger d-block text-start w-100';
        invalidUser.setAttribute('id', 'invalidUser');

        if (this.page === 'login') {
            invalidUser.innerText = 'Указаны неверные данные пользователя!';
        }
        if (this.page === 'signup') {
            invalidUser.innerText = 'Пользователь с таким email уже существует!';
        }

        this.lastInput.after(invalidUser);
    }

    private validUser(): void {
        const invalidUserElement: HTMLElement | null = document.getElementById('invalidUser');
        if (invalidUserElement) {
            document.getElementById('invalidUser')!.remove();
        }
    }

    private processCompleted(): void {
        const processCompleted: HTMLElement = document.createElement('div');
        processCompleted.className = 'form-invalidUser text-success d-block text-start w-100';
        processCompleted.setAttribute('id', 'processCompleted');

        if (this.page === 'signup') {
            processCompleted.innerText = 'Ваш аккаунт успешно зарегистрирован!';
        }
        if (this.page === 'login') {
            processCompleted.innerText = 'Вы успешно вошли в свой аккаунт!';
        }

        this.lastInput.after(processCompleted);
    }

    private processCompletedClear(): void {
        const signupCompleted: HTMLElement | null = document.getElementById('processCompleted');
        if (signupCompleted) signupCompleted.remove();
    }
}
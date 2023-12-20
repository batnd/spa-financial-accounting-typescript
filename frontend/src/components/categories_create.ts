import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "../utils/balance";
import {UserName} from "../utils/userName";
import {RouteCategoryType} from "../types/route-category.type";
import {CategoriesResponse} from "../types/response/categories-response";

export class CategoriesCreate {
    readonly currentRoute: RouteCategoryType;
    readonly createNewIncomeExpenseInputElement: HTMLElement | null;
    readonly createNewIncomeExpenseLabelElement: HTMLElement | null;
    readonly cancelButton: HTMLElement | null;
    readonly createButton: HTMLElement | null;

    constructor(route: RouteCategoryType) {
        this.currentRoute = route;

        this.createNewIncomeExpenseInputElement = document.querySelector('.category-actions-input');
        this.createNewIncomeExpenseLabelElement = document.getElementById('inputLabel');
        this.cancelButton = document.querySelector('.btn-cancel');
        this.createButton = document.querySelector('.btn-create');

        if (this.cancelButton) {
            this.cancelButton.addEventListener('click', (): void => {
                location.href = '#/' + this.currentRoute;
            });
        }
        if (this.createButton) {
            this.createButton.addEventListener('click', (): void => {
                this.createNewIncomeExpense(this.currentRoute);
            });
        }

        this.dataInit();
    }

    private async dataInit(): Promise<void> {
        await Balance.showBalance();
        await UserName.setUserName();
    }

    private async createNewIncomeExpense(route: RouteCategoryType): Promise<void> {
        const currentRoute: RouteCategoryType = route;
        const inputValue: string = (this.createNewIncomeExpenseInputElement as HTMLInputElement).value.trim();
        if (this.createNewIncomeExpenseInputElement) this.createNewIncomeExpenseInputElement.classList.remove('border-danger');

        this.invalidIncomeExpenseNameRemove();

        if (inputValue) {
            try {
                const result: CategoriesResponse | number = await CustomHttp.httpRequest(config.host + '/categories/' + currentRoute, 'POST', {
                    title: inputValue
                });
                if (result && (result as CategoriesResponse).title && (result as CategoriesResponse).id && result !== 400) {
                    location.href = '#/' + currentRoute;
                    return;
                }
                if (result === 400) {
                    if (this.createNewIncomeExpenseInputElement) this.createNewIncomeExpenseInputElement.classList.add('border-danger');
                    this.invalidIncomeExpenseName();
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            if (this.createNewIncomeExpenseInputElement) this.createNewIncomeExpenseInputElement.classList.add('border-danger');
        }
    }

    private invalidIncomeExpenseNameRemove(): void {
        const invalidIncomeExpenseNameElement: HTMLElement | null = document.getElementById('invalidIncomeName');
        if (invalidIncomeExpenseNameElement) invalidIncomeExpenseNameElement.remove();
    }

    private invalidIncomeExpenseName(): void {
        const invalidIncomeExpenseNameElement: HTMLElement = document.createElement('div');
        invalidIncomeExpenseNameElement.className = 'form-invalidUser text-danger d-block text-start w-100';
        invalidIncomeExpenseNameElement.setAttribute('id', 'invalidIncomeName');
        invalidIncomeExpenseNameElement.innerText = 'Такая категория уже есть!';
        if (this.createNewIncomeExpenseLabelElement) this.createNewIncomeExpenseLabelElement.after(invalidIncomeExpenseNameElement);
    }
}
import {UrlManager} from "../utils/url-manager";
import {Balance} from "../utils/balance";
import {UserName} from "../utils/userName";
import {IncomeExpenseProcess} from "../utils/income-expense-process";
import {RouteCategoryType} from "../types/route-category.type";
import {QueryParamsType} from "../types/query-params.type";
import {CategoriesResponse} from "../types/response/categories-response";

export class CategoriesEdit {
    readonly currentRoute: RouteCategoryType;
    readonly currentQueryId: string;
    readonly editIncomeExpenseInputElement: HTMLElement | null;
    readonly editIncomeExpenseLabelElement: HTMLElement | null;
    readonly cancelButton: HTMLElement | null;
    readonly saveButton: HTMLElement | null;

    private allCurrentTypeCategories: CategoriesResponse[] | [] = [];

    constructor(route: RouteCategoryType) {
        this.currentRoute = route;

        this.editIncomeExpenseInputElement = document.querySelector('.category-actions-input');
        this.editIncomeExpenseLabelElement = document.getElementById('inputLabel');
        this.cancelButton = document.querySelector('.btn-cancel');
        this.saveButton = document.querySelector('.btn-save');

        if (this.cancelButton) {
            this.cancelButton.addEventListener('click', (): void => {
                location.href = '#/' + this.currentRoute;
            });
        }

        this.currentQueryId = UrlManager.getQueryParams().id;

        this.dataInit();
    }

    private async dataInit(): Promise<void> {
        await Balance.showBalance();
        await UserName.setUserName();

        this.allCurrentTypeCategories = await IncomeExpenseProcess.getCategoriesIncomeExpense(this.currentRoute);
        const requestCurrentCategoryName: string | null = await IncomeExpenseProcess.getIncomeExpense(this.currentRoute, this.currentQueryId);
        if (this.editIncomeExpenseInputElement) (this.editIncomeExpenseInputElement as HTMLInputElement).value = <string>requestCurrentCategoryName;

        await this.editCategory();
    }

    private async editCategory(): Promise<void> {
        const requestedInputCategoryName: string = (this.editIncomeExpenseInputElement as HTMLInputElement).value;
        if (this.saveButton) {
            this.saveButton.addEventListener('click', async (): Promise<void> => {
                const newInputValue: string = (this.editIncomeExpenseInputElement as HTMLInputElement).value.trim();
                if (this.editIncomeExpenseInputElement) this.editIncomeExpenseInputElement.classList.remove('border-danger');

                this.invalidIncomeExpenseEditedNameRemove();

                if (this.editIncomeExpenseInputElement) {
                    if (!newInputValue) {
                        this.editIncomeExpenseInputElement.classList.add('border-danger');
                        return;
                    }
                    if (requestedInputCategoryName === newInputValue) {
                        this.editIncomeExpenseInputElement.classList.add('border-danger');
                        this.invalidIncomeExpenseEditedName('same');
                        return;
                    }

                    const isNameAlreadyExists: CategoriesResponse | undefined = this.allCurrentTypeCategories.find((category: CategoriesResponse): boolean => category.title === newInputValue);
                    if (isNameAlreadyExists) {
                        this.editIncomeExpenseInputElement.classList.add('border-danger');
                        this.invalidIncomeExpenseEditedName('exists');
                        return;
                    }
                }
                this.invalidIncomeExpenseEditedNameRemove();
                await IncomeExpenseProcess.editIncomeExpense(this.currentRoute, this.currentQueryId, newInputValue);
            });
        }
    }

    private invalidIncomeExpenseEditedNameRemove(): void {
        const invalidIncomeExpenseEditedNameElement: HTMLElement | null = document.getElementById('invalidIncomeName');
        if (invalidIncomeExpenseEditedNameElement) {
            invalidIncomeExpenseEditedNameElement.remove();
        }
    }

    private invalidIncomeExpenseEditedName(check: string): void {
        const invalidIncomeExpenseEditedNameElement: HTMLElement = document.createElement('div');
        invalidIncomeExpenseEditedNameElement.className = 'form-invalidUser text-danger d-block text-start w-100';
        invalidIncomeExpenseEditedNameElement.setAttribute('id', 'invalidIncomeName');
        if (check === 'same') invalidIncomeExpenseEditedNameElement.innerText = 'Вы указали тоже самое имя категории!';
        if (check === 'exists') invalidIncomeExpenseEditedNameElement.innerText = 'Категория с таким именем уже существует!';
        if (this.editIncomeExpenseLabelElement) this.editIncomeExpenseLabelElement.after(invalidIncomeExpenseEditedNameElement);
    }
}
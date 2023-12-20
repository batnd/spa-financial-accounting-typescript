import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "../utils/balance";
import {UserName} from "../utils/userName";
import {UrlManager} from "../utils/url-manager";
import {RouteCategoryType} from "../types/route-category.type";
import {QueryParamsType} from "../types/query-params.type";
import {AllOperationsResponse} from "../types/response/allOperations-response";
import {CategoriesResponse} from "../types/response/categories-response";

export class OperationActions {
    readonly currentRoute: RouteCategoryType;
    readonly currentCategory: string;

    readonly operationTitleElement: HTMLElement | null;
    readonly operationTypeInputSelectorElement: HTMLElement | null;
    readonly operationTypeSelectIncome: HTMLElement | null;
    readonly operationTypeSelectExpense: HTMLElement | null;
    readonly operationCategoryInputElement: HTMLElement | null;
    readonly operationAmountInputElement: HTMLElement | null;
    readonly operationDateInputElement: HTMLElement | null;
    readonly operationCommentElement: HTMLElement | null;
    readonly createButton: HTMLElement | null;
    readonly cancelButton: HTMLElement | null;
    readonly saveButton: HTMLElement | null;

    readonly currentId: string;

    constructor(route: RouteCategoryType, category: string) {
        this.currentRoute = route;
        this.currentCategory = category;

        this.operationTitleElement = document.getElementById('operationTitle');
        this.operationTypeInputSelectorElement = document.getElementById('operationType');
        this.operationTypeSelectIncome = document.getElementById('selectIncome');
        this.operationTypeSelectExpense = document.getElementById('selectExpense');
        this.operationCategoryInputElement = document.getElementById('operationCategory');
        this.operationAmountInputElement = document.getElementById('operationAmount');
        this.operationDateInputElement = document.getElementById('operationDate');
        this.operationCommentElement = document.getElementById('operationComment');
        this.createButton = document.querySelector('.btn-create');
        this.cancelButton = document.querySelector('.btn-cancel');
        if (this.cancelButton) this.cancelButton.addEventListener('click', () => location.href = '#/operations');

        const queryParams: QueryParamsType = UrlManager.getQueryParams();
        this.currentId = queryParams.id;
        this.saveButton = document.querySelector('.btn-save');

        this.prepareCreateEditForm(this.currentCategory);
        this.createEditOperation(this.currentCategory, this.currentId);

        this.dataInit();
    }

    private async dataInit(): Promise<void> {
        await Balance.showBalance();
        await UserName.setUserName();
        if (this.currentCategory === 'create') {
            await this.showCurrentCategory();
        }
        if (this.currentCategory === 'edit') {
            await this.fillCurrentOperation();
        }
    }

    private prepareCreateEditForm(category: string): void {
        if (category === 'create') {
            if (this.currentRoute === RouteCategoryType.income) {
                if (this.operationTypeSelectIncome) this.operationTypeSelectIncome.setAttribute('selected', 'selected');
                if (this.operationTitleElement) this.operationTitleElement.innerText = 'Создание дохода';
            }
            if (this.currentRoute === RouteCategoryType.expense) {
                if (this.operationTypeSelectExpense) this.operationTypeSelectExpense.setAttribute('selected', 'selected');
                if (this.operationTitleElement) this.operationTitleElement.innerText = 'Создание расхода';
            }
        }
        if (category === 'edit') {
            if (this.operationTypeInputSelectorElement) {
                this.operationTypeInputSelectorElement.removeAttribute('disabled');
                this.operationTypeInputSelectorElement.classList.remove('disabledSelect');
            }
        }
    }

    private createEditOperation(category: string, id: string): void {
        // create
        let button: HTMLElement | null = this.createButton;
        let url: string = '/operations';
        let method: string = 'POST';
        // edit
        if (category === 'edit') {
            button = this.saveButton;
            url = '/operations/' + id;
            method = 'PUT';
        }
        if (button) {
            button.addEventListener('click', async (): Promise<void> => {
                if (this.operationTypeInputSelectorElement && this.operationCategoryInputElement && this.operationAmountInputElement && this.operationDateInputElement && this.operationCommentElement) {
                    const operationTypeInputValue: string = (this.operationTypeInputSelectorElement as HTMLInputElement).value;
                    const operationCategoryInputValue: number = parseInt((this.operationCategoryInputElement as HTMLInputElement).value);
                    const operationAmountInputValue: number = parseInt((this.operationAmountInputElement as HTMLInputElement).value.trim());
                    const operationDateInputValue: string = (this.operationDateInputElement as HTMLInputElement).value;
                    const operationCommentValue: string = (this.operationCommentElement as HTMLInputElement).value;

                    const areFieldsValid: boolean = this.validateAllFields();
                    if (areFieldsValid) {
                        try {
                            const result: AllOperationsResponse = await CustomHttp.httpRequest(config.host + url, method, {
                                type: operationTypeInputValue,
                                category_id: operationCategoryInputValue,
                                amount: operationAmountInputValue,
                                date: operationDateInputValue,
                                comment: operationCommentValue
                            });
                            if (result) {
                                location.href = '#/operations';
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            });
        }
    }

    private async showCurrentCategory(): Promise<void> {
        if (this.operationTypeInputSelectorElement) {
            try {
                const result: CategoriesResponse[] | [] = await CustomHttp.httpRequest(config.host + '/categories/' + (this.operationTypeInputSelectorElement as HTMLInputElement).value);
                if (result) {
                    this.addCategories(result);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    private addCategories(array: CategoriesResponse[] | []): void {
        if (array && array.length > 0) {
            array.forEach((category: CategoriesResponse): void => {
                if (this.operationCategoryInputElement) {
                    const option: HTMLElement = document.createElement('option');
                    option.setAttribute('value', category.id.toString());
                    option.classList.add('operationCategoryOption');
                    option.innerText = category.title;
                    this.operationCategoryInputElement.appendChild(option);
                }
            });
        }
    }

    private async fillCurrentOperation(): Promise<void> {
        try {
            const currentOperation: AllOperationsResponse = await CustomHttp.httpRequest(config.host + '/operations/' + this.currentId);
            if (currentOperation) {
                await this.setCurrentOperationType(currentOperation);
                await this.requestCategoriesSelectorEvent();
                await this.showCurrentCategory();
                await this.fillEditForm(currentOperation);
            }
        } catch (error) {
            console.log(error);
        }
    }

    private setCurrentOperationType(operation: AllOperationsResponse): void {
        if (operation.type === 'income' && this.operationTypeSelectIncome) this.operationTypeSelectIncome.setAttribute('selected', 'selected');
        if (operation.type === 'expense' && this.operationTypeSelectExpense) this.operationTypeSelectExpense.setAttribute('selected', 'selected');
    }

    private requestCategoriesSelectorEvent(): void {
        const that: OperationActions = this;
        if (this.operationTypeInputSelectorElement) {
            this.operationTypeInputSelectorElement.addEventListener('change', async (): Promise<void> => {
                that.defaultCategories();
                if ((this.operationTypeInputSelectorElement as HTMLInputElement).value) {
                    try {
                        const result: CategoriesResponse[] | [] = await CustomHttp.httpRequest(config.host + '/categories/' + (this.operationTypeInputSelectorElement as HTMLInputElement).value);
                        if (result) {
                            that.addCategories(result);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            });
        }
    }

    private fillEditForm(operation: AllOperationsResponse): void {
        // category
        const operationCategories: NodeListOf<HTMLElement> = document.querySelectorAll('.operationCategoryOption');
        let currentOperationCategory: HTMLElement | null = null;
        for (let i: number = 0; i < operationCategories.length; i++) {
            if ((operationCategories[i] as HTMLElement).innerText === operation.category) {
                currentOperationCategory = operationCategories[i];
                break;
            }
        }
        if (currentOperationCategory) {
            currentOperationCategory.setAttribute('selected', 'selected');
        }
        // amount
        if (this.operationAmountInputElement) (this.operationAmountInputElement as HTMLInputElement).value = operation.amount.toString();
        // date
        if (this.operationDateInputElement) (this.operationDateInputElement as HTMLInputElement).value = operation.date;
        // comment
        if (this.operationCommentElement) (this.operationCommentElement as HTMLInputElement).value = operation.comment;
    }

    private validateAllFields(): boolean {
        this.clearInvalidFieldsStyle();
        const isValidType: boolean = this.validateField(<HTMLInputElement>this.operationTypeInputSelectorElement);
        const isValidCategory: boolean = this.validateField(<HTMLInputElement>this.operationCategoryInputElement);
        const isValidAmount: boolean = this.validateAmount(<HTMLInputElement>this.operationAmountInputElement);
        const isValidDate: boolean = this.validateDate(<HTMLInputElement>this.operationDateInputElement);
        const isValidComment: boolean = this.validateField(<HTMLInputElement>this.operationCommentElement);

        const areFieldsValid: boolean = isValidType && isValidCategory && isValidAmount && isValidDate && isValidComment;
        return areFieldsValid;
    }

    private clearInvalidFieldsStyle(): void {
        if (this.operationTypeInputSelectorElement && this.operationCategoryInputElement && this.operationAmountInputElement && this.operationDateInputElement && this.operationCommentElement) {
            this.operationTypeInputSelectorElement.classList.remove('border-danger');
            this.operationCategoryInputElement.classList.remove('border-danger');
            this.operationAmountInputElement.classList.remove('border-danger');
            this.operationDateInputElement.classList.remove('border-danger');
            this.operationCommentElement.classList.remove('border-danger');
        }
    }

    private validateField(field: HTMLInputElement): boolean {
        if (field.value) {
            return true;
        } else {
            field.classList.add('border-danger');
            return false;
        }
    }

    private validateAmount(field: HTMLInputElement): boolean {
        if (field.value && parseInt(field.value) > 0) {
            return true;
        } else {
            field.classList.add('border-danger');
            return false;
        }
    }

    private validateDate(field: HTMLInputElement): boolean {
        const regex: RegExp = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
        if (field.value) {
            if (regex.test(field.value)) {
                return true;
            } else {
                field.classList.add('border-danger');
                return false;
            }
        } else {
            field.classList.add('border-danger');
            return false;
        }
    }

    private defaultCategories(): void {
        if (this.operationCategoryInputElement) {
            this.operationCategoryInputElement.innerHTML = '';
            const option: HTMLElement = document.createElement('option');
            option.setAttribute('value', '');
            option.innerText = 'Категория...';
            this.operationCategoryInputElement.appendChild(option);
        }
    }
}
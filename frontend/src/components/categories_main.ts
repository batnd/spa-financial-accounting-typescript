import {IncomeExpenseProcess} from "../utils/income-expense-process";
import {Balance} from "../utils/balance";
import {UserName} from "../utils/userName";
import {CategoriesResponse} from "../types/response/categories-response";
import {RouteCategoryType} from "../types/route-category.type";

export class CategoriesMain {
    readonly currentRoute: RouteCategoryType;
    readonly incomeRoute: RouteCategoryType;
    readonly expenseRoute: RouteCategoryType;
    private createNewIncomeExpenseElement: HTMLElement | null = null;
    private deleteIncomeExpenseButtonElements: NodeListOf<HTMLElement> | null = null;
    private editIncomeExpenseButtonElements: NodeListOf<HTMLElement> | null = null;

    constructor(route: RouteCategoryType) {
        this.currentRoute = route;
        this.incomeRoute = RouteCategoryType.income;
        this.expenseRoute = RouteCategoryType.expense;

        this.dataInit();

        this.createIncomeExpense(this.currentRoute);
    }

    private async dataInit(): Promise<void> {
        await Balance.showBalance();
        await UserName.setUserName();

        const getIncomeExpense: CategoriesResponse[] | [] = await IncomeExpenseProcess.getCategoriesIncomeExpense(this.currentRoute);
        await IncomeExpenseProcess.createIncomeExpense(getIncomeExpense);

        await this.deleteIncomeExpense(this.currentRoute);
        await this.editIncomeExpense(this.currentRoute);
    }

    private createIncomeExpense(route: RouteCategoryType): void {
        this.createNewIncomeExpenseElement = document.querySelector('.category-item-createNew');
        if (this.createNewIncomeExpenseElement) {
            this.createNewIncomeExpenseElement.addEventListener('click', (): void => {
                if (route === this.incomeRoute) location.href = '#/income/new';
                if (route === this.expenseRoute) location.href = '#/expense/new';
            });
        }
    }

    private deleteIncomeExpense(route: RouteCategoryType): void {
        this.deleteIncomeExpenseButtonElements = document.querySelectorAll('.btn-delete');
        this.deleteIncomeExpenseButtonElements.forEach((button: HTMLElement): void => {
            button.addEventListener('click', (): void => {
                const incomeId: string | null = (button.parentElement!.parentElement!.parentElement as HTMLElement).getAttribute('id');
                const categoryName: string = (button.parentElement!.previousElementSibling as HTMLElement).innerText;
                if (route === this.incomeRoute) {
                    IncomeExpenseProcess.deleteIncomeExpense(RouteCategoryType.income, parseInt(<string>incomeId), categoryName);
                }
                if (route === this.expenseRoute) {
                    IncomeExpenseProcess.deleteIncomeExpense(RouteCategoryType.expense, parseInt(<string>incomeId), categoryName);
                }
            });
        });
    }

    private editIncomeExpense(route: RouteCategoryType): void {
        this.editIncomeExpenseButtonElements = document.querySelectorAll('.btn-edit');
        this.editIncomeExpenseButtonElements.forEach((button: HTMLElement): void => {
            button.addEventListener('click', (): void => {
                const incomeId: string = <string>(button.parentElement!.parentElement!.parentElement as HTMLElement).getAttribute('id');
                if (route === this.incomeRoute) location.href = '#/income/edit' + '?id=' + incomeId;
                if (route === this.expenseRoute) location.href = '#/expense/edit' + '?id=' + incomeId;
            });
        });
    }
}
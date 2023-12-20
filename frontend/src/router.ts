import {EntranceForm} from "./components/entranceForm";
import {Main} from "./components/main";
import {Auth} from "./services/auth";
import {Income} from "./components/income";
import {Balance} from "./utils/balance";
import {Login} from "./components/login";
import {IncomeCreate} from "./components/income_create";
import {IncomeEdit} from "./components/income_edit";
import {Expense} from "./components/expense";
import {ExpenseCreate} from "./components/expense_create";
import {ExpenseEdit} from "./components/expense_edit";
import {IncomeExpense} from "./components/income_expense";
import {CreateOperation} from "./components/create_operation";
import {EditOperation} from "./components/edit_operation";
import {RouteType} from "./types/route.type";
import {RouteCategoryType} from "./types/route-category.type";

export class Router {
    readonly titleElement: HTMLElement | null;
    readonly stylesElement: HTMLElement | null;
    readonly templateContentElement: HTMLElement | null;
    private routes: RouteType[];

    constructor() {
        this.titleElement = document.getElementById('pageTitle');
        this.stylesElement = document.getElementById('templateStyle');
        this.templateContentElement = document.getElementById('templateContent');

        new Balance();

        this.routes = [
            {
                route: '#/login',
                title: 'Вход',
                template: 'templates/login.html',
                styles: 'styles/login.css',
                load: (): void => {
                    new Login();
                    new EntranceForm('login');
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'styles/login.css',
                load: (): void => {
                    new Login();
                    new EntranceForm('signup');
                }
            },
            {
                route: '#/main',
                title: 'Главная',
                template: 'templates/main.html',
                styles: 'styles/main.css',
                load: (): void => {
                    new Main();
                }
            },
            {
                route: '#/income',
                title: 'Доходы',
                template: 'templates/income.html',
                styles: '',
                load: (): void => {
                    new Income();
                }
            },
            {
                route: '#/income/new',
                title: 'Создание категории доходов',
                template: 'templates/income_create.html',
                styles: '',
                load: (): void => {
                    new IncomeCreate();
                }
            },
            {
                route: '#/income/edit',
                title: 'Редактирование категории доходов',
                template: 'templates/income_edit.html',
                styles: '',
                load: (): void => {
                    new IncomeEdit();
                }
            },
            {
                route: '#/expense',
                title: 'Расходы',
                template: 'templates/expense.html',
                styles: '',
                load: (): void => {
                    new Expense();
                }
            },
            {
                route: '#/expense/new',
                title: 'Создание категории расходов',
                template: 'templates/expense_create.html',
                styles: '',
                load: (): void => {
                    new ExpenseCreate();
                }
            },
            {
                route: '#/expense/edit',
                title: 'Редактирование категории расходов',
                template: 'templates/expense_edit.html',
                styles: '',
                load: (): void => {
                    new ExpenseEdit();
                }
            },
            {
                route: '#/operations',
                title: 'Доходы и расходы',
                template: 'templates/income_expense.html',
                styles: 'styles/incomes_expenses.css',
                load: (): void => {
                    new IncomeExpense();
                }
            },
            {
                route: '#/operations/create_income',
                title: 'Создание дохода',
                template: 'templates/create_operation.html',
                styles: 'styles/incomes_expenses.css',
                load: (): void => {
                    new CreateOperation(RouteCategoryType.income);
                }
            },
            {
                route: '#/operations/create_expense',
                title: 'Создание расхода',
                template: 'templates/create_operation.html',
                styles: 'styles/incomes_expenses.css',
                load: (): void => {
                    new CreateOperation(RouteCategoryType.expense);
                }
            },
            {
                route: '#/operations/edit_operation',
                title: 'Редактирование дохода/расхода',
                template: 'templates/edit_operation.html',
                styles: 'styles/create_incomes_expenses.css',
                load: (): void => {
                    new EditOperation(RouteCategoryType.incomeExpense);
                }
            },
        ];
    }

    public async openRoute(): Promise<void> {
        const currentUrlRoute: string = window.location.hash.split('?')[0];

        if (currentUrlRoute === '#/logout') {
            await Auth.logout();
            window.location.href = '#/login';
            return;
        }

        const newRoute: RouteType | undefined = this.routes.find((item: RouteType): boolean => {
            return item.route === currentUrlRoute;
        });

        if (!newRoute) {
            window.location.href = '#/login';
            return;
        }

        if (!this.templateContentElement || !this.stylesElement || !this.titleElement) {
            if (currentUrlRoute === '#/login') {
                return;
            } else {
                window.location.href = '#/login';
                return;
            }
        }

        this.templateContentElement.innerHTML = await fetch(newRoute.template).then((response: Response) => response.text());
        this.stylesElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerText = newRoute.title;

        newRoute.load();
    }
}
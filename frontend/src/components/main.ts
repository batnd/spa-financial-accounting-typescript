import {Balance} from "../utils/balance";
import {UserName} from "../utils/userName";
import {CategoriesTemplates} from "./categories_templates";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {AllOperationsResponse} from "../types/response/allOperations-response";
import {RouteCategoryType} from "../types/route-category.type";
import {CharPies} from "../addons/chart-pie";

export class Main {
    readonly incomeChartWrapperElement: HTMLElement | null;
    readonly expenseChartWrapperElement: HTMLElement | null;
    readonly filterButtonElements: NodeListOf<HTMLElement> | null;
    readonly filterDateFromInputElement: HTMLElement | null;
    readonly filterDateToInputElement: HTMLElement | null;
    readonly filterDateElement: HTMLElement | null;

    constructor() {
        this.incomeChartWrapperElement = document.querySelector('.incomes-chart-wrapper');
        this.expenseChartWrapperElement = document.querySelector('.expenses-chart-wrapper');
        this.filterButtonElements = document.querySelectorAll('.filterButton');
        this.filterDateFromInputElement = document.getElementById('filterDateFrom');
        this.intervalFilterInputConfig(<HTMLElement>this.filterDateFromInputElement);
        this.filterDateToInputElement = document.getElementById('filterDateTo');
        this.intervalFilterInputConfig(<HTMLElement>this.filterDateToInputElement);
        this.filterDateElement = document.querySelector('.filter-date');

        new CategoriesTemplates(RouteCategoryType.main);

        this.chooseFilter();
        this.dataInit();
    }

    async dataInit(): Promise<void> {
        await Balance.showBalance();
        await UserName.setUserName();
        await this.updateWithFilter('today');
    }

    private chooseFilter(): void {
        const that: Main = this;
        if (this.filterButtonElements) {
            this.filterButtonElements.forEach((button: HTMLElement): void => {
                if (button.getAttribute('id') !== 'interval') {
                    button.addEventListener('click', function (): void {
                        that.clearInvalidIntervalFilter();
                        if (that.filterButtonElements) that.filterButtonElements.forEach((btn: HTMLElement) => btn.classList.remove('active'));
                        this.classList.add('active');
                        that.updateWithFilter(<string>this.getAttribute('id'));
                    });
                }
                if (button.getAttribute('id') === 'interval') {
                    button.addEventListener('click', function (): void {
                        if (that.filterButtonElements) that.filterButtonElements.forEach((btn: HTMLElement) => btn.classList.remove('active'));
                        this.classList.add('active');
                        const isFilterIntervalValid: boolean = that.validateIntervalFilter();
                        if (isFilterIntervalValid) {
                            that.updateWithFilter(<string>this.getAttribute('id'));
                        }
                    });
                }
            })
        }
    }

    private clearInvalidIntervalFilter(): void {
        const filterInvalidIntervalElement: HTMLElement | null = document.querySelector('.filterInvalidInterval');
        if (filterInvalidIntervalElement) {
            filterInvalidIntervalElement.remove();
        }
        if (this.filterDateFromInputElement && this.filterDateToInputElement) {
            this.filterDateFromInputElement.classList.remove('filterDateEmpty');
            this.filterDateToInputElement.classList.remove('filterDateEmpty');
        }
    }

    private validateIntervalFilter(): boolean {
        const filterDateFromValue: string = (this.filterDateFromInputElement as HTMLInputElement).value;
        const filterDateToValue: string = (this.filterDateToInputElement as HTMLInputElement).value;
        const regex: RegExp = /^[0-9]{2}.[0-9]{2}.[0-9]{4}$/;

        if (this.filterDateFromInputElement) this.filterDateFromInputElement.classList.remove('filterDateEmpty');
        let dateFromIsValid: boolean = false;
        if (this.filterDateToInputElement) this.filterDateToInputElement.classList.remove('filterDateEmpty');
        let dateToIsValid: boolean = false;

        const filterInvalidIntervalElement: HTMLElement | null = document.querySelector('.filterInvalidInterval');
        if (filterInvalidIntervalElement) {
            filterInvalidIntervalElement.remove();
        }

        if (!filterDateFromValue || !regex.test(filterDateFromValue)) {
            if (this.filterDateFromInputElement) {
                this.filterDateFromInputElement.classList.add('filterDateEmpty');
                dateFromIsValid = false;
            }
        } else {
            dateFromIsValid = true;
        }
        if (!filterDateToValue || !regex.test(filterDateToValue)) {
            if (this.filterDateToInputElement) {
                this.filterDateToInputElement.classList.add('filterDateEmpty');
                dateToIsValid = false;
            }
        } else {
            dateToIsValid = true;
        }

        if (dateFromIsValid && dateToIsValid) {
            return true;
        } else {
            const filterInvalidInterval: HTMLElement = document.createElement('p');
            filterInvalidInterval.className = 'm-0 filterInvalidInterval';
            filterInvalidInterval.innerText = 'Формат: дд.мм.гггг';
            if (this.filterDateElement) this.filterDateElement.appendChild(filterInvalidInterval);
            return false;
        }
    }

    private async updateWithFilter(filter: string): Promise<void> {
        let queryParamsPeriod: string | null = null;
        let dateFromSrc: string[] = (this.filterDateFromInputElement as HTMLInputElement).value.split('.');
        let dateFromOutput: string = `${dateFromSrc[2]}-${dateFromSrc[1]}-${dateFromSrc[0]}`;
        let dateToSrc: string[] = (this.filterDateToInputElement as HTMLInputElement).value.split('.');
        let dateToOutput: string = `${dateToSrc[2]}-${dateToSrc[1]}-${dateToSrc[0]}`;

        let today: Date = new Date();
        let todayYear: number = today.getFullYear();
        let todayMonth: string | number = today.getMonth() < 9 ? ('0' + (today.getMonth() + 1)) : (today.getMonth() + 1);
        let todayDay: string | number = today.getDate() < 10 ? ('0' + today.getDate()) : today.getDate();

        let todayFilter: string = `${todayYear}-${todayMonth}-${todayDay}`;

        switch (filter) {
            case 'today':
                queryParamsPeriod = 'period=interval&dateFrom=' + todayFilter + '&dateTo=' + todayFilter;
                break;
            case 'week':
                queryParamsPeriod = 'period=week';
                break;
            case 'month':
                queryParamsPeriod = 'period=month';
                break;
            case 'year':
                queryParamsPeriod = 'period=year';
                break;
            case 'all':
                queryParamsPeriod = 'period=all';
                break;
            case 'interval':
                queryParamsPeriod = 'period=interval&dateFrom=' + dateFromOutput + '&dateTo=' + dateToOutput;
                break;
        }
        try {
            const result: AllOperationsResponse[] | [] = await CustomHttp.httpRequest(config.host + '/operations?' + queryParamsPeriod);
            if (result) {
                this.makeChartPies(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    private intervalFilterInputConfig(inputElement: HTMLElement): void {
        const regex: RegExp = /[0-9.]/;
        inputElement.addEventListener('keydown', function (event: KeyboardEvent): void {
            if (!regex.test(event.key) && event.key.toLowerCase() !== 'backspace' && event.key.toLowerCase() !== 'arrowleft' && event.key.toLowerCase() !== 'arrowright' && event.key.toLowerCase() !== 'tab') {
                event.preventDefault();
            }
        });
    }

    private makeChartPies(operations: AllOperationsResponse[] | []): void {
        this.removeIncomeExpenseCanvas();
        this.createIncomeExpenseCanvas();
        new CharPies(operations);
    }

    private createIncomeExpenseCanvas(): void {
        if (this.incomeChartWrapperElement && this.expenseChartWrapperElement) {
            const canvasIncome: HTMLCanvasElement = document.createElement('canvas');
            canvasIncome.className = 'incomes-chart';
            canvasIncome.setAttribute('id', 'incomesChart');
            this.incomeChartWrapperElement.appendChild(canvasIncome);

            const canvasExpense: HTMLCanvasElement = document.createElement('canvas');
            canvasExpense.className = 'expenses-chart';
            canvasExpense.setAttribute('id', 'expensesChart');
            this.expenseChartWrapperElement.appendChild(canvasExpense);
        }
    }

    private removeIncomeExpenseCanvas(): void {
        const incomeChartWrapperElement: HTMLElement | null = document.getElementById('incomesChart');
        const expenseChartWrapperElement: HTMLElement | null = document.getElementById('expensesChart');
        if (incomeChartWrapperElement) {
            incomeChartWrapperElement.remove();
        }
        if (expenseChartWrapperElement) {
            expenseChartWrapperElement.remove();
        }
    }
}
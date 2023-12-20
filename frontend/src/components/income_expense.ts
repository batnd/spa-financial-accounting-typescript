import {CategoriesTemplates} from "./categories_templates";
import {Balance} from "../utils/balance";
import {UserName} from "../utils/userName";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {AllOperationsResponse} from "../types/response/allOperations-response";
import {OperationDeleteResponse} from "../types/response/operationDelete-response";
import {RouteCategoryType} from "../types/route-category.type";

export class IncomeExpense {
    readonly filterButtonElements: NodeListOf<HTMLElement> | null;
    readonly filterDateFromInputElement: HTMLElement | null;
    readonly filterDateToInputElement: HTMLElement | null;
    readonly filterDateElement: HTMLElement | null;
    readonly operationsTableBody: HTMLElement | null;
    readonly createNewIncomeButtonElement: HTMLElement | null;
    readonly createNewExpenseButtonElement: HTMLElement | null;

    constructor() {
        this.filterButtonElements = document.querySelectorAll('.filterButton');
        this.filterDateFromInputElement = document.getElementById('filterDateFrom');
        this.intervalFilterInputConfig(<HTMLInputElement>this.filterDateFromInputElement);
        this.filterDateToInputElement = document.getElementById('filterDateTo');
        this.intervalFilterInputConfig(<HTMLInputElement>this.filterDateToInputElement);
        this.filterDateElement = document.querySelector('.filter-date');

        this.operationsTableBody = document.getElementById('tableBody');

        this.createNewIncomeButtonElement = document.querySelector('.btn-createIncome');
        if (this.createNewIncomeButtonElement) this.createNewIncomeButtonElement.addEventListener('click', () => location.href = '#/operations/create_income');
        this.createNewExpenseButtonElement = document.querySelector('.btn-createExpense');
        if (this.createNewExpenseButtonElement) this.createNewExpenseButtonElement.addEventListener('click', () => location.href = '#/operations/create_expense');

        new CategoriesTemplates(RouteCategoryType.incomeExpense);

        this.chooseFilter();
        this.dataInit();
    }

    private async dataInit(): Promise<void> {
        await Balance.showBalance();
        await UserName.setUserName();
        await this.updateWithFilter('today');
    }

    private chooseFilter(): void {
        const that: IncomeExpense = this;
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
            });
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

    private intervalFilterInputConfig(inputElement: HTMLInputElement): void {
        const regex: RegExp = /[0-9.]/;
        inputElement.addEventListener('keydown', function (event: KeyboardEvent): void {
            if (!regex.test(event.key) && event.key.toLowerCase() !== 'backspace' && event.key.toLowerCase() !== 'arrowleft' && event.key.toLowerCase() !== 'arrowright' && event.key.toLowerCase() !== 'tab') {
                event.preventDefault();
            }
        });
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
                this.createIncomeExpenseOperations(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    private createIncomeExpenseOperations(array: AllOperationsResponse[] | []): void {
        if (this.operationsTableBody) this.operationsTableBody.innerHTML = '';
        if (array && array.length > 0) {
            array.forEach((operation: AllOperationsResponse, index: number): void => {
                if (this.operationsTableBody) {
                    const tr: HTMLElement = document.createElement('tr');
                    tr.setAttribute('id', operation.id.toString());
                    tr.className = 'operation-element';

                    const th: HTMLElement = document.createElement('th');
                    th.setAttribute('scope', "row");
                    th.innerText = (index + 1) + '';

                    const tdType: HTMLElement = document.createElement('td');
                    tdType.className = operation.type === 'income' ? 'text-success' : 'text-danger';
                    tdType.innerText = operation.type === 'income' ? 'доход' : 'расход';

                    const tdCategory: HTMLElement = document.createElement('td');
                    tdCategory.innerText = operation.category;

                    const tdAmount: HTMLElement = document.createElement('td');
                    tdAmount.innerText = operation.amount.toString();

                    const tdDate: HTMLElement = document.createElement('td');
                    const dateSrc: string[] = operation.date.split('-');
                    tdDate.innerText = dateSrc[2] + '.' + dateSrc[1] + '.' + dateSrc[0];

                    const tdComment: HTMLElement = document.createElement('td');
                    tdComment.innerText = operation.comment;

                    const tdActions: HTMLElement = document.createElement('td');

                    const divActions: HTMLElement = document.createElement('div');
                    divActions.className = 'operations-icons d-flex flex-row justify-content-end align-items-center';

                    const aDelete: HTMLElement = document.createElement('div');
                    aDelete.className = 'deleteOperation d-flex justify-content-center align-items-center';
                    const imgDelete: HTMLElement = document.createElement('img');
                    imgDelete.setAttribute('src', '../static/images/icon-delete.png');
                    imgDelete.setAttribute('alt', 'Удалить');

                    aDelete.addEventListener('click', (): void => {
                        this.deleteIncomeExpense(<string>tr.getAttribute('id'));
                    });

                    const aEdit: HTMLElement = document.createElement('div');
                    aEdit.className = 'editOperation d-flex justify-content-center align-items-center';
                    const imgEdit: HTMLElement = document.createElement('img');
                    imgEdit.setAttribute('src', '../static/images/icon-edit.png');
                    imgEdit.setAttribute('alt', 'Удалить');
                    aEdit.addEventListener('click', (): void => {
                        const operationType: string = operation.type === 'income' ? 'income' : 'expense';
                        location.href = '#/operations/edit_operation' + '?id=' + operation.id;
                    });

                    tr.appendChild(th);
                    tr.appendChild(tdType);
                    tr.appendChild(tdCategory);
                    tr.appendChild(tdAmount);
                    tr.appendChild(tdDate);
                    tr.appendChild(tdComment);
                    tr.appendChild(tdActions);
                    tdActions.appendChild(divActions);
                    divActions.appendChild(aDelete);
                    aDelete.appendChild(imgDelete);
                    divActions.appendChild(aEdit);
                    aEdit.appendChild(imgEdit);

                    this.operationsTableBody.appendChild(tr);
                }
            })
        }
    }

    private deleteIncomeExpense(id: string): void {
        const templateContentElement: HTMLElement | null = document.getElementById('templateContent');
        if (templateContentElement) {
            const modalWrapper: HTMLElement = document.createElement('div');

            modalWrapper.className = 'show action-modal position-absolute h-100 w-100 align-items-center justify-content-center';
            modalWrapper.setAttribute('id', 'modalIncomeExpense');

            const modalContent: HTMLElement = document.createElement('div');
            modalContent.className = 'action-modal-content modal-content bg-body';

            const modalBody: HTMLElement = document.createElement('div');
            modalBody.className = 'modal-body d-flex flex-column justify-content-between align-items-center';

            const modalText: HTMLElement = document.createElement('p');
            modalText.className = 'action-modal-text m-0';
            modalText.innerText = 'Вы действительно хотите удалить операцию?';

            const modalActionWrapper: HTMLElement = document.createElement('div');
            modalActionWrapper.className = 'action-buttons d-flex justify-content-center';

            const actionEdit: HTMLElement = document.createElement('button');
            actionEdit.className = 'btn-common btn-modal-delete btn border-0 btn-success';
            actionEdit.innerText = 'Да, удалить';

            const actionCancel: HTMLElement = document.createElement('button');
            actionCancel.className = 'btn-common btn-modal-no-delete btn border-0 btn-danger';
            actionCancel.setAttribute('id', 'balanceActionCancel');
            actionCancel.innerText = 'Не удалять';

            modalWrapper.appendChild(modalContent);
            modalContent.appendChild(modalBody);
            modalBody.appendChild(modalText);
            modalBody.appendChild(modalActionWrapper);
            modalActionWrapper.appendChild(actionEdit);
            modalActionWrapper.appendChild(actionCancel);

            templateContentElement.after(modalWrapper);

            modalWrapper.addEventListener('click', (event: MouseEvent): void => {
                if (event.eventPhase === 2) {
                    this.removeModalIncomeExpense();
                }
            });
            actionCancel.addEventListener('click', (): void => {
                this.removeModalIncomeExpense();
            });
            actionEdit.addEventListener('click', async (): Promise<void> => {
                let currentFilter: HTMLElement | null = null;
                if (this.filterButtonElements) {
                    for (let i = 0; i < this.filterButtonElements.length; i++) {
                        if (this.filterButtonElements[i].classList.contains('active')) {
                            currentFilter = this.filterButtonElements[i];
                            break;
                        }
                    }
                }
                try {
                    const result: OperationDeleteResponse | number = await CustomHttp.httpRequest(config.host + '/operations/' + id, 'DELETE');
                    // if (result && result !== 404) {
                    if (result as OperationDeleteResponse) {
                        modalWrapper.remove();
                        const curFilter: string | null = currentFilter!.getAttribute('id');
                        await this.updateWithFilter(<string>curFilter);
                        await Balance.showBalance();
                    } else {
                        console.log(result);
                    }
                } catch (error) {
                    console.log(error);
                }
            });
        }
    }

    private removeModalIncomeExpense(): void {
        document.querySelectorAll('#modalIncomeExpense').forEach((element: Element) => element.remove());
    }
}
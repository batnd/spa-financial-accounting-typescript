import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {RouteCategoryType} from "../types/route-category.type";
import {CategoriesResponse} from "../types/response/categories-response";
import {AllOperationsResponse} from "../types/response/allOperations-response";
import {CategoryResponse} from "../types/response/category-response";
import {CategoryUpdateResponse} from "../types/response/categoryUpdate-response";
import {OperationDeleteResponse} from "../types/response/operationDelete-response";

export class IncomeExpenseProcess {
    public static async getCategoriesIncomeExpense(route: RouteCategoryType): Promise<CategoriesResponse[] | []> {
        if (route === RouteCategoryType.income) {
            try {
                const result: CategoriesResponse[] | [] = await CustomHttp.httpRequest(config.host + '/categories/income');
                if (result) {
                    return result;
                }
            } catch (error) {
                console.log(error);
                return [];
            }
        }
        if (route === RouteCategoryType.expense) {
            try {
                const result: CategoriesResponse[] | [] = await CustomHttp.httpRequest(config.host + '/categories/expense');
                if (result) {
                    return result;
                }
            } catch (error) {
                console.log(error);
                return [];
            }
        }
        return [];
    }

    public static createIncomeExpense(array: CategoriesResponse[] | []): void {
        if (array && array.length > 0) {
            const categoriesElement: HTMLElement | null = document.querySelector('.categories');
            if (categoriesElement) {
                array.forEach((arrayItem: CategoriesResponse): void => {
                    const categoryItemElement: HTMLElement = document.createElement('div');
                    categoryItemElement.setAttribute('id', arrayItem.id.toString());
                    categoryItemElement.className = 'category-item card flex-shrink-0';

                    const categoryItemBodyElement: HTMLElement = document.createElement('div');
                    categoryItemBodyElement.className = 'category-item-body d-flex flex-column justify-content-between card-body';

                    const categoryTitleElement: HTMLElement = document.createElement('p');
                    categoryTitleElement.className = 'category-title m-0';
                    categoryTitleElement.innerText = arrayItem.title;

                    const categoryItemButtonsElement: HTMLElement = document.createElement('div');
                    categoryItemButtonsElement.className = 'category-item-buttons d-flex';


                    const buttonEditElement: HTMLElement = document.createElement('button');
                    buttonEditElement.className = 'btn-common btn-edit btn btn-primary';
                    buttonEditElement.innerText = 'Редактировать';

                    const buttonDeleteElement: HTMLElement = document.createElement('button');
                    buttonDeleteElement.className = 'btn-common btn-delete btn btn-danger';
                    buttonDeleteElement.innerText = 'Удалить';

                    categoryItemElement.appendChild(categoryItemBodyElement);
                    categoryItemBodyElement.appendChild(categoryTitleElement);
                    categoryItemBodyElement.appendChild(categoryItemButtonsElement);
                    categoryItemButtonsElement.appendChild(buttonEditElement);
                    categoryItemButtonsElement.appendChild(buttonDeleteElement);

                    categoriesElement.prepend(categoryItemElement);
                });
            }
        }
    }

    public static deleteIncomeExpense(route: RouteCategoryType, id: number, categoryName: string): void {
        const routeIncome: RouteCategoryType = RouteCategoryType.income;
        const routeExpense: RouteCategoryType = RouteCategoryType.expense;

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
            const category: string = route === routeIncome ? 'доходы' : 'расходы';
            modalText.innerText = `Вы действительно хотите удалить категорию? Связанные ${category} будут удалены навсегда.`;

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
                if (route === routeIncome) {
                    await IncomeExpenseProcess.deleteCurrentCategoryOperations(categoryName, route);
                    try {
                        const result: OperationDeleteResponse = await CustomHttp.httpRequest(config.host + '/categories/income/' + id, 'DELETE');
                        if (result && !result.error) {
                            modalWrapper.remove();
                            location.href = '#/income';
                        }
                    } catch (error) {
                        console.log(error);
                    }

                }
                if (route === routeExpense) {
                    await IncomeExpenseProcess.deleteCurrentCategoryOperations(categoryName, route);
                    try {
                        const result: OperationDeleteResponse = await CustomHttp.httpRequest(config.host + '/categories/expense/' + id, 'DELETE');
                        if (result && !result.error) {
                            modalWrapper.remove();
                            location.href = '#/expense';
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            });
        }

    }

    private static async deleteCurrentCategoryOperations(categoryName: string, type: RouteCategoryType): Promise<void> {
        const getAllOperations: AllOperationsResponse[] | [] = await CustomHttp.httpRequest(config.host + '/operations?period=all');
        if (getAllOperations) {
            let allCurrentCategoryOperations: AllOperationsResponse[] | [] = getAllOperations.filter((operation: AllOperationsResponse) => {
                return operation.category === categoryName && operation.type === type;
            });
            if (allCurrentCategoryOperations.length > 0) {
                allCurrentCategoryOperations.forEach((operation: AllOperationsResponse): void => {
                    CustomHttp.httpRequest(config.host + '/operations/' + operation.id, 'DELETE');
                });
            }
        }
    }

    private static removeModalIncomeExpense(): void {
        document.querySelectorAll('#modalIncomeExpense').forEach((element: Element) => element.remove());
    }

    public static async getIncomeExpense(route: RouteCategoryType, id: string): Promise<string | null> {
        if (route === RouteCategoryType.income) {
            try {
                const result: CategoryResponse | number = await CustomHttp.httpRequest(config.host + '/categories/income/' + id);
                if (result && (result as CategoryResponse).title && result !== 404) {
                    return <string>(result as CategoryResponse).title;
                }
                if (result === 404) {
                    location.href = '#/income';
                    return null;
                }
            } catch (error) {
                console.log(error);
                return null;
            }
        }
        if (route === RouteCategoryType.expense) {
            try {
                const result: CategoryResponse | number = await CustomHttp.httpRequest(config.host + '/categories/expense/' + id);
                if (result && (result as CategoryResponse).title && result !== 404) {
                    return <string>(result as CategoryResponse).title;
                }
                if (result === 404) {
                    location.href = '#/expense';
                    return null;
                }
            } catch (error) {
                console.log(error);
                return null;
            }
        }
        return null;
    }

    public static async editIncomeExpense(route: RouteCategoryType, id: string, value: string): Promise<void> {
        if (route === RouteCategoryType.income) {
            try {
                const result: CategoryUpdateResponse | {} = await CustomHttp.httpRequest(config.host + '/categories/income/' + id, 'PUT', {
                    title: value
                });
                if (result) {
                    location.href = '#/income';
                }
            } catch (error) {
                console.log(error);
            }
        }
        if (route === RouteCategoryType.expense) {
            try {
                const result: CategoryUpdateResponse | {} = await CustomHttp.httpRequest(config.host + '/categories/expense/' + id, 'PUT', {
                    title: value
                });
                if (result) {
                    location.href = '#/expense';
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
}
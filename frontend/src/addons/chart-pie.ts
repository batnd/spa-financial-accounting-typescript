import {AllOperationsResponse} from "../types/response/allOperations-response";
import Chart from "chart.js/auto";

export class CharPies {
    readonly allOperations: AllOperationsResponse[] | [];
    readonly totalIncomeAmountElement: HTMLElement | null;
    readonly totalExpenseAmountElement: HTMLElement | null;
    readonly barColorsValue: string[];
    readonly barColorEmpty: string[];
    readonly incomesChart: CanvasRenderingContext2D | null;
    readonly expensesChart: CanvasRenderingContext2D | null;
    readonly incomeOperations: AllOperationsResponse[] | [];
    readonly expenseOperations: AllOperationsResponse[] | [];

    constructor(operations: AllOperationsResponse[] | []) {
        this.allOperations = operations;
        this.totalIncomeAmountElement = document.getElementById('totalIncomeAmount');
        this.totalExpenseAmountElement = document.getElementById('totalExpenseAmount');
        this.barColorsValue = [
            "#d73948",
            "#f87e2e",
            "#fbbf36",
            "#32c699",
            "#176ff7",
            "#f117f8",
            "#641798",
            "#4b1b38",
            "#ffc193",
            "#9a4300",
            "#88d375",
            "#e17383",
            "#0e10ce",
            "#a8a8d2",
            "#c4a14d",
            "#d3f183",
            "#b9fdea",
            "#ac44ff",
            "#b67fa3",
            "#72834a",
            "#a40000",
        ];
        this.barColorEmpty = ["#dadada"];

        this.incomesChart = (document.getElementById("incomesChart") as HTMLCanvasElement).getContext("2d");
        this.expensesChart = (document.getElementById("expensesChart") as HTMLCanvasElement).getContext("2d");

        this.incomeOperations = this.getOperationsByType('income');
        this.expenseOperations = this.getOperationsByType('expense');

        const [incomeCategoriesNames, incomeTypeHasValue, incomeCategoriesAmount]: [string[], boolean, number[]] = this.prepareTypeData(this.incomeOperations, 'income');
        const [expenseCategoriesNames, expenseTypeHasValue, expenseCategoriesAmount]: [string[], boolean, number[]] = this.prepareTypeData(this.expenseOperations, 'expense');

        this.createChart(<CanvasRenderingContext2D>this.incomesChart, incomeCategoriesNames, incomeTypeHasValue, incomeCategoriesAmount);
        this.createChart(<CanvasRenderingContext2D>this.expensesChart, expenseCategoriesNames, expenseTypeHasValue, expenseCategoriesAmount);
    }

    private createChart(canvasElement: CanvasRenderingContext2D, labels: string[], colors: boolean, data: number[]): void {
        new Chart(canvasElement, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    backgroundColor: colors ? this.barColorsValue : this.barColorEmpty,
                    data: data,
                    hoverOffset: 5,
                    borderWidth: 1,
                }],
            },
            options: {
                layout: {
                    padding: {
                        top: -10,
                    }
                },
                radius: 180,
                plugins: {
                    legend: {
                        labels: {
                            color: "black",
                            font: {
                                size: 12,
                                // weight: 500,
                                family: "'Roboto', sans-serif",
                            },
                            boxWidth: 35,
                            padding: 10
                        },
                    }
                }
            }
        });
    }

    private getOperationsByType(type: string): AllOperationsResponse[] | [] {
        return this.allOperations.filter((operation: AllOperationsResponse): boolean => {
            return operation.type === type;
        });
    }

    private prepareTypeData(operationsByType: AllOperationsResponse[] | [], type: string): [string[], boolean, number[]] {
        const allOperationsArray: AllOperationsResponse[] | [] = this.allOperations;

        let typeHasValue: boolean = true;
        let categoriesNames: string[] = [];
        operationsByType.forEach((operation: AllOperationsResponse): void => {
            if (categoriesNames.includes(operation.category)) {
                return;
            }
            categoriesNames.push(operation.category);
        });
        if (categoriesNames.length === 0) {
            categoriesNames[0] = 'Нет данных';
        }

        let categoriesAmount: number[] = [];
        categoriesNames.forEach((category: string): void => {
            let categoryAmount: number = 0;
            for (let i: number = 0; i < allOperationsArray.length; i++) {
                if (category === allOperationsArray[i].category && allOperationsArray[i].type === type) {
                    categoryAmount += allOperationsArray[i].amount;
                }
            }
            categoriesAmount.push(categoryAmount);
        });

        let totalCategoriesAmount: number | string | null = null;
        if (categoriesAmount.length > 0 && categoriesAmount[0] === 0) {
            categoriesAmount[0] = 1;
            typeHasValue = false;
            totalCategoriesAmount = 'нет данных';
        } else {
            totalCategoriesAmount = categoriesAmount.reduce((acc: number, currentValue: number) => acc + currentValue, 0);
        }

        if (type === 'income') {
            if (this.totalIncomeAmountElement) this.totalIncomeAmountElement.innerText = totalCategoriesAmount === 'нет данных' ? totalCategoriesAmount : totalCategoriesAmount + ' $';
        }
        if (type === 'expense') {
            if (this.totalExpenseAmountElement) this.totalExpenseAmountElement.innerText = totalCategoriesAmount === 'нет данных' ? totalCategoriesAmount : totalCategoriesAmount + ' $';
        }

        return [categoriesNames, typeHasValue, categoriesAmount];
    }
}
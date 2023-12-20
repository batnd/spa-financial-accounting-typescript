import {CategoriesTemplates} from "./categories_templates";
import {OperationActions} from "./operation_actions";
import {RouteCategoryType} from "../types/route-category.type";

export class EditOperation {
    readonly currentRoute: RouteCategoryType;
    readonly currentCategory: string;

    constructor(route: RouteCategoryType) {
        this.currentRoute = route;
        this.currentCategory = 'edit';
        new CategoriesTemplates(RouteCategoryType.incomeExpense);
        new OperationActions(this.currentRoute, this.currentCategory);
    }
}
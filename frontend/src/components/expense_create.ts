import {CategoriesTemplates} from "./categories_templates";
import {CategoriesCreate} from "./categories_create";
import {RouteCategoryType} from "../types/route-category.type";

export class ExpenseCreate {
    page: RouteCategoryType;

    constructor() {
        this.page = RouteCategoryType.expense;
        new CategoriesTemplates(this.page);
        new CategoriesCreate(this.page);
    }
}
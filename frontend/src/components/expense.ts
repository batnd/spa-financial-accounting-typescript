import {CategoriesTemplates} from "./categories_templates";
import {CategoriesMain} from "./categories_main";
import {RouteCategoryType} from "../types/route-category.type";

export class Expense {
    page: RouteCategoryType;

    constructor() {
        this.page = RouteCategoryType.expense;
        new CategoriesTemplates(this.page);
        new CategoriesMain(this.page);
    }
}
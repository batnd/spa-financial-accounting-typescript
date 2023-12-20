import {CategoriesTemplates} from "./categories_templates";
import {CategoriesCreate} from "./categories_create";
import {RouteCategoryType} from "../types/route-category.type";

export class IncomeCreate {
    page: RouteCategoryType;

    constructor() {
        this.page = RouteCategoryType.income;
        new CategoriesTemplates(this.page);
        new CategoriesCreate(this.page);
    }
}
import {CategoriesTemplates} from "./categories_templates";
import {CategoriesEdit} from "./categories_edit";
import {RouteCategoryType} from "../types/route-category.type";

export class IncomeEdit {
    page: RouteCategoryType;

    constructor() {
        this.page = RouteCategoryType.income;
        new CategoriesTemplates(this.page);
        new CategoriesEdit(this.page);
    }
}
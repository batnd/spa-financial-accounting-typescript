import {CategoriesTemplates} from "./categories_templates";
import {CategoriesEdit} from "./categories_edit";
import {RouteCategoryType} from "../types/route-category.type";

export class ExpenseEdit {
    page: RouteCategoryType;

    constructor() {
        this.page = RouteCategoryType.expense;
        new CategoriesTemplates(this.page);
        new CategoriesEdit(this.page);
    }
}
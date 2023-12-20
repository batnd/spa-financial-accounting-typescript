import {RouteCategoryType} from "../types/route-category.type";

export class CategoriesTemplates {
    readonly currentRoute: RouteCategoryType;
    readonly incomeRoute: RouteCategoryType;
    readonly expenseRoute: RouteCategoryType;
    readonly incomeExpenseRoute: RouteCategoryType;
    readonly mainRoute: string;

    private commonTemplateMainElement: HTMLElement | null = null;
    private commonTemplateSidebarElement: HTMLElement | null = null;
    private commonTemplateContentElement: HTMLElement | null = null;
    private commonTemplateSideBarNavItemsElements: NodeListOf<HTMLElement> | null = null;
    private commonTemplateSideBarCategoryButtonElement: HTMLElement | null = null;
    private commonTemplateSideBarCategoriesElement: HTMLElement | null = null;
    private commonTemplateLinksIncExpElement: NodeListOf<HTMLElement> | null = null;
    private commonTemplateLinkIncomeButtonElement: HTMLElement | null = null;
    private commonTemplateLinkExpenseButtonElement: HTMLElement | null = null;

    constructor(route: RouteCategoryType) {
        this.currentRoute = route;
        this.incomeRoute = RouteCategoryType.income;
        this.expenseRoute = RouteCategoryType.expense;
        this.incomeExpenseRoute = RouteCategoryType.incomeExpense;
        this.mainRoute = 'main';

        this.commonElementsDefinition();
        this.commonSideBarTemplate(this.currentRoute);
    }

    private commonElementsDefinition(): void {
        this.commonTemplateMainElement = document.getElementById('templateMain');
        this.commonTemplateSidebarElement = document.getElementById('templateSidebar');
        this.commonTemplateContentElement = document.getElementById('templateContent');
        this.commonTemplateSideBarNavItemsElements = document.querySelectorAll('.nav-item');
        this.commonTemplateSideBarCategoryButtonElement = document.getElementById('sideBarCategoryButton');
        this.commonTemplateSideBarCategoriesElement = document.getElementById('home-collapse');
        this.commonTemplateLinksIncExpElement = document.querySelectorAll('.sidebar-nav-collapse');
        this.commonTemplateLinkIncomeButtonElement = document.getElementById('linkIncome');
        this.commonTemplateLinkExpenseButtonElement = document.getElementById('linkExpense');
    }

    private commonSideBarTemplate(route: RouteCategoryType): void {
        if (this.commonTemplateMainElement && this.commonTemplateSidebarElement && this.commonTemplateContentElement && this.commonTemplateSideBarNavItemsElements) {
            this.commonTemplateMainElement.className = 'd-flex flex-row min-vh-100 position-relative';
            this.commonTemplateSidebarElement.className = 'min-vh-100 sidebar d-flex flex-column justify-content-between flex-shrink-0 border-end';
            this.commonTemplateContentElement.className = 'container h-100 m-0';
            this.commonTemplateSideBarNavItemsElements.forEach((navItem: HTMLElement) => navItem.classList.remove('nav-item-active'));
        }
        if (route === this.mainRoute || route === this.incomeExpenseRoute) {
            if (this.commonTemplateSideBarCategoryButtonElement
                && this.commonTemplateSideBarCategoryButtonElement
                && this.commonTemplateSideBarCategoriesElement
                && this.commonTemplateSideBarNavItemsElements) {

                this.commonTemplateSideBarCategoryButtonElement.classList.add('collapsed');
                this.commonTemplateSideBarCategoryButtonElement.setAttribute('aria-expanded', "false");
                this.commonTemplateSideBarCategoriesElement.classList.remove('show');
                if (route === this.mainRoute) this.commonTemplateSideBarNavItemsElements[0].classList.add('nav-item-active');
                if (route === this.incomeExpenseRoute) this.commonTemplateSideBarNavItemsElements[1].classList.add('nav-item-active');
            }
        }
        if (route === this.incomeRoute || route === this.expenseRoute) {
            if (this.commonTemplateSideBarNavItemsElements
                && this.commonTemplateSideBarCategoryButtonElement
                && this.commonTemplateSideBarCategoriesElement) {

                this.commonTemplateSideBarNavItemsElements[2].classList.add('nav-item-active');
                this.commonTemplateSideBarCategoryButtonElement.classList.remove('collapsed');
                this.commonTemplateSideBarCategoryButtonElement.setAttribute('aria-expanded', "true");
                this.commonTemplateSideBarCategoriesElement.classList.add('show');
            }
        }

        if (this.commonTemplateLinksIncExpElement) this.commonTemplateLinksIncExpElement.forEach((link: HTMLElement) => link.classList.remove('nav-element-active'));

        if (route === this.incomeRoute) {
            if (this.commonTemplateLinkIncomeButtonElement) this.commonTemplateLinkIncomeButtonElement.classList.add('nav-element-active');
        }
        if (route === this.expenseRoute) {
            if (this.commonTemplateLinkExpenseButtonElement) this.commonTemplateLinkExpenseButtonElement.classList.add('nav-element-active');
        }
    }
}
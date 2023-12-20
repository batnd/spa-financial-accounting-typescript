export class Login {
    templateContentElement: HTMLElement | null;
    templateMainElement: HTMLElement | null;
    templateSidebarElement: HTMLElement | null;

    constructor() {
        this.templateContentElement = document.getElementById('templateContent');
        this.templateMainElement = document.getElementById('templateMain');
        this.templateSidebarElement = document.getElementById('templateSidebar');

        this.templateLoginSignup();
    }

    private templateLoginSignup(): void {
        if (this.templateMainElement && this.templateSidebarElement && this.templateContentElement) {
            this.templateMainElement.className = '';
            this.templateSidebarElement.classList.add('d-none');
            this.templateContentElement.className = '';
        }
    }
}
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class Balance {
    readonly templateContentElement: HTMLElement | null;
    readonly currentBalanceWrapperElement: HTMLElement | null;

    constructor() {
        this.templateContentElement = document.getElementById('templateContent');
        this.currentBalanceWrapperElement = document.getElementById('currentBalanceWrapper');

        this.setBalanceEventDefinition();
    }

    private setBalanceEventDefinition(): void {
        if (this.currentBalanceWrapperElement) {
            this.currentBalanceWrapperElement.addEventListener('click', (): void => {
                this.createBalanceModal();
            });
        }
    }

    private createBalanceModal(): void {
        if (this.templateContentElement) {
            const modalWrapper: HTMLElement = document.createElement('div');
            modalWrapper.className = 'show action-modal position-absolute h-100 w-100 align-items-center justify-content-center';
            modalWrapper.setAttribute('id', 'modalBalanceWrapper');

            const modalContent: HTMLElement = document.createElement('div');
            modalContent.className = 'action-modal-content modal-content bg-body';

            const modalBody: HTMLElement = document.createElement('div');
            modalBody.className = 'modal-body d-flex flex-column justify-content-between align-items-center';

            const modalText: HTMLElement = document.createElement('p');
            modalText.className = 'action-modal-text m-0';
            modalText.innerText = 'Укажите текущий баланс ($) :';

            const modalInput: HTMLInputElement = document.createElement('input');
            modalInput.setAttribute('id', 'balanceInput');
            modalInput.setAttribute('type', 'text');
            modalInput.className = 'w-75 form-control text-center';

            const modalActionWrapper: HTMLElement = document.createElement('div');
            modalActionWrapper.className = 'action-buttons d-flex justify-content-center';

            const actionEdit: HTMLElement = document.createElement('button');
            actionEdit.className = 'btn-common btn-modal-delete btn border-0 btn-success';
            actionEdit.innerText = 'ОК';

            const actionCancel: HTMLElement = document.createElement('button');
            actionCancel.className = 'btn-common btn-modal-no-delete btn border-0 btn-danger';
            actionCancel.setAttribute('id', 'balanceActionCancel');
            actionCancel.innerText = 'Отмена';

            modalWrapper.appendChild(modalContent);
            modalContent.appendChild(modalBody);
            modalBody.appendChild(modalText);
            modalBody.appendChild(modalInput);
            modalBody.appendChild(modalActionWrapper);
            modalActionWrapper.appendChild(actionEdit);
            modalActionWrapper.appendChild(actionCancel);

            this.templateContentElement.after(modalWrapper);

            modalWrapper.addEventListener('click', (event: MouseEvent): void => {
                if (event.eventPhase === 2) {
                    this.removeBalanceModal();
                }
            });
            actionCancel.addEventListener('click', (): void => {
                this.removeBalanceModal();
            });
            actionEdit.addEventListener('click', async (): Promise<void> => {
                modalInput.classList.remove('border-danger');
                if (modalInput.value) {
                    try {
                        const result: boolean = await this.setNewBalance(modalInput.value);
                        if (result) {
                            await Balance.showBalance().then();
                            this.removeBalanceModal();
                        }
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    modalInput.classList.add('border-danger');
                }
            });
            modalInput.addEventListener('keydown', function (event: KeyboardEvent): boolean {
                const regex: RegExp = /[0-9]/
                if (!regex.test(event.key) && event.key.toLowerCase() !== 'backspace') {
                    event.preventDefault();
                    return false;
                }
                return false;
            });
        }
    }

    private removeBalanceModal(): void {
        document.querySelectorAll('#modalBalanceWrapper').forEach((element: Element) => element.remove());
    }

    private async setNewBalance(newBalance: string): Promise<boolean> {
        const result = await CustomHttp.httpRequest(config.host + '/balance', 'PUT', {
            newBalance: newBalance
        });
        return result ? true : false;
    }

    public static async showBalance(): Promise<null> {
        const currentBalanceElement: HTMLElement | null = document.getElementById('currentBalance');
        if (currentBalanceElement) {
            try {
                const result: { balance: number } = await CustomHttp.httpRequest(config.host + '/balance');
                if (result) {
                    currentBalanceElement.innerText = `${result.balance}$`;
                    return null;
                } else {
                    currentBalanceElement.innerText = '0';
                    return null;
                }
            } catch (error) {
                console.log(error);
                return null;
            }
        }
        return null;
    }
}
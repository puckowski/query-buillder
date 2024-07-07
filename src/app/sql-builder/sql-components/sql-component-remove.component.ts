import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BaseSqlCompilable } from './base-sql-compilable';

@Component({
    selector: 'app-sql-component-remove',
    standalone: true,
    template: `
      <button pButton label="Remove" (click)="remove()"></button>
    `,
    imports: [FormsModule, ReactiveFormsModule, ButtonModule],
})
export class AppSqlRemoveButton {

    @Input()
    public component: BaseSqlCompilable;

    public constructor() {
    }

    public remove(): void {
        this.component.remove();
    }
}

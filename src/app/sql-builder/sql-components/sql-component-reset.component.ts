import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BaseSqlCompilable } from './base-sql-compilable';

@Component({
    selector: 'app-sql-component-reset',
    standalone: true,
    template: `
      <button pButton label="Reset" (click)="reset()"></button>
    `,
    imports: [FormsModule, ReactiveFormsModule, ButtonModule],
})
export class AppSqlResetButton {

    @Input()
    public component: BaseSqlCompilable;

    public constructor() {
    }

    public reset(): void {
        this.component.buildFormGroup();
    }
}

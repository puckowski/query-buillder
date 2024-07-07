import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { BaseSqlCompilable } from './base-sql-compilable';
import { AppSqlResetButton } from './sql-component-reset.component';
import { AppSqlRemoveButton } from './sql-component-remove.component';
import { NgIf } from '@angular/common';

interface MysqlConstantForm {
    selectedConstant: FormControl<string | null>;
}

@Component({
    selector: 'app-sql-constant',
    standalone: true,
    template: `
    <app-sql-component-reset [component]="this"></app-sql-component-reset>
    <app-sql-component-remove *ngIf="canDelete" [component]="this"></app-sql-component-remove>
    <form [formGroup]="formGroup">
    <input type="text" pInputText formControlName="selectedConstant" placeholder="Enter a constant" />
    </form>
  `,
    imports: [FormsModule, ReactiveFormsModule, InputTextModule, AppSqlResetButton, AppSqlRemoveButton, NgIf],
})
export class AppSqlConstant extends BaseSqlCompilable implements OnInit {

    public formGroup: FormGroup;

    public dropdownSelectItems: SelectItem[];

    public constructor() {
        super();
        this.buildFormGroup();
    }

    public ngOnInit(): void {
    }

    public buildFormGroup(): void {
        this.formGroup = new FormGroup<MysqlConstantForm>({
            selectedConstant: new FormControl<string | null>(null)
        });
    }

    compile(): string {
        let constant = this.formGroup.controls['selectedConstant'].value;

        if (constant === null || constant === undefined) {
            throw new Error('invalid syntax')
        } else {
            if (/^[+-]?\d+(\.\d+)?$/.test(constant)) {
                // Numeric
                return ' ' + constant + ' ';
            } else {
                return ' \'' + constant + '\' ';
            }
        }
    }
}

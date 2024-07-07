import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { BaseSqlCompilable } from './base-sql-compilable';
import { AppSqlResetButton } from './sql-component-reset.component';
import { AppSqlRemoveButton } from './sql-component-remove.component';
import { NgIf } from '@angular/common';
import { AppSqlConstant } from './sql-constant';
import { AppSqlField, Rule } from './sql-field.component';

export const MYSQL_FUNCTIONS = ['LENGTH'] as const;
export type MySqlFunctions = typeof MYSQL_FUNCTIONS[number];

interface MysqlRuleForm {
    selectedFunction: FormControl<string | null>;
    selectedValueType: FormControl<string | null>;
}

@Component({
    selector: 'app-sql-function',
    standalone: true,
    template: `
    <app-sql-component-reset [component]="this"></app-sql-component-reset>
    <app-sql-component-remove *ngIf="canDelete" [component]="this"></app-sql-component-remove>
    <form [formGroup]="formGroup">
        <p-dropdown 
        formControlName="selectedFunction" 
        [options]="dropdownSelectItems"
        placeholder="Select a function"
        appendTo="body" />
        <p-dropdown 
        formControlName="selectedValueType" 
        [options]="valueSelectItems"
        placeholder="Select a value type"
        appendTo="body" />
        <app-sql-field *ngIf="formGroup.controls['selectedValueType'].value === 'field'" [fields]="fields" [removeIndex]="0"></app-sql-field>
        <app-sql-constant *ngIf="formGroup.controls['selectedValueType'].value === 'constant'" [removeIndex]="0"></app-sql-constant>
    </form>
  `,
    imports: [FormsModule, ReactiveFormsModule, DropdownModule, AppSqlResetButton, AppSqlRemoveButton, NgIf, AppSqlField, AppSqlConstant],
})
export class AppSqlFunction extends BaseSqlCompilable implements OnInit {

    @Input()
    public fields: Rule[];

    @Input()
    public defaultSelectedFunction: boolean;

    @ViewChildren(AppSqlField) sqlFields: QueryList<AppSqlField>;
    @ViewChildren(AppSqlConstant) sqlConstants: QueryList<AppSqlConstant>;

    public formGroup: FormGroup;

    public dropdownSelectItems: SelectItem[];

    public valueSelectItems: SelectItem[] = [
        { value: 'field', label: 'SQL Field' },
        { value: 'constant', label: 'Constant' }
    ];

    public constructor() {
        super();
        this.buildFormGroup();
    }

    public ngOnInit(): void {
        this.buildOperatorOptions();
    }

    public buildFormGroup(): void {
        this.formGroup = new FormGroup<MysqlRuleForm>({
            selectedFunction: new FormControl<string | null>(null),
            selectedValueType: new FormControl<string | null>(null)
        });
    }

    protected buildOperatorOptions(): void {
        this.dropdownSelectItems = [];

        MYSQL_FUNCTIONS.forEach((functionName: string) => {
            this.dropdownSelectItems.push({ value: functionName, label: functionName });
        });

        if (this.defaultSelectedFunction && this.dropdownSelectItems.length > 0) {
            this.formGroup.controls['selectedFunction'].setValue(this.dropdownSelectItems[0].value, { emitEvent: false, onlySelf: true });
        }
    }

    compile(): string {
        let functionName = this.formGroup.controls['selectedFunction'].value;

        if (functionName === null || functionName === undefined || functionName == '') {
            throw new Error('invalid syntax')
        } else if (this.formGroup.controls['selectedValueType'].value === 'constant') {
            let constantValueStr = '';

            for (const comp of this.sqlConstants) {
                constantValueStr += comp.compile();
            }

            return ' ' + functionName + '(' + constantValueStr.trim() + ') ';
        } else if (this.formGroup.controls['selectedValueType'].value === 'field') {
            let fieldValueStr = '';

            for (const comp of this.sqlFields) {
                fieldValueStr += comp.compile();
            }

            return ' ' + functionName + '(' + fieldValueStr.trim() + ') ';
        }

        throw new Error('invalid syntax');
    }
}

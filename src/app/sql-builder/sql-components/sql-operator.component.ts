import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { BaseSqlCompilable } from './base-sql-compilable';
import { AppSqlResetButton } from './sql-component-reset.component';
import { AppSqlRemoveButton } from './sql-component-remove.component';
import { NgIf } from '@angular/common';

export const OPERATOR_TYPES = ['COMPARISON', 'BITWISE', 'ARITHMETIC', 'COMPOUND', 'LOGICAL'];
export type SqlOperatorType = 'COMPARISON' | 'BITWISE' | 'ARITHMETIC' | 'COMPOUND' | 'LOGICAL';
export type SqlOperatorTypeIterable = typeof OPERATOR_TYPES[number];

export const COMPARISON_OPERATORS = ['<>', '!=', '<', '<=', '>', '>=', '='] as const;
export type MySqlComparisonOperator = typeof COMPARISON_OPERATORS[number];

export const BITWISE_OPERATORS = ['&', '|', '^'] as const;
export type MySqlBitwiseOperator = typeof BITWISE_OPERATORS[number];

export const ARITHMETIC_OPERATORS = ['+', '-', '*', '/', '%'] as const;
export type MySqlArithmeticOperator = typeof ARITHMETIC_OPERATORS[number];

export const COMPOUND_OPERATORS = ['+=', '-=', '*=', '/=', '%=', '&=', '^-=', '|*='] as const;
export type MySqlCompoundOperator = typeof COMPOUND_OPERATORS[number];

export const LOGICAL_OPERATORS = ['ALL', 'AND', 'ANY', 'BETWEEN', 'EXISTS', 'IN', 'LIKE', 'NOT', 'OR', 'SOME', 'NOT IN'] as const;
export type MySqlLogicalOperator = typeof LOGICAL_OPERATORS[number];

interface MysqlOperatorForm {
    selectedOperator: FormControl<string | null>;
    selectedOperatorValue: FormControl<string | null>;
}

@Component({
    selector: 'app-sql-operator',
    standalone: true,
    template: `
    <app-sql-component-reset [component]="this"></app-sql-component-reset>
    <app-sql-component-remove *ngIf="canDelete" [component]="this"></app-sql-component-remove>
    <form [formGroup]="formGroup">
      <p-dropdown 
        formControlName="selectedOperator" 
        [options]="operatorDropdownSelectItems"
        placeholder="Select an operator type" 
        appendTo="body" />
      <p-dropdown 
        formControlName="selectedOperatorValue" 
        [options]="dropdownSelectItems"
        placeholder="Select an operator"
        appendTo="body" />
    </form>
  `,
    imports: [FormsModule, ReactiveFormsModule, DropdownModule, AppSqlResetButton, AppSqlRemoveButton, NgIf],
})
export class AppSqlOperator extends BaseSqlCompilable implements OnInit {

    @Input()
    public operatorType: SqlOperatorType = 'COMPARISON';

    @Input() allowedOperatorTypes: SqlOperatorType[];

    public formGroup: FormGroup;

    public dropdownSelectItems: SelectItem[];

    public operatorDropdownSelectItems: SelectItem[];

    public constructor() {
        super();
        this.buildFormGroup();
    }

    public ngOnInit(): void {
        this.buildOperatorOptions();
        this.buildOperatorValueOptions();

        this.formGroup.controls['selectedOperator'].valueChanges.subscribe((operatorType: SqlOperatorType) => {
            this.operatorType = operatorType;
            this.buildOperatorValueOptions();
            this.formGroup.controls['selectedOperatorValue'].setValue(null);
        })
    }

    public buildFormGroup(): void {
        this.formGroup = new FormGroup<MysqlOperatorForm>({
            selectedOperatorValue: new FormControl<string | null>(null),
            selectedOperator: new FormControl<string | null>(null)
        });
    }

    protected buildOperatorOptions(): void {
        if (this.allowedOperatorTypes == null || this.allowedOperatorTypes === undefined) {
            this.allowedOperatorTypes = [];
            this.operatorDropdownSelectItems = [];

            OPERATOR_TYPES.forEach((operatorType: SqlOperatorTypeIterable) => {
                this.operatorDropdownSelectItems.push({ value: operatorType, label: operatorType });
            });
        } else {
            this.operatorDropdownSelectItems = [];
            OPERATOR_TYPES.forEach((operatorType: SqlOperatorTypeIterable) => {
                const match = this.allowedOperatorTypes.find((type: SqlOperatorType) => type === operatorType);

                if (match !== null && match !== undefined) {
                    this.operatorDropdownSelectItems.push({ value: operatorType, label: operatorType });
                }
            });
        }
    }

    protected buildOperatorValueOptions(): void {
        if (this.operatorType === null || this.operatorType === undefined) {
            this.operatorType = 'COMPARISON';
        }

        this.dropdownSelectItems = [];

        switch (this.operatorType) {
            case 'COMPARISON': {
                COMPARISON_OPERATORS.forEach((comparisonOperator: MySqlComparisonOperator) => {
                    this.dropdownSelectItems.push({ value: comparisonOperator, label: comparisonOperator });
                });
                break;
            }
            case 'BITWISE': {
                BITWISE_OPERATORS.forEach((bitwiseOperator: MySqlBitwiseOperator) => {
                    this.dropdownSelectItems.push({ value: bitwiseOperator, label: bitwiseOperator });
                });
                break;
            }
            case 'ARITHMETIC': {
                ARITHMETIC_OPERATORS.forEach((arithmeticOperator: MySqlArithmeticOperator) => {
                    this.dropdownSelectItems.push({ value: arithmeticOperator, label: arithmeticOperator });
                });
                break;
            }
            case 'COMPOUND': {
                COMPOUND_OPERATORS.forEach((compoundOperator: MySqlCompoundOperator) => {
                    this.dropdownSelectItems.push({ value: compoundOperator, label: compoundOperator });
                });
                break;
            }
            case 'LOGICAL': {
                LOGICAL_OPERATORS.forEach((logicalOperator: MySqlLogicalOperator) => {
                    this.dropdownSelectItems.push({ value: logicalOperator, label: logicalOperator });
                });
                break;
            }
            default: {
                this.operatorType = 'COMPARISON';

                COMPARISON_OPERATORS.forEach((comparisonOperator: MySqlComparisonOperator) => {
                    this.dropdownSelectItems.push({ value: comparisonOperator, label: comparisonOperator });
                });
            }
        }

        this.formGroup.controls['selectedOperator'].setValue(this.operatorType, { emitEvent: false, onlySelf: true });
    }

    compile(): string {
        let operatorValue = this.formGroup.controls['selectedOperatorValue'].value;

        if (operatorValue === null || operatorValue === undefined || operatorValue === '') {
            throw new Error('invalid syntax')
        } else {
            return ' ' + operatorValue + ' ';
        }
    }
}

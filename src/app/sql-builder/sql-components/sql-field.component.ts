import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { BaseSqlCompilable } from './base-sql-compilable';
import { AppSqlResetButton } from './sql-component-reset.component';
import { AppSqlRemoveButton } from './sql-component-remove.component';
import { NgIf } from '@angular/common';

export interface Rule {
    column: string;
    id: number;
}

interface MysqlRuleForm {
    selectedField: FormControl<string | null>;
}

@Component({
    selector: 'app-sql-field',
    standalone: true,
    template: `
    <app-sql-component-reset [component]="this"></app-sql-component-reset>
    <app-sql-component-remove *ngIf="canDelete" [component]="this"></app-sql-component-remove>
    <form [formGroup]="formGroup">
      <p-dropdown 
        formControlName="selectedField" 
        [options]="dropdownSelectItems"
        placeholder="Select a rule"
        appendTo="body" />
    </form>
  `,
    imports: [FormsModule, ReactiveFormsModule, DropdownModule, AppSqlResetButton, AppSqlRemoveButton, NgIf],
})
export class AppSqlField extends BaseSqlCompilable  implements OnInit {

    @Input()
    public fields: Rule[];

    @Input()
    public defaultSelectedField: boolean;

    public formGroup: FormGroup;

    public dropdownSelectItems: SelectItem[];

    public constructor() {
        super();
        this.buildFormGroup();
    }

    public ngOnInit(): void {
        this.buildOperatorOptions();
    }

    public buildFormGroup(): void {
        this.formGroup = new FormGroup<MysqlRuleForm>({
            selectedField: new FormControl<string | null>(null)
        });
    }

    protected buildOperatorOptions(): void {
        this.dropdownSelectItems = [];

        if (this.fields === null || this.fields === undefined) {
            this.fields = [];
        }

        this.fields.forEach((rule: Rule) => {
            this.dropdownSelectItems.push({ value: rule.column, label: rule.id + ' ' + rule.column });
        });

        if (this.defaultSelectedField && this.fields.length > 0) {
            this.formGroup.controls['selectedField'].setValue(this.dropdownSelectItems[0].value, { emitEvent: false, onlySelf: true });
        }
    }

    compile(): string {
        let field = this.formGroup.controls['selectedField'].value;

        if (field === null || field === undefined || field == '') {
            throw new Error('invalid syntax')
        } else {
            return ' ' + field + ' ';
        }
    }
}

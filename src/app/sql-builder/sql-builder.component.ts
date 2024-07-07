import { Component, ViewChild, ViewContainerRef, OnInit, ComponentRef, EnvironmentInjector, createComponent, ApplicationRef, Input } from '@angular/core';
import { AppSqlOperator } from './sql-components/sql-operator.component';
import { AppSqlField, Rule } from './sql-components/sql-field.component';
import { SelectItem } from 'primeng/api';
import { AppSqlConstant } from './sql-components/sql-constant';
import { FormControl, FormGroup } from '@angular/forms';
import { SQL_COMPONENT_METADATA } from './sql-component-metadata';
import { BaseSqlCompilable, SqlCompilableMetadata } from './sql-components/base-sql-compilable';
import { first } from 'rxjs';
import { AppSqlFunction } from './sql-components/sql-function.component';

const ALL_RULES: Rule[] = [
    { column: 'ABC', id: 1 },
    { column: 'DEF', id: 2 },
    { column: 'EFG', id: 3 }
];

interface LastAddedComponentMetadata {
    type: SqlComponentType | null;
    timestamp: Date | null;
    additionalInfo?: string;
}

export type SqlComponentType = 'AppSqlOperator' | 'AppSqlField' | 'AppSqlConstant' | 'AppSqlFunction';

@Component({
    selector: 'app-sql-builder',
    templateUrl: './sql-builder.component.html',
    styleUrls: ['./sql-builder.component.css']
})
export class AppSqlBuilder implements OnInit {

    @ViewChild('compContainer', { read: ViewContainerRef, static: true })
    public compContainer: ViewContainerRef;

    @Input({ required: true }) allowedComponents: SqlComponentType[];

    public compiledSql: string | null = null;
    protected componentRefs: ComponentRef<BaseSqlCompilable>[] = [];
    protected lastAddedComponentType: LastAddedComponentMetadata = { type: null, timestamp: null };
    public componentOptions: SelectItem[] = [];

    public formGroup: FormGroup<{ selectedComponent: FormControl<string | null> }>;

    constructor(protected environmentInjector: EnvironmentInjector,
        protected appRef: ApplicationRef
    ) {
        this.formGroup = new FormGroup<{ selectedComponent: FormControl<string | null> }>({
            selectedComponent: new FormControl<string | null>('AppSqlOperator')
        })
    }

    ngOnInit(): void {
        this.initializeComponentOptions();
    }

    protected initializeComponentOptions(): void {
        const componentOptions = this.filterAllowedComponents();
        this.componentOptions = componentOptions.map(component => {
            switch (component) {
                case 'AppSqlOperator': {
                    return {
                        value: component,
                        label: 'SQL Operator'
                    }
                }
                case 'AppSqlField': {
                    return {
                        value: component,
                        label: 'SQL Field'
                    }
                }
                case 'AppSqlFunction': {
                    return {
                        value: component,
                        label: 'Function'
                    }
                }
                default: {
                    return {
                        value: component,
                        label: 'Constant'
                    }
                }
            }
        });

        if (componentOptions.length > 0) {
            this.formGroup.controls['selectedComponent'].setValue(componentOptions[0], { emitEvent: false, onlySelf: true });
        }
    }

    protected filterAllowedComponents(): SqlComponentType[] {
        if (this.allowedComponents === null || this.allowedComponents === undefined) {
            return [];
        }

        if (this.componentRefs === null || this.componentRefs === undefined) {
            this.componentRefs = [];
        }

        let result: SqlComponentType[] = [];

        if (this.componentRefs.length === 0) {
            result = this.allowedComponents.filter((componentSelectItem: SqlComponentType) => {
                const metadata = SQL_COMPONENT_METADATA.find((meta: SqlCompilableMetadata) => meta.componentName === componentSelectItem);

                if (metadata !== null && metadata !== undefined && metadata.canStartQuery) {
                    return true;
                }

                return false;
            });
        }

        return result;
    }

    public addSqlComponent(): void {
        if (this.formGroup.controls['selectedComponent'].value === this.lastAddedComponentType.type) {
            return;
        }

        let componentRef: ComponentRef<BaseSqlCompilable> | null = null;

        if (this.formGroup.controls['selectedComponent'].value === 'AppSqlOperator') {
            componentRef = createComponent(AppSqlOperator, {
                environmentInjector: this.environmentInjector
            });
            this.compContainer.element.nativeElement.appendChild(componentRef.location.nativeElement);
            (componentRef.instance as AppSqlOperator).operatorType = 'COMPARISON';
        } else if (this.formGroup.controls['selectedComponent'].value === 'AppSqlField') {
            componentRef = createComponent(AppSqlField, {
                environmentInjector: this.environmentInjector
            });
            (componentRef.instance as AppSqlField).fields = ALL_RULES;
        } else if (this.formGroup.controls['selectedComponent'].value === 'AppSqlConstant') {
            componentRef = createComponent(AppSqlConstant, {
                environmentInjector: this.environmentInjector
            });
        } else if (this.formGroup.controls['selectedComponent'].value === 'AppSqlFunction') {
            componentRef = createComponent(AppSqlFunction, {
                environmentInjector: this.environmentInjector
            });
            (componentRef.instance as AppSqlFunction).fields = ALL_RULES;
        } else {
            return;
        }

        (componentRef.instance as BaseSqlCompilable).removeIndex = this.componentRefs.length;
        
        (componentRef.instance as BaseSqlCompilable).canDelete = true;
        for (const compRef of this.componentRefs) {
            // Only latest can be removed; avoid SQL structure issues
            (compRef.instance as BaseSqlCompilable).canDelete = false;
        }

        componentRef.instance.removeOutput.pipe(first()).subscribe((index: number) => this.removeSqlComponent(index));

        this.appRef.attachView(componentRef.hostView);
        this.compContainer.element.nativeElement.appendChild(componentRef.location.nativeElement);

        this.componentRefs.push(componentRef);
        this.lastAddedComponentType = {
            type: this.formGroup.controls['selectedComponent'].value,
            timestamp: new Date(),
            additionalInfo: 'Component added successfully'
        };

        // Update component options to prevent adding the same component consecutively
        this.updateComponentOptions();
    }

    public compileAll(): void {
        const lastClassName = SQL_COMPONENT_METADATA.find((meta: SqlCompilableMetadata) =>
            meta.componentName === this.componentRefs[this.componentRefs.length - 1]
                .instance.constructor.name);

        if (lastClassName !== null && lastClassName !== null
            && lastClassName?.canEndQuery) {
            try {
                this.compiledSql = this.componentRefs.map(componentRef => componentRef.instance.compile())
                    .join('')
                    .replace(/\s{2,}/g, ' ');
            } catch (error) {
                this.compiledSql = 'SQL compilation error';
            }
        } else {
            try {
                this.compiledSql = this.componentRefs
                    .slice(0, -1)
                    .map(componentRef => componentRef.instance.compile())
                    .join('')
                    .replace(/\s{2,}/g, ' ');
            } catch (error) {
                this.compiledSql = 'SQL compilation error';
            }
        }
    }

    protected updateComponentOptions(): void {
        if (this.lastAddedComponentType.type === 'AppSqlOperator') {
            this.componentOptions = [
                { value: 'AppSqlField', label: 'SQL Field' },
                { value: 'AppSqlConstant', label: 'Constant' },
                { value: 'AppSqlFunction', label: 'Function' }
            ];
            this.formGroup.controls['selectedComponent'].setValue('AppSqlField', { emitEvent: false, onlySelf: true });
        } else if (this.lastAddedComponentType.type === 'AppSqlField') {
            this.componentOptions = [
                { value: 'AppSqlOperator', label: 'SQL Operator' }
            ];
            this.formGroup.controls['selectedComponent'].setValue('AppSqlOperator', { emitEvent: false, onlySelf: true });
        } else {
            this.componentOptions = [
                { value: 'AppSqlOperator', label: 'SQL Operator' },
                { value: 'AppSqlField', label: 'SQL Field' },
                { value: 'AppSqlConstant', label: 'Constant' },
                { value: 'AppSqlFunction', label: 'Function' }
            ];
            this.formGroup.controls['selectedComponent'].setValue('AppSqlOperator', { emitEvent: false, onlySelf: true });
        }
    }

    public resetAll(): void {
        this.componentRefs.forEach((compRef: ComponentRef<BaseSqlCompilable>) => {
            compRef.instance.buildFormGroup();
        })
    }

    protected removeSqlComponent(index: number): void {
        const componentRef = this.componentRefs[index];
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();

        const viewIndex = this.compContainer.indexOf(componentRef.hostView);
        if (viewIndex !== -1) {
            this.compContainer.remove(viewIndex);
        }

        for (let repairIndex = index + 1; repairIndex < this.componentRefs.length; ++repairIndex) {
            this.componentRefs[repairIndex].instance.removeIndex--;
        }
        this.componentRefs.splice(index, 1);

        if (this.componentRefs.length > 0) {
            this.lastAddedComponentType = {
                type: this.componentRefs[this.componentRefs.length - 1].instance.constructor.name as SqlComponentType,
                timestamp: new Date(),
                additionalInfo: 'New last component'
            };
        } else {
            this.lastAddedComponentType = { type: null, timestamp: null };
        }

        this.updateComponentOptions();
    }
}

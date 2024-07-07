import { Component, EventEmitter, Input } from "@angular/core";

export type SqlCompilableMetadata = {

    componentName: string;
    canEndQuery: boolean;
    canStartQuery: boolean;
}

@Component({
    standalone: true,
    template: ``,
    imports: [],
})
export abstract class BaseSqlCompilable {

    @Input({ required: true })
    public removeIndex: number;

    @Input()
    public canDelete: boolean;

    removeOutput: EventEmitter<number> = new EventEmitter<number>();

    abstract buildFormGroup(): void;

    abstract compile(): string;

    remove(): void {
        this.removeOutput.emit(this.removeIndex);
    }
}

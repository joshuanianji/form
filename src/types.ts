import type { ComputedRef, WritableComputedRef } from 'vue';
import type { RuleItem, ValidateError } from 'async-validator';

export type DefaultFields = Record<string, unknown>;

// https://stackoverflow.com/a/61132308
export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export interface Options<Fields extends DefaultFields> {
    defaults?: DeepPartial<FieldValues<Fields>>;
    validationMode?: 'change'|'submit';
}

export interface FieldOptions extends RuleItem {

}

export type FieldValues<Fields extends DefaultFields> = {
    [K in keyof Fields]: Fields[K];
}

export interface Field<T> {
    errors: ComputedRef<ValidateError[]>;
    error: ComputedRef<ValidateError|null>;
    hasError: ComputedRef<boolean>;
    setError: (text: string) => void;
    clearError: () => void;
    value: WritableComputedRef<T>;
}

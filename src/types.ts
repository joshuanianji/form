import type { ComputedRef, DefineComponent, WritableComputedRef } from 'vue';
import type { RuleItem, ValidateError } from 'async-validator';

export type DefaultFields = Record<string, unknown>;


// https://stackoverflow.com/a/61132308
export type DeepPartial<T extends DefaultFields> = {
    [K in keyof T]?: T[K] extends DefaultFields ? DeepPartial<T[K]> : T[K];
};

// deep copy the structure of a type
// Also have an optional "Value" generic to set all fields to that value
// by default, we'll just use the value of the Field
export type DeepCopy<T extends DefaultFields, Value extends unknown = undefined> = {
    [P in keyof T]: T[P] extends DefaultFields ? DeepCopy<T[P]>
    : Value extends undefined ? T[P] : Value;
};

export interface Options<Fields extends DefaultFields> {
    defaults?: DeepPartial<FieldValues<Fields>>;
    validationMode?: 'change' | 'submit';
}

export interface FieldOptions extends RuleItem {

}

// flattened field values
export type FieldValues<Fields extends DefaultFields> = {
    [K in NestedKeyOf<Fields>]: TypeFromPath<Fields, K>;
}

export interface Field<T> {
    errors: ComputedRef<ValidateError[]>;
    error: ComputedRef<ValidateError | null>;
    hasError: ComputedRef<boolean>;
    setError: (text: string) => void;
    clearError: () => void;
    value: WritableComputedRef<T>;
}

// ! This implementation has errors when we try FieldStore and ErrorStore
// Type helpers for NestedKeyOf
// https://medium.com/javascript-in-plain-english/advanced-typescript-type-level-nested-object-paths-7f3d8901f29a
// We make NestedKeyof tail recursive for some additional speed improvements
// type Join<
//     L extends PrimitiveKey | undefined,
//     R extends PrimitiveKey | undefined,
// > = L extends string | number ? R extends string | number ? `${L}.${R}` : L : R extends string | number ? R : undefined;

// type Union<
//     L extends unknown | undefined,
//     R extends unknown | undefined,
// > = L extends undefined ? R extends undefined ? undefined : R : R extends undefined ? L : L | R;

// type NestedKeyOfRaw<
//     T extends DefaultFields,
//     Prev extends PrimitiveKey | undefined = undefined,
//     Path extends PrimitiveKey | undefined = undefined,
// > = {
//     [K in keyof T]: T[K] extends DefaultFields
//     ? NestedKeyOfRaw<T[K], Union<Prev, Path>, Join<Path, K>>
//     : Union<Union<Prev, Path>, Join<Path, K>>;
// }[keyof T];
// the Typescript autocomplete (at least for v4.9.3) makes the types kinda ugly
// We can prettify the type using a simple helper type
// https://www.totaltypescript.com/concepts/the-prettify-helper
// export type Prettify<T> = {
//     [K in keyof T]: T[K]
// } & {};

// export type NestedKeyOf<T extends DefaultFields> = Prettify<NestedKeyOfRaw<T>>;

// https://dev.to/pffigueiredo/typescript-utility-keyof-nested-object-2pa3
export type NestedKeyOf<T extends DefaultFields> =
    { [Key in keyof T]: Key extends string
        ? T[Key] extends DefaultFields
        ? `${Key}` | `${Key}.${NestedKeyOf<T[Key]>}`
        : `${Key}`
        : never
    }[keyof T];


// https://javascript.plainenglish.io/advanced-typescript-type-level-nested-object-paths-7f3d8901f29a
export type TypeFromPath<
    T extends DefaultFields,
    Path extends NestedKeyOf<T>
> = {
    [K in Path]: K extends `${infer P}.${infer S}`
    ? T[P] extends DefaultFields
    ? S extends NestedKeyOf<T[P]>
    ? TypeFromPath<T[P], S>
    : never
    : never
    : never;
}[Path];

type MyForm = {
    userDetails: {
        email: string;
        password: string;
    },
    demographic: {
        age: number,
        height: number,
        weight: number,
    }
}

// given a type referring to a set of fields,
// return the type of the async validator `Rules` for those fields
export type RuleItemized<T extends DefaultFields> = {
    [K in keyof T]: T[K] extends DefaultFields
    ? RuleItem & { fields: RuleItemized<T[K]> }
    : RuleItem;
};

type MyFormRules = RuleItemized<MyForm>;

type MyFormTypes = NestedKeyOf<MyForm>;

type MyFormEmail = TypeFromPath<MyForm, 'demographic.age'>;
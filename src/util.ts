import { DeepPartial, DefaultFields, NestedKeyOf, TypeFromPath } from "./types";
import type { ExtractDefaultPropTypes, Ref, UnwrapRef } from "vue";

/**
 * Given the object and the dot notation path, return the value of the nested property (properly typed)
 * 
 * * WARNING: the implementation uses `any`. Its correctness relies entirely on the correctness of the type definition
 * 
 * @param obj the object to get the nested property from
 * @param dotNotationPath dot-separated path to the nested property (e.g. "foo.bar.baz")
 * @returns 
 */
export const getNestedProp = <T extends DefaultFields, Path extends NestedKeyOf<T>>(
    obj: T,
    dotNotationPath: Path
): TypeFromPath<T, Path> => {
    let returnData: any = obj;

    dotNotationPath.split(".").forEach(subPath => {
        returnData = returnData[subPath] || undefined;
    });

    return returnData;
}

/**
 * Assigns default values to a reference object via a deep merge
 * 
 * we also traverse through the entire structure
 */
export const assignDefaults = (obj: DefaultFields, defaults: DeepPartial<DefaultFields> | undefined, fallback: unknown = ''): void => {
    const keys = Object.keys(obj);
    const total = keys.length;

    for (let i = 0; i < total; i++) {
        const key = keys[i];
        if (typeof obj[key] === "object") {
            assignDefaults(obj[key] as DefaultFields, defaults && defaults[key] as DefaultFields, fallback);
        }
        obj[key] = (defaults && defaults[key]) ? defaults[key] : fallback;
    }
}

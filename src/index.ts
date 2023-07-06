import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import type { RuleItem, ValidateError } from 'async-validator';
import Validator from 'async-validator';
import type { DefaultFields, FieldOptions, Field, FieldValues, Options, NestedKeyOf, TypeFromPath, DeepCopy, DeepPartial, RuleItemized } from './types';
import { assignDefaults, getNestedProp } from './util';


export function useForm<Fields extends DefaultFields>(options: Options<Fields>) {
    // Assign some helper types on a per-instance basis.
    type Keys = keyof Fields;

    // FieldStore and ErrorStore mimic the structure of Fields.
    // https://ghaiklor.github.io/type-challenges-solutions/en/medium-deep-readonly.html
    // https://www.reddit.com/r/typescript/comments/tq3m4f/the_difference_between_object_and_recordstring/
    type FieldStore = DeepCopy<Fields>;
    // set all field values to ValidateError[]
    type ErrorStore = DeepCopy<Fields, ValidateError[]>;

    // Store all current values and errors.
    const fields = ref<DeepPartial<FieldStore>>({});
    const errors = ref<DeepPartial<ErrorStore>>({});

    // Store all of the Field validators config.
    // we follow the schema for async-validator's nested rules
    const validators = ref<DeepPartial<RuleItemized<Fields>>>({});
    let validator = new Validator({});

    // Some helper refernces.
    const loading = ref(false);

    // Re-create the Validator when the config changes.
    const watcher = watch(validators, config => {
        validator = new Validator(config);
    }, { deep: true });

    // Assign defaults.
    assignDefaults(fields.value, options.defaults);

    // Validates all of the releveant fields.
    const validate = async () => new Promise(resolve => {
        validator.validate(fields.value, undefined, (errs, fields) => {
            if (errs) {
                const total = errs.length;

                for (let i = 0; i < total; i++) {
                    const key = errs[i].field;

                    if (key) {
                        errors.value[key].push(errs[i]);
                    }
                }

                resolve(false);
            }

            resolve(true);
        });
    });

    // Returns the references to a specific Field.
    const useField = <K extends NestedKeyOf<Fields>>(name: K, fieldOptions: FieldOptions = {}) => {
        if (!errors.value[name]) {
            errors.value[name] = [];
        }

        // Append the Validator config.
        validators.value[name] = fieldOptions;

        // Assign a value if it didn't have a default.
        if (fields.value[name] === undefined) {
            fields.value[name] = '';
        }

        // Computed property for getting & setting the value of the field.
        const value = computed<TypeFromPath<Fields, K>>({
            get() {
                return getNestedProp(fields.value, name);
            },
            set(val) {
                fields.value[name] = val;
            },
        });

        // Computed property for fetching the current error(s).
        const fieldErrors = computed<ValidateError[]>(() => getNestedProp(errors.value, name) ?? []);
        const fieldError = computed<ValidateError | null>(() => {
            return fieldErrors.value.length > 0 ? fieldErrors.value[0] : null;
        });

        // TODO: fix
        // Add some manual juice for custom errors.
        const setError = (text: string) => {
            clearError();
            errors.value[name].push({
                field: name,
                message: text,
            });
        };
        const clearError = () => {
            errors.value[name] = [];
        };

        // Return a reactive object for reactivity, ofc.
        return reactive<Field<TypeFromPath<Fields, K>>>({
            errors: fieldErrors,
            error: fieldError,
            hasError: computed(() => fieldError.value !== null),
            setError,
            clearError,
            value,
        });
    };

    // Handles form submission.
    const handle = (run: (values: Fields) => Promise<void>) => async (e?: Event) => {
        if (e) {
            e.preventDefault();
        }

        if (loading.value) {
            return;
        }

        loading.value = true;

        clearErrors();

        const valid = await validate();

        if (valid) {
            await run(fields.value as FieldValues<Fields>);
        }

        loading.value = false;
    };

    // Clears all Errors.
    const clearErrors = () => {
        assignDefaults(errors.value, {}, [])
    };

    // Resets the Form values to their defaults or blank values.
    const reset = () => {
        assignDefaults(fields.value, options.defaults)
        assignDefaults(errors.value, {}, [])
    };

    // Handle clean-up.
    const destroy = () => {
        if (watcher) {
            watcher();
        }
    };
    onBeforeUnmount(() => destroy());

    return {
        useField,
        handle,
        reset,
        validate,
        clearErrors,
        loading,
        destroy,
    };
}

export * from './types';

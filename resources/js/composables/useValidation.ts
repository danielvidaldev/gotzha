import { ref, computed } from 'vue';

export interface ValidationRule {
    validate: (value: string) => boolean;
    message: string;
}

export interface FieldValidation {
    rules: ValidationRule[];
    error: string | null;
}

// ── Rule builders ──────────────────────────────────────────────────────

export function required(msg?: string): ValidationRule {
    return {
        validate: (value: string) => value.trim().length > 0,
        message: msg ?? 'This field is required.',
    };
}

export function email(msg?: string): ValidationRule {
    return {
        validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: msg ?? 'Please enter a valid email address.',
    };
}

export function minLength(min: number, msg?: string): ValidationRule {
    return {
        validate: (value: string) => value.length >= min,
        message: msg ?? `Must be at least ${min} characters.`,
    };
}

export function exactLength(len: number, msg?: string): ValidationRule {
    return {
        validate: (value: string) => value.length === len,
        message: msg ?? `Must be exactly ${len} characters.`,
    };
}

export function pattern(regex: RegExp, msg: string): ValidationRule {
    return {
        validate: (value: string) => regex.test(value),
        message: msg,
    };
}

// ── Composable ─────────────────────────────────────────────────────────

export function useValidation() {
    const fields = ref<Record<string, FieldValidation>>({});
    const serverErrors = ref<Record<string, string>>({});

    function registerField(name: string, rules: ValidationRule[]): void {
        fields.value[name] = { rules, error: null };
    }

    function validateField(name: string, value: string): string | null {
        const field = fields.value[name];
        if (!field) return null;

        for (const rule of field.rules) {
            if (!rule.validate(value)) {
                field.error = rule.message;
                return rule.message;
            }
        }

        field.error = null;
        return null;
    }

    function validateAll(values: Record<string, string>): boolean {
        let isValid = true;

        for (const name of Object.keys(fields.value)) {
            const value = values[name] ?? '';
            const error = validateField(name, value);
            if (error !== null) {
                isValid = false;
            }
        }

        return isValid;
    }

    function getError(name: string): string | null {
        // Server errors take priority
        if (serverErrors.value[name]) {
            return serverErrors.value[name];
        }
        return fields.value[name]?.error ?? null;
    }

    function setServerErrors(errors: Record<string, string>): void {
        serverErrors.value = { ...errors };
    }

    function clearServerErrors(): void {
        serverErrors.value = {};
    }

    const hasErrors = computed<boolean>(() => {
        const hasFieldErrors = Object.values(fields.value).some((f) => f.error !== null);
        const hasServerErrors = Object.keys(serverErrors.value).length > 0;
        return hasFieldErrors || hasServerErrors;
    });

    return {
        fields,
        serverErrors,
        registerField,
        validateField,
        validateAll,
        getError,
        setServerErrors,
        clearServerErrors,
        hasErrors,
        // Rule builders (available as instance methods too)
        required,
        email,
        minLength,
        exactLength,
        pattern,
    };
}

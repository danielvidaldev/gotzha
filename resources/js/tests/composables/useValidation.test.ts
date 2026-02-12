import { describe, it, expect, beforeEach } from 'vitest';
import {
    useValidation,
    required,
    email,
    minLength,
    exactLength,
    pattern,
} from '@/composables/useValidation';

describe('useValidation', () => {
    describe('rule builders', () => {
        describe('required', () => {
            it('fails on empty string', () => {
                const rule = required();
                expect(rule.validate('')).toBe(false);
                expect(rule.validate('   ')).toBe(false);
            });

            it('passes on non-empty string', () => {
                const rule = required();
                expect(rule.validate('hello')).toBe(true);
            });

            it('uses custom message', () => {
                const rule = required('Name is required');
                expect(rule.message).toBe('Name is required');
            });
        });

        describe('email', () => {
            it('validates proper emails', () => {
                const rule = email();
                expect(rule.validate('test@example.com')).toBe(true);
                expect(rule.validate('user.name@domain.co.uk')).toBe(true);
            });

            it('rejects invalid emails', () => {
                const rule = email();
                expect(rule.validate('notanemail')).toBe(false);
                expect(rule.validate('@domain.com')).toBe(false);
                expect(rule.validate('user@')).toBe(false);
                expect(rule.validate('')).toBe(false);
            });
        });

        describe('minLength', () => {
            it('validates minimum length', () => {
                const rule = minLength(6);
                expect(rule.validate('abcdef')).toBe(true);
                expect(rule.validate('abcdefgh')).toBe(true);
                expect(rule.validate('abc')).toBe(false);
            });
        });

        describe('exactLength', () => {
            it('validates exact length', () => {
                const rule = exactLength(3);
                expect(rule.validate('abc')).toBe(true);
                expect(rule.validate('ab')).toBe(false);
                expect(rule.validate('abcd')).toBe(false);
            });
        });

        describe('pattern', () => {
            it('validates against regex', () => {
                const rule = pattern(/^\d{2}\/\d{2}$/, 'Enter MM/YY');
                expect(rule.validate('12/28')).toBe(true);
                expect(rule.validate('1228')).toBe(false);
                expect(rule.validate('ab/cd')).toBe(false);
            });
        });
    });

    describe('composable', () => {
        let validation: ReturnType<typeof useValidation>;

        beforeEach(() => {
            validation = useValidation();
        });

        it('registers fields with rules', () => {
            validation.registerField('email', [required(), email()]);
            expect(validation.fields.value['email']).toBeDefined();
            expect(validation.fields.value['email'].rules).toHaveLength(2);
        });

        it('validateField returns null on valid input', () => {
            validation.registerField('name', [required()]);
            const error = validation.validateField('name', 'John');
            expect(error).toBeNull();
        });

        it('validateField returns error message on invalid input', () => {
            validation.registerField('email', [required(), email()]);
            const error = validation.validateField('email', 'notvalid');
            expect(error).toBe('Please enter a valid email address.');
        });

        it('validateField returns first failing rule message', () => {
            validation.registerField('password', [required('Password required'), minLength(6)]);
            const error = validation.validateField('password', '');
            expect(error).toBe('Password required');
        });

        it('validateField returns null for unregistered field', () => {
            const error = validation.validateField('unknown', 'value');
            expect(error).toBeNull();
        });

        it('validateAll returns true when all fields valid', () => {
            validation.registerField('name', [required()]);
            validation.registerField('email', [required(), email()]);

            const isValid = validation.validateAll({
                name: 'John',
                email: 'john@test.com',
            });
            expect(isValid).toBe(true);
        });

        it('validateAll returns false when any field invalid', () => {
            validation.registerField('name', [required()]);
            validation.registerField('email', [required(), email()]);

            const isValid = validation.validateAll({
                name: 'John',
                email: 'notvalid',
            });
            expect(isValid).toBe(false);
        });

        it('getError returns field error', () => {
            validation.registerField('name', [required()]);
            validation.validateField('name', '');

            expect(validation.getError('name')).toBe('This field is required.');
        });

        it('getError prioritizes server errors', () => {
            validation.registerField('email', [required()]);
            validation.validateField('email', '');
            validation.setServerErrors({ email: 'Email already taken.' });

            expect(validation.getError('email')).toBe('Email already taken.');
        });

        it('clearServerErrors removes all server errors', () => {
            validation.setServerErrors({ email: 'Taken', name: 'Invalid' });
            expect(validation.getError('email')).toBe('Taken');

            validation.clearServerErrors();
            expect(validation.getError('email')).toBeNull();
        });

        it('hasErrors reflects error state', () => {
            validation.registerField('name', [required()]);

            expect(validation.hasErrors.value).toBe(false);

            validation.validateField('name', '');
            expect(validation.hasErrors.value).toBe(true);

            validation.validateField('name', 'John');
            expect(validation.hasErrors.value).toBe(false);
        });

        it('hasErrors includes server errors', () => {
            expect(validation.hasErrors.value).toBe(false);

            validation.setServerErrors({ email: 'Taken' });
            expect(validation.hasErrors.value).toBe(true);
        });
    });
});

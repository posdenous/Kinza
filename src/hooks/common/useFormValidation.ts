import { useState, useEffect, useCallback } from 'react';

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  errorMessage: string;
}

interface ValidationOptions {
  debounce?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  initialDirty?: boolean;
}

interface ValidationState {
  isValid: boolean;
  errors: string[];
  isDirty: boolean;
  isTouched: boolean;
}

/**
 * Custom hook for form field validation with support for multiple validation rules
 * @param value - The value to validate
 * @param rules - Array of validation rules to apply
 * @param options - Configuration options
 * @returns Validation state and helper functions
 */
function useFormValidation<T>(
  value: T,
  rules: ValidationRule<T>[],
  options: ValidationOptions = {}
): ValidationState & {
  validate: () => boolean;
  setDirty: (dirty: boolean) => void;
  setTouched: (touched: boolean) => void;
  resetValidation: () => void;
} {
  const {
    debounce = 300,
    validateOnChange = true,
    validateOnBlur = true,
    initialDirty = false,
  } = options;

  const [state, setState] = useState<ValidationState>({
    isValid: true,
    errors: [],
    isDirty: initialDirty,
    isTouched: false,
  });

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Validation function
  const validateValue = useCallback(() => {
    const errors: string[] = [];
    
    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.errorMessage);
      }
    }
    
    const isValid = errors.length === 0;
    
    setState(prevState => ({
      ...prevState,
      isValid,
      errors,
    }));
    
    return isValid;
  }, [value, rules]);

  // Run validation when value changes (with debounce)
  useEffect(() => {
    if (!validateOnChange || !state.isDirty) {
      return;
    }
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      validateValue();
    }, debounce);
    
    setDebounceTimer(timer);
    
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [value, validateOnChange, state.isDirty, debounce, validateValue]);

  // Public methods
  const validate = useCallback(() => {
    setState(prevState => ({ ...prevState, isDirty: true, isTouched: true }));
    return validateValue();
  }, [validateValue]);

  const setDirty = useCallback((dirty: boolean) => {
    setState(prevState => ({ ...prevState, isDirty: dirty }));
  }, []);

  const setTouched = useCallback((touched: boolean) => {
    setState(prevState => ({ ...prevState, isTouched: touched }));
    if (validateOnBlur && touched) {
      validateValue();
    }
  }, [validateOnBlur, validateValue]);

  const resetValidation = useCallback(() => {
    setState({
      isValid: true,
      errors: [],
      isDirty: initialDirty,
      isTouched: false,
    });
  }, [initialDirty]);

  return {
    ...state,
    validate,
    setDirty,
    setTouched,
    resetValidation,
  };
}

export default useFormValidation;

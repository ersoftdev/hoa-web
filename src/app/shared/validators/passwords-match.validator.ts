import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Cross-field validator for a form group with `password` and
 * `confirmPassword` controls — anywhere a user sets a new password
 * (register, reset password, and any future change-password screen). */
export function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (!password || !confirmPassword) return null;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}

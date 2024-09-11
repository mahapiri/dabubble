import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


/**
 * Validator function to check if an email has a valid domain format.
 * Ensures that the domain part of the email address has at least two characters before 
 * and after the dot (e.g., `example.com`), and that it contains an '@' separating the local 
 * and domain parts.
 * @returns A validator function that checks the email's domain validity.
 */
export function emailDomainValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email: string = control.value || '';


    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
      return { invalidDomain: true };
    }

    const domain = emailParts[1];


    if (domain.length < 3) {
      return { invalidDomain: true };
    }


    const domainParts = domain.split('.');
    if (domainParts.length < 2) {
      return { invalidDomain: true }; 
    }

    const domainName = domainParts[0];
    const domainExtension = domainParts[domainParts.length - 1];


    if (domainName.length < 2) {
      return { invalidDomain: true };
    }


    if (domainExtension.length >= 2) {
      return null;
    } else {
      return { invalidDomain: true };
    }
  };
}

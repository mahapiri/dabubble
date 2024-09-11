import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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

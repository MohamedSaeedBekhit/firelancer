import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a string into sentence case (first letter of first word uppercase).
 */
@Pipe({
    name: 'sentenceCase',
    standalone: false,
})
export class SentenceCasePipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform(value: any) {
        if (typeof value === 'string') {
            let lower: string;
            if (isCamelCase(value)) {
                lower = value.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
            } else {
                lower = value.toLowerCase();
            }
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        }
        return value;
    }
}

function isCamelCase(value: string): boolean {
    return /^[a-zA-Z]+[A-Z][a-zA-Z]+$/.test(value);
}

import { Pipe, PipeTransform } from '@angular/core';
import { stringToColor } from '../../common/string-to-color';

@Pipe({
    name: 'stringToColor',
    standalone: false,
    pure: true,
})
export class StringToColorPipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform(value: any): string {
        return stringToColor(value);
    }
}

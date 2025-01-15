import { Component } from '@angular/core';
import { PrimeNG } from 'primeng/config';

@Component({
    selector: 'flr-root',
    templateUrl: './app.component.html',
    standalone: false,
})
export class AppComponent {
    constructor(private primeng: PrimeNG) {}

    ngOnInit() {
        this.primeng.ripple.set(true);
    }
}

import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { CoreModule } from './core.module';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [CoreModule, RouterModule],
    declarations: [AppComponent],
    exports: [AppComponent],
})
export class AppComponentModule {}

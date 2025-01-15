import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { getAppConfig } from './app.config';

@NgModule({
    imports: [BrowserModule, BrowserAnimationsModule],
    providers: [Title],
})
export class CoreModule {
    constructor(private titleService: Title) {
        this.initUiTitle();
    }

    private initUiTitle() {
        const title = getAppConfig().brand || 'Firelancer';
        this.titleService.setTitle(title);
    }
}

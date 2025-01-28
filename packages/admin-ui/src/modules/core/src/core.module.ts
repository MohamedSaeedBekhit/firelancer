import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { getAppConfig } from './app.config';
import { DataModule } from './data/data.module';

@NgModule({
    imports: [BrowserModule, BrowserAnimationsModule, DataModule],
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

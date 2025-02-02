import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { getAppConfig } from './app.config';
import { DataModule } from './data/data.module';
import { SharedModule } from 'primeng/api';

@NgModule({
    imports: [SharedModule, BrowserModule, BrowserAnimationsModule, DataModule],
    exports: [SharedModule],
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

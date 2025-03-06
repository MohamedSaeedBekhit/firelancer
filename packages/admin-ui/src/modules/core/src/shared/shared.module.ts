import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';

import { DisabledDirective } from './directives/disabled.directive';
import { IfPermissionsDirective } from './directives/if-permissions.directive';
import { AssetPreviewPipe } from './pipes/asset-preview.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { HasPermissionPipe } from './pipes/has-permission.pipe';
import { SentenceCasePipe } from './pipes/sentence-case.pipe';
import { SortPipe } from './pipes/sort.pipe';
import { StringToColorPipe } from './pipes/string-to-color.pipe';

const IMPORTS = [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslateModule];

const DECLARATIONS = [
    DisabledDirective,
    IfPermissionsDirective,
    AssetPreviewPipe,
    FileSizePipe,
    HasPermissionPipe,
    SentenceCasePipe,
    SortPipe,
    StringToColorPipe,
];

const PROVIDERS = [MessageService];

const UI_COMPONENTS = [
    DividerModule,
    CardModule,
    IftaLabelModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    PasswordModule,
    ToastModule,
    FloatLabelModule,
    MessageModule,
];

@NgModule({
    imports: [IMPORTS],
    exports: [...IMPORTS, ...DECLARATIONS, ...UI_COMPONENTS],
    declarations: [...DECLARATIONS],
    providers: [...PROVIDERS],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {}

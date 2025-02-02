import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AssetPreviewPipe } from './pipes/asset-preview.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { HasPermissionPipe } from './pipes/has-permission.pipe';
import { SentenceCasePipe } from './pipes/sentence-case.pipe';
import { SortPipe } from './pipes/sort.pipe';
import { StringToColorPipe } from './pipes/string-to-color.pipe';
import { DisabledDirective } from './directives/disabled.directive';
import { IfPermissionsDirective } from './directives/if-permissions.directive';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

const IMPORTS = [CommonModule, FormsModule, ReactiveFormsModule, RouterModule];

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

const UI_COMPONENTS = [
    DividerModule,
    CardModule,
    IftaLabelModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    PasswordModule,
];

@NgModule({
    imports: [IMPORTS],
    exports: [...IMPORTS, ...DECLARATIONS, ...UI_COMPONENTS],
    declarations: [...DECLARATIONS],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {}

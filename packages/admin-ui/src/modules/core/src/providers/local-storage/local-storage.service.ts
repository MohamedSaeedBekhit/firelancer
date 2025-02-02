import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { LanguageCode } from '@firelancer/common/lib/shared-schema';

export type DataTableConfig = {
    [id: string]: {
        visibility: string[];
        order: { [id: string]: number };
        showSearchFilterRow: boolean;
        filterPresets: Array<{ name: string; value: string }>;
    };
};

export type LocalStorageTypeMap = {
    authToken: string;
    uiLanguageCode: LanguageCode;
    uiLocale: string | undefined;
    contentLanguageCode: LanguageCode;
    activeTheme: string;
    livePreviewCollectionContents: boolean;
    dataTableConfig: DataTableConfig;
};

/**
 * These keys are stored specific to a particular AdminId, so that multiple
 * admins can use the same browser without interfering with each other's data.
 */
const ADMIN_SPECIFIC_KEYS: Array<keyof LocalStorageTypeMap> = [
    'activeTheme',
    'livePreviewCollectionContents',
    'dataTableConfig',
];

const PREFIX = 'vnd_';

/**
 * Wrapper around the browser's LocalStorage / SessionStorage object, for persisting data to the browser.
 */
@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    private adminId = '__global__';
    constructor(private location: Location) {}

    public setAdminId(adminId?: string | null) {
        this.adminId = adminId ?? '__global__';
    }

    /**
     * Set a key-value pair in the browser's LocalStorage
     */
    public set<K extends keyof LocalStorageTypeMap>(key: K, value: LocalStorageTypeMap[K]): void {
        const keyName = this.keyName(key);
        localStorage.setItem(keyName, JSON.stringify(value));
    }

    /**
     * Set a key-value pair in the browser's SessionStorage
     */
    public setForSession<K extends keyof LocalStorageTypeMap>(key: K, value: LocalStorageTypeMap[K]): void {
        const keyName = this.keyName(key);
        sessionStorage.setItem(keyName, JSON.stringify(value));
    }

    /**
     * Get the value of the given key from the SessionStorage or LocalStorage.
     */
    public get<K extends keyof LocalStorageTypeMap>(key: K): LocalStorageTypeMap[K] | null {
        const keyName = this.keyName(key);
        const item = sessionStorage.getItem(keyName) || localStorage.getItem(keyName);
        let result: any; // eslint-disable-line @typescript-eslint/no-explicit-any
        try {
            result = JSON.parse(item || 'null');
        } catch {
            console.error(`Could not parse the localStorage value for "${key}" (${item})`);
        }
        return result;
    }

    public remove(key: keyof LocalStorageTypeMap): void {
        const keyName = this.keyName(key);
        sessionStorage.removeItem(keyName);
        localStorage.removeItem(keyName);
    }

    private keyName(key: keyof LocalStorageTypeMap): string {
        if (ADMIN_SPECIFIC_KEYS.includes(key)) {
            return `${PREFIX}_${this.adminId}_${key}`;
        } else {
            return `${PREFIX}_${key}`;
        }
    }
}

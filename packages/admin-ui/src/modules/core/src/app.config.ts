import { AdminUiConfig } from '@firelancer/common/lib/shared-types';

let firelancerUiConfig: AdminUiConfig | undefined;

export async function loadAppConfig(): Promise<void> {
    firelancerUiConfig = await fetch('./firelancer-ui-config.json').then((res) => res.json());
}

export function getAppConfig(): AdminUiConfig {
    if (!firelancerUiConfig) {
        throw new Error(`firelancer ui config not loaded`);
    }
    return firelancerUiConfig;
}

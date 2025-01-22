import {
    CurrencyCode,
    DEFAULT_AUTH_TOKEN_HEADER_KEY,
    LanguageCode,
    SUPER_ADMIN_USER_IDENTIFIER,
    SUPER_ADMIN_USER_PASSWORD,
} from '@firelancer/common';
import { randomBytes } from 'crypto';
import { InMemoryJobBufferStorageStrategy } from '../job-queue';
import { InMemoryJobQueueStrategy } from '../job-queue/in-memory-job-queue-strategy';
import { RuntimeFirelancerConfig } from './firelancer-config';
import { DefaultAssetImportStrategy } from './strategies/asset-import/default/default-asset-import-strategy';
import { DefaultAssetNamingStrategy } from './strategies/asset/default/default-asset-naming-strategy';
import { NoAssetPreviewStrategy } from './strategies/asset/default/no-asset-preview-strategy';
import { NoAssetStorageStrategy } from './strategies/asset/default/no-asset-storage-strategy';
import { BcryptPasswordHashingStrategy } from './strategies/authentication/default/bcrypt-password-hashing-strategy';
import { DefaultPasswordValidationStrategy } from './strategies/authentication/default/default-password-validation-strategy';
import { NativeAuthenticationStrategy } from './strategies/authentication/default/native-authentication-strategy';
import { defaultCollectionFilters } from './strategies/catalog/default/default-collection-filters';
import { AutoIncrementIdStrategy } from './strategies/entity/default/auto-increment-id-strategy';
import { DefaultMoneyStrategy } from './strategies/entity/default/default-money-strategy';
import { DefaultLogger } from './strategies/logger/default/default-logger';
import { InMemorySessionCacheStrategy } from './strategies/session-cache/default/in-memory-session-cache-strategy';

/**
 * @description
 * The default configuration settings which are used if not explicitly overridden in the bootstrap() call.
 */
export const defaultConfig: RuntimeFirelancerConfig = {
    logger: new DefaultLogger(),
    apiOptions: {
        port: 3042,
        hostname: 'localhost',
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        shopListQueryLimit: 100,
        adminListQueryLimit: 1000,
        cors: {
            origin: true,
            credentials: true,
        },
        middlewares: [],
    },
    dbConnectionOptions: {
        type: 'postgres',
        synchronize: false,
    },
    defaultLanguageCode: LanguageCode.en,
    availableCurrencyCodes: [CurrencyCode.USD],
    authOptions: {
        disableAuth: false,
        tokenMethod: 'cookie',
        customPermissions: [],
        cookieOptions: {
            secret: randomBytes(16).toString('base64url'),
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
        },
        authTokenHeaderKey: DEFAULT_AUTH_TOKEN_HEADER_KEY,
        sessionDuration: '1y',
        sessionCacheStrategy: new InMemorySessionCacheStrategy(),
        sessionCacheTTL: 300,
        requireVerification: true,
        verificationTokenDuration: '7d',
        superadminCredentials: {
            identifier: SUPER_ADMIN_USER_IDENTIFIER,
            password: SUPER_ADMIN_USER_PASSWORD,
        },
        shopAuthenticationStrategy: [new NativeAuthenticationStrategy()],
        adminAuthenticationStrategy: [new NativeAuthenticationStrategy()],
        passwordHashingStrategy: new BcryptPasswordHashingStrategy(),
        passwordValidationStrategy: new DefaultPasswordValidationStrategy({ minLength: 4 }),
    },
    assetOptions: {
        assetNamingStrategy: new DefaultAssetNamingStrategy(),
        assetStorageStrategy: new NoAssetStorageStrategy(),
        assetPreviewStrategy: new NoAssetPreviewStrategy(),
        permittedFileTypes: ['image/*', 'video/*', 'audio/*', '.pdf'],
        uploadMaxFileSize: 20971520,
    },
    jobQueueOptions: {
        jobQueueStrategy: new InMemoryJobQueueStrategy(),
        jobBufferStorageStrategy: new InMemoryJobBufferStorageStrategy(),
        activeQueues: [],
        prefix: '',
    },
    catalogOptions: {
        collectionFilters: defaultCollectionFilters,
    },
    systemOptions: {
        errorHandlers: [],
    },
    plugins: [],
    entityOptions: {
        entityIdStrategy: new AutoIncrementIdStrategy(),
        moneyStrategy: new DefaultMoneyStrategy(),
    },
    importExportOptions: {
        importAssetsDir: __dirname,
        assetImportStrategy: new DefaultAssetImportStrategy(),
    },
};

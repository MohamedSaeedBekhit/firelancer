/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-function-type */

export interface Type<T = any> extends Function {
    new (...args: any[]): T;
}

/**
 * Same as Partial<T> but goes deeper and makes Partial<T> all its properties and sub-properties.
 */
export type DeepPartial<T> =
    | T
    | (T extends Array<infer U>
          ? DeepPartial<U>[]
          : T extends Map<infer K, infer V>
            ? Map<DeepPartial<K>, DeepPartial<V>>
            : T extends Set<infer M>
              ? Set<DeepPartial<M>>
              : T extends object
                ? {
                      [K in keyof T]?: DeepPartial<T[K]>;
                  }
                : T);

/**
 * A recursive implementation of Required<T>.
 * Source: https://github.com/microsoft/TypeScript/issues/15012#issuecomment-365453623
 */
export type DeepRequired<T, U extends object | undefined = undefined> = T extends object
    ? {
          [P in keyof T]-?: NonNullable<T[P]> extends NonNullable<U | Function | Type<any>>
              ? NonNullable<T[P]>
              : DeepRequired<NonNullable<T[P]>, U>;
      }
    : T;

export type TimeSpanUnit = 'ms' | 's' | 'm' | 'h' | 'd' | 'w';

export class TimeSpan {
    constructor(value: number, unit: TimeSpanUnit) {
        this.value = value;
        this.unit = unit;
    }

    public value: number;
    public unit: TimeSpanUnit;

    public milliseconds(): number {
        if (this.unit === 'ms') {
            return this.value;
        }
        if (this.unit === 's') {
            return this.value * 1000;
        }
        if (this.unit === 'm') {
            return this.value * 1000 * 60;
        }
        if (this.unit === 'h') {
            return this.value * 1000 * 60 * 60;
        }
        if (this.unit === 'd') {
            return this.value * 1000 * 60 * 60 * 24;
        }
        return this.value * 1000 * 60 * 60 * 24 * 7;
    }

    public seconds(): number {
        return this.milliseconds() / 1000;
    }

    public transform(x: number): TimeSpan {
        return new TimeSpan(Math.round(this.milliseconds() * x), 'ms');
    }
}

export function isWithinExpirationDate(date: Date): boolean {
    return Date.now() < date.getTime();
}

export function createDate(timeSpan: TimeSpan): Date {
    return new Date(Date.now() + timeSpan.milliseconds());
}

export enum LogicalOperator {
    AND = 'AND',
    OR = 'OR',
}

/** Operators for filtering on a String field */
export type StringOperators = {
    contains?: string;
    eq?: string;
    in?: string;
    isNull?: boolean;
    notContains?: string;
    notEq?: string;
    notIn?: Array<string>;
    regex?: string;
};

/** Operators for filtering on a Int or Float field */
export type NumberOperators = {
    between?: NumberRange;
    eq?: number;
    gt?: number;
    gte?: number;
    isNull?: boolean;
    lt?: number;
    lte?: number;
};

export type NumberRange = {
    end: number;
    start: number;
};

/** Operators for filtering on a Boolean field */
export type BooleanOperators = {
    eq?: boolean;
    isNull?: boolean;
};

/** Operators for filtering on a DateTime field */
export type DateOperators = {
    after?: Date;
    before?: Date;
    between?: DateRange;
    eq?: Date;
    isNull?: boolean;
};

export type DateRange = {
    end: Date;
    start: Date;
};

export type IdOperators = {
    eq?: string;
    in?: Array<string>;
    isNull?: boolean;
    notEq?: string;
    notIn?: Array<string>;
};

export type TypedArray =
    | Uint8Array
    | Int8Array
    | Uint16Array
    | Int16Array
    | Uint32Array
    | Int32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array;

export type Json =
    | null
    | boolean
    | number
    | string
    | Json[]
    | {
          [prop: string]: Json;
      };

/**
 * @description
 * A type representing JSON-compatible values.
 */
export type JsonCompatible<T> = {
    [P in keyof T]: T[P] extends Json ? T[P] : Pick<T, P> extends Required<Pick<T, P>> ? never : JsonCompatible<T[P]>;
};

/**
 * @description
 * A type describing the shape of a paginated list response. In Firelancer, almost all list queries
 * (`products`, `collections`, `orders`, `customers` etc) return an object of this type.
 */
export type PaginatedList<T> = {
    items: T[];
    totalItems: number;
};

export type ID = string | number;

export enum CustomerType {
    SELLER = 'SELLER',
    BUYER = 'BUYER',
}

export enum Permission {
    /** Authenticated means simply that the user is logged in */
    Authenticated = 'Authenticated',
    /** Grants permission to create Administrator */
    CreateAdministrator = 'CreateAdministrator',
    /** Grants permission to create Asset */
    CreateAsset = 'CreateAsset',
    /** Grants permission to create Customer */
    CreateCustomer = 'CreateCustomer',
    /** Grants permission to create JobPost */
    CreateJobPost = 'CreateJobPost',
    /** Grants permission to create Facet */
    CreateFacet = 'CreateFacet',
    /** Grants permission to delete Administrator */
    DeleteAdministrator = 'DeleteAdministrator',
    /** Grants permission to delete Asset */
    DeleteAsset = 'DeleteAsset',
    /** Grants permission to delete Customer */
    DeleteCustomer = 'DeleteCustomer',
    /** Grants permission to delete JobPost */
    DeleteJobPost = 'DeleteJobPost',
    /** Grants permission to delete Facet */
    DeleteFacet = 'DeleteFacet',
    /** Owner means the user owns this entity, e.g. a Customer's own Order */
    Owner = 'Owner',
    /** Public means any unauthenticated user may perform the operation */
    Public = 'Public',
    /** Grants permission to read Administrator */
    ReadAdministrator = 'ReadAdministrator',
    /** Grants permission to read Asset */
    ReadAsset = 'ReadAsset',
    /** Grants permission to read Customer */
    ReadCustomer = 'ReadCustomer',
    /** Grants permission to read JobPost */
    ReadJobPost = 'ReadJobPost',
    /** Grants permission to read Facet */
    ReadFacet = 'ReadFacet',
    /** SuperAdmin has unrestricted access to all operations */
    SuperAdmin = 'SuperAdmin',
    /** Grants permission to update Administrator */
    UpdateAdministrator = 'UpdateAdministrator',
    /** Grants permission to update Asset */
    UpdateAsset = 'UpdateAsset',
    /** Grants permission to update Customer */
    UpdateCustomer = 'UpdateCustomer',
    /** Grants permission to update JobPost */
    UpdateJobPost = 'UpdateJobPost',
    /** Grants permission to update Facet */
    UpdateFacet = 'UpdateFacet',
}

export enum HistoryEntryType {
    CUSTOMER_EMAIL_UPDATE_REQUESTED = 'CUSTOMER_EMAIL_UPDATE_REQUESTED',
    CUSTOMER_EMAIL_UPDATE_VERIFIED = 'CUSTOMER_EMAIL_UPDATE_VERIFIED',
    CUSTOMER_DETAIL_UPDATED = 'CUSTOMER_DETAIL_UPDATED',
    CUSTOMER_PASSWORD_RESET_REQUESTED = 'CUSTOMER_PASSWORD_RESET_REQUESTED',
    CUSTOMER_PASSWORD_RESET_VERIFIED = 'CUSTOMER_PASSWORD_RESET_VERIFIED',
    CUSTOMER_PASSWORD_UPDATED = 'CUSTOMER_PASSWORD_UPDATED',
    CUSTOMER_REGISTERED = 'CUSTOMER_REGISTERED',
    CUSTOMER_VERIFIED = 'CUSTOMER_VERIFIED',
}

export enum AssetType {
    BINARY = 'BINARY',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
}

export enum BalanceEntryType {
    FIXED_PRICE = 'FIXED_PRICE',
    BONUS = 'BONUS',
    PAYMENT = 'PAYMENT',
    WITHDRAWAL = 'WITHDRAWAL',
}

export enum BalanceEntryStatus {
    PENDING = 'PENDING',
    SETTLED = 'SETTLED',
    REJECTED = 'REJECTED',
}

/**
 * @description
 * The state of a Job in the JobQueue
 */
export enum JobState {
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
    RETRYING = 'RETRYING',
    RUNNING = 'RUNNING',
}

/**
 * @description
 * Certain entities (those which implement ConfigurableOperationDef) allow arbitrary
 * configuration arguments to be specified which can then be set in the admin-ui and used in
 * the business logic of the app. These are the valid data types of such arguments.
 * The data type influences:
 *
 * 1. How the argument form field is rendered in the admin-ui
 * 2. The JavaScript type into which the value is coerced before being passed to the business logic.
 */
export type ConfigArgType = 'string' | 'int' | 'float' | 'boolean' | 'datetime' | 'ID';

/**
 * @description
 * ISO 4217 currency code
 */
export enum CurrencyCode {
    /** United Arab Emirates dirham */
    AED = 'AED',
    /** Afghan afghani */
    AFN = 'AFN',
    /** Albanian lek */
    ALL = 'ALL',
    /** Armenian dram */
    AMD = 'AMD',
    /** Netherlands Antillean guilder */
    ANG = 'ANG',
    /** Angolan kwanza */
    AOA = 'AOA',
    /** Argentine peso */
    ARS = 'ARS',
    /** Australian dollar */
    AUD = 'AUD',
    /** Aruban florin */
    AWG = 'AWG',
    /** Azerbaijani manat */
    AZN = 'AZN',
    /** Bosnia and Herzegovina convertible mark */
    BAM = 'BAM',
    /** Barbados dollar */
    BBD = 'BBD',
    /** Bangladeshi taka */
    BDT = 'BDT',
    /** Bulgarian lev */
    BGN = 'BGN',
    /** Bahraini dinar */
    BHD = 'BHD',
    /** Burundian franc */
    BIF = 'BIF',
    /** Bermudian dollar */
    BMD = 'BMD',
    /** Brunei dollar */
    BND = 'BND',
    /** Boliviano */
    BOB = 'BOB',
    /** Brazilian real */
    BRL = 'BRL',
    /** Bahamian dollar */
    BSD = 'BSD',
    /** Bhutanese ngultrum */
    BTN = 'BTN',
    /** Botswana pula */
    BWP = 'BWP',
    /** Belarusian ruble */
    BYN = 'BYN',
    /** Belize dollar */
    BZD = 'BZD',
    /** Canadian dollar */
    CAD = 'CAD',
    /** Congolese franc */
    CDF = 'CDF',
    /** Swiss franc */
    CHF = 'CHF',
    /** Chilean peso */
    CLP = 'CLP',
    /** Renminbi (Chinese) yuan */
    CNY = 'CNY',
    /** Colombian peso */
    COP = 'COP',
    /** Costa Rican colon */
    CRC = 'CRC',
    /** Cuban convertible peso */
    CUC = 'CUC',
    /** Cuban peso */
    CUP = 'CUP',
    /** Cape Verde escudo */
    CVE = 'CVE',
    /** Czech koruna */
    CZK = 'CZK',
    /** Djiboutian franc */
    DJF = 'DJF',
    /** Danish krone */
    DKK = 'DKK',
    /** Dominican peso */
    DOP = 'DOP',
    /** Algerian dinar */
    DZD = 'DZD',
    /** Egyptian pound */
    EGP = 'EGP',
    /** Eritrean nakfa */
    ERN = 'ERN',
    /** Ethiopian birr */
    ETB = 'ETB',
    /** Euro */
    EUR = 'EUR',
    /** Fiji dollar */
    FJD = 'FJD',
    /** Falkland Islands pound */
    FKP = 'FKP',
    /** Pound sterling */
    GBP = 'GBP',
    /** Georgian lari */
    GEL = 'GEL',
    /** Ghanaian cedi */
    GHS = 'GHS',
    /** Gibraltar pound */
    GIP = 'GIP',
    /** Gambian dalasi */
    GMD = 'GMD',
    /** Guinean franc */
    GNF = 'GNF',
    /** Guatemalan quetzal */
    GTQ = 'GTQ',
    /** Guyanese dollar */
    GYD = 'GYD',
    /** Hong Kong dollar */
    HKD = 'HKD',
    /** Honduran lempira */
    HNL = 'HNL',
    /** Croatian kuna */
    HRK = 'HRK',
    /** Haitian gourde */
    HTG = 'HTG',
    /** Hungarian forint */
    HUF = 'HUF',
    /** Indonesian rupiah */
    IDR = 'IDR',
    /** Israeli new shekel */
    ILS = 'ILS',
    /** Indian rupee */
    INR = 'INR',
    /** Iraqi dinar */
    IQD = 'IQD',
    /** Iranian rial */
    IRR = 'IRR',
    /** Icelandic króna */
    ISK = 'ISK',
    /** Jamaican dollar */
    JMD = 'JMD',
    /** Jordanian dinar */
    JOD = 'JOD',
    /** Japanese yen */
    JPY = 'JPY',
    /** Kenyan shilling */
    KES = 'KES',
    /** Kyrgyzstani som */
    KGS = 'KGS',
    /** Cambodian riel */
    KHR = 'KHR',
    /** Comoro franc */
    KMF = 'KMF',
    /** North Korean won */
    KPW = 'KPW',
    /** South Korean won */
    KRW = 'KRW',
    /** Kuwaiti dinar */
    KWD = 'KWD',
    /** Cayman Islands dollar */
    KYD = 'KYD',
    /** Kazakhstani tenge */
    KZT = 'KZT',
    /** Lao kip */
    LAK = 'LAK',
    /** Lebanese pound */
    LBP = 'LBP',
    /** Sri Lankan rupee */
    LKR = 'LKR',
    /** Liberian dollar */
    LRD = 'LRD',
    /** Lesotho loti */
    LSL = 'LSL',
    /** Libyan dinar */
    LYD = 'LYD',
    /** Moroccan dirham */
    MAD = 'MAD',
    /** Moldovan leu */
    MDL = 'MDL',
    /** Malagasy ariary */
    MGA = 'MGA',
    /** Macedonian denar */
    MKD = 'MKD',
    /** Myanmar kyat */
    MMK = 'MMK',
    /** Mongolian tögrög */
    MNT = 'MNT',
    /** Macanese pataca */
    MOP = 'MOP',
    /** Mauritanian ouguiya */
    MRU = 'MRU',
    /** Mauritian rupee */
    MUR = 'MUR',
    /** Maldivian rufiyaa */
    MVR = 'MVR',
    /** Malawian kwacha */
    MWK = 'MWK',
    /** Mexican peso */
    MXN = 'MXN',
    /** Malaysian ringgit */
    MYR = 'MYR',
    /** Mozambican metical */
    MZN = 'MZN',
    /** Namibian dollar */
    NAD = 'NAD',
    /** Nigerian naira */
    NGN = 'NGN',
    /** Nicaraguan córdoba */
    NIO = 'NIO',
    /** Norwegian krone */
    NOK = 'NOK',
    /** Nepalese rupee */
    NPR = 'NPR',
    /** New Zealand dollar */
    NZD = 'NZD',
    /** Omani rial */
    OMR = 'OMR',
    /** Panamanian balboa */
    PAB = 'PAB',
    /** Peruvian sol */
    PEN = 'PEN',
    /** Papua New Guinean kina */
    PGK = 'PGK',
    /** Philippine peso */
    PHP = 'PHP',
    /** Pakistani rupee */
    PKR = 'PKR',
    /** Polish złoty */
    PLN = 'PLN',
    /** Paraguayan guaraní */
    PYG = 'PYG',
    /** Qatari riyal */
    QAR = 'QAR',
    /** Romanian leu */
    RON = 'RON',
    /** Serbian dinar */
    RSD = 'RSD',
    /** Russian ruble */
    RUB = 'RUB',
    /** Rwandan franc */
    RWF = 'RWF',
    /** Saudi riyal */
    SAR = 'SAR',
    /** Solomon Islands dollar */
    SBD = 'SBD',
    /** Seychelles rupee */
    SCR = 'SCR',
    /** Sudanese pound */
    SDG = 'SDG',
    /** Swedish krona/kronor */
    SEK = 'SEK',
    /** Singapore dollar */
    SGD = 'SGD',
    /** Saint Helena pound */
    SHP = 'SHP',
    /** Sierra Leonean leone */
    SLL = 'SLL',
    /** Somali shilling */
    SOS = 'SOS',
    /** Surinamese dollar */
    SRD = 'SRD',
    /** South Sudanese pound */
    SSP = 'SSP',
    /** São Tomé and Príncipe dobra */
    STN = 'STN',
    /** Salvadoran colón */
    SVC = 'SVC',
    /** Syrian pound */
    SYP = 'SYP',
    /** Swazi lilangeni */
    SZL = 'SZL',
    /** Thai baht */
    THB = 'THB',
    /** Tajikistani somoni */
    TJS = 'TJS',
    /** Turkmenistan manat */
    TMT = 'TMT',
    /** Tunisian dinar */
    TND = 'TND',
    /** Tongan paʻanga */
    TOP = 'TOP',
    /** Turkish lira */
    TRY = 'TRY',
    /** Trinidad and Tobago dollar */
    TTD = 'TTD',
    /** New Taiwan dollar */
    TWD = 'TWD',
    /** Tanzanian shilling */
    TZS = 'TZS',
    /** Ukrainian hryvnia */
    UAH = 'UAH',
    /** Ugandan shilling */
    UGX = 'UGX',
    /** United States dollar */
    USD = 'USD',
    /** Uruguayan peso */
    UYU = 'UYU',
    /** Uzbekistan som */
    UZS = 'UZS',
    /** Venezuelan bolívar soberano */
    VES = 'VES',
    /** Vietnamese đồng */
    VND = 'VND',
    /** Vanuatu vatu */
    VUV = 'VUV',
    /** Samoan tala */
    WST = 'WST',
    /** CFA franc BEAC */
    XAF = 'XAF',
    /** East Caribbean dollar */
    XCD = 'XCD',
    /** CFA franc BCEAO */
    XOF = 'XOF',
    /** CFP franc (franc Pacifique) */
    XPF = 'XPF',
    /** Yemeni rial */
    YER = 'YER',
    /** South African rand */
    ZAR = 'ZAR',
    /** Zambian kwacha */
    ZMW = 'ZMW',
    /** Zimbabwean dollar */
    ZWL = 'ZWL',
}

/**
 * @description
 * This interface describes JSON config file (firelancer-ui-config.json) used by the Admin UI.
 * The values are loaded at run-time by the Admin UI app, and allow core configuration to be
 * managed without the need to re-build the application.
 */
export interface AdminUiConfig {
    /**
     * @description
     * The hostname of the Firelancer server which the admin UI will be making API calls
     * to. If set to "auto", the Admin UI app will determine the hostname from the
     * current location (i.e. `window.location.hostname`).
     *
     * @default 'auto'
     */
    apiHost: string | 'auto';
    /**
     * @description
     * The port of the Firelancer server which the admin UI will be making API calls
     * to. If set to "auto", the Admin UI app will determine the port from the
     * current location (i.e. `window.location.port`).
     *
     * @default 'auto'
     */
    apiPort: number | 'auto';
    /**
     * @description
     * The path to the REST Admin API.
     *
     * @default 'admin-api'
     */
    adminApiPath: string;
    /**
     * @description
     * Whether to use cookies or bearer tokens to track sessions.
     * Should match the setting of in the server's `tokenMethod` config
     * option.
     *
     * @default 'cookie'
     */
    tokenMethod: 'cookie' | 'bearer';
    /**
     * @description
     * The header used when using the 'bearer' auth method. Should match the
     * setting of the server's `authOptions.authTokenHeaderKey` config option.
     *
     * @default 'firelancer-auth-token'
     */
    authTokenHeaderKey: string;
    /**
     * @description
     * If you are using an external {@link AuthenticationStrategy} for the Admin API, you can configure
     * a custom URL for the login page with this option. On logging out or redirecting an unauthenticated
     * user, the Admin UI app will redirect the user to this URL rather than the default username/password
     * screen.
     */
    loginUrl?: string;
    /**
     * @description
     * The custom brand name.
     */
    brand?: string;
    /**
     * @description
     * Option to hide firelancer branding.
     *
     * @default false
     */
    hideFirelancerBranding?: boolean;
    /**
     * @description
     * Option to hide version.
     *
     * @default false
     */
    hideVersion?: boolean;
}

/**
 * @description
 * Configures the path to a custom-build of the Admin UI app.
 */
export interface AdminUiAppConfig {
    /**
     * @description
     * The path to the compiled admin UI app files. If not specified, an internal
     * default build is used. This path should contain the `firelancer-ui-config.json` file,
     * index.html, the compiled js bundles etc.
     */
    path: string;
    /**
     * @description
     * Specifies the url route to the Admin UI app.
     *
     * @default 'admin'
     */
    route?: string;
    /**
     * @description
     * The function which will be invoked to start the app compilation process.
     */
    compile?: () => Promise<void>;
}

/**
 * @description
 * Information about the Admin UI app dev server.
 */
export interface AdminUiAppDevModeConfig {
    /**
     * @description
     * The path to the uncompiled UI app source files. This path should contain the `firelancer-ui-config.json` file.
     */
    sourcePath: string;
    /**
     * @description
     * The port on which the dev server is listening. Overrides the value set by `AdminUiOptions.port`.
     */
    port: number;
    /**
     * @description
     * Specifies the url route to the Admin UI app.
     *
     * @default 'admin'
     */
    route?: string;
    /**
     * @description
     * The function which will be invoked to start the app compilation process.
     */
    compile: () => Promise<void>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { IsEntityId } from './entity-id-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Buffer } from 'buffer';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDefined,
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNotEmptyObject,
    IsNumber,
    IsObject,
    IsOptional,
    IsPositive,
    IsString,
    ValidateNested,
} from 'class-validator';

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

export enum DeletionResult {
    /** The entity was successfully deleted */
    DELETED = 'DELETED',
    /** Deletion did not take place, reason given in message */
    NOT_DELETED = 'NOT_DELETED',
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
 * Languages in the form of a ISO 639-1 language code with optional
 * region or script modifier (e.g. de_AT). The selection available is based
 * on the [Unicode CLDR summary list](https://unicode-org.github.io/cldr-staging/charts/37/summary/root.html)
 * and includes the major spoken languages of the world and any widely-used variants.
 */
export enum LanguageCode {
    /** Afrikaans */
    af = 'af',
    /** Akan */
    ak = 'ak',
    /** Amharic */
    am = 'am',
    /** Arabic */
    ar = 'ar',
    /** Assamese */
    as = 'as',
    /** Azerbaijani */
    az = 'az',
    /** Belarusian */
    be = 'be',
    /** Bulgarian */
    bg = 'bg',
    /** Bambara */
    bm = 'bm',
    /** Bangla */
    bn = 'bn',
    /** Tibetan */
    bo = 'bo',
    /** Breton */
    br = 'br',
    /** Bosnian */
    bs = 'bs',
    /** Catalan */
    ca = 'ca',
    /** Chechen */
    ce = 'ce',
    /** Corsican */
    co = 'co',
    /** Czech */
    cs = 'cs',
    /** Church Slavic */
    cu = 'cu',
    /** Welsh */
    cy = 'cy',
    /** Danish */
    da = 'da',
    /** German */
    de = 'de',
    /** Austrian German */
    de_AT = 'de_AT',
    /** Swiss High German */
    de_CH = 'de_CH',
    /** Dzongkha */
    dz = 'dz',
    /** Ewe */
    ee = 'ee',
    /** Greek */
    el = 'el',
    /** English */
    en = 'en',
    /** Australian English */
    en_AU = 'en_AU',
    /** Canadian English */
    en_CA = 'en_CA',
    /** British English */
    en_GB = 'en_GB',
    /** American English */
    en_US = 'en_US',
    /** Esperanto */
    eo = 'eo',
    /** Spanish */
    es = 'es',
    /** European Spanish */
    es_ES = 'es_ES',
    /** Mexican Spanish */
    es_MX = 'es_MX',
    /** Estonian */
    et = 'et',
    /** Basque */
    eu = 'eu',
    /** Persian */
    fa = 'fa',
    /** Dari */
    fa_AF = 'fa_AF',
    /** Fulah */
    ff = 'ff',
    /** Finnish */
    fi = 'fi',
    /** Faroese */
    fo = 'fo',
    /** French */
    fr = 'fr',
    /** Canadian French */
    fr_CA = 'fr_CA',
    /** Swiss French */
    fr_CH = 'fr_CH',
    /** Western Frisian */
    fy = 'fy',
    /** Irish */
    ga = 'ga',
    /** Scottish Gaelic */
    gd = 'gd',
    /** Galician */
    gl = 'gl',
    /** Gujarati */
    gu = 'gu',
    /** Manx */
    gv = 'gv',
    /** Hausa */
    ha = 'ha',
    /** Hebrew */
    he = 'he',
    /** Hindi */
    hi = 'hi',
    /** Croatian */
    hr = 'hr',
    /** Haitian Creole */
    ht = 'ht',
    /** Hungarian */
    hu = 'hu',
    /** Armenian */
    hy = 'hy',
    /** Interlingua */
    ia = 'ia',
    /** Indonesian */
    id = 'id',
    /** Igbo */
    ig = 'ig',
    /** Sichuan Yi */
    ii = 'ii',
    /** Icelandic */
    is = 'is',
    /** Italian */
    it = 'it',
    /** Japanese */
    ja = 'ja',
    /** Javanese */
    jv = 'jv',
    /** Georgian */
    ka = 'ka',
    /** Kikuyu */
    ki = 'ki',
    /** Kazakh */
    kk = 'kk',
    /** Kalaallisut */
    kl = 'kl',
    /** Khmer */
    km = 'km',
    /** Kannada */
    kn = 'kn',
    /** Korean */
    ko = 'ko',
    /** Kashmiri */
    ks = 'ks',
    /** Kurdish */
    ku = 'ku',
    /** Cornish */
    kw = 'kw',
    /** Kyrgyz */
    ky = 'ky',
    /** Latin */
    la = 'la',
    /** Luxembourgish */
    lb = 'lb',
    /** Ganda */
    lg = 'lg',
    /** Lingala */
    ln = 'ln',
    /** Lao */
    lo = 'lo',
    /** Lithuanian */
    lt = 'lt',
    /** Luba-Katanga */
    lu = 'lu',
    /** Latvian */
    lv = 'lv',
    /** Malagasy */
    mg = 'mg',
    /** Maori */
    mi = 'mi',
    /** Macedonian */
    mk = 'mk',
    /** Malayalam */
    ml = 'ml',
    /** Mongolian */
    mn = 'mn',
    /** Marathi */
    mr = 'mr',
    /** Malay */
    ms = 'ms',
    /** Maltese */
    mt = 'mt',
    /** Burmese */
    my = 'my',
    /** Norwegian Bokmål */
    nb = 'nb',
    /** North Ndebele */
    nd = 'nd',
    /** Nepali */
    ne = 'ne',
    /** Dutch */
    nl = 'nl',
    /** Flemish */
    nl_BE = 'nl_BE',
    /** Norwegian Nynorsk */
    nn = 'nn',
    /** Nyanja */
    ny = 'ny',
    /** Oromo */
    om = 'om',
    /** Odia */
    or = 'or',
    /** Ossetic */
    os = 'os',
    /** Punjabi */
    pa = 'pa',
    /** Polish */
    pl = 'pl',
    /** Pashto */
    ps = 'ps',
    /** Portuguese */
    pt = 'pt',
    /** Brazilian Portuguese */
    pt_BR = 'pt_BR',
    /** European Portuguese */
    pt_PT = 'pt_PT',
    /** Quechua */
    qu = 'qu',
    /** Romansh */
    rm = 'rm',
    /** Rundi */
    rn = 'rn',
    /** Romanian */
    ro = 'ro',
    /** Moldavian */
    ro_MD = 'ro_MD',
    /** Russian */
    ru = 'ru',
    /** Kinyarwanda */
    rw = 'rw',
    /** Sanskrit */
    sa = 'sa',
    /** Sindhi */
    sd = 'sd',
    /** Northern Sami */
    se = 'se',
    /** Sango */
    sg = 'sg',
    /** Sinhala */
    si = 'si',
    /** Slovak */
    sk = 'sk',
    /** Slovenian */
    sl = 'sl',
    /** Samoan */
    sm = 'sm',
    /** Shona */
    sn = 'sn',
    /** Somali */
    so = 'so',
    /** Albanian */
    sq = 'sq',
    /** Serbian */
    sr = 'sr',
    /** Southern Sotho */
    st = 'st',
    /** Sundanese */
    su = 'su',
    /** Swedish */
    sv = 'sv',
    /** Swahili */
    sw = 'sw',
    /** Congo Swahili */
    sw_CD = 'sw_CD',
    /** Tamil */
    ta = 'ta',
    /** Telugu */
    te = 'te',
    /** Tajik */
    tg = 'tg',
    /** Thai */
    th = 'th',
    /** Tigrinya */
    ti = 'ti',
    /** Turkmen */
    tk = 'tk',
    /** Tongan */
    to = 'to',
    /** Turkish */
    tr = 'tr',
    /** Tatar */
    tt = 'tt',
    /** Uyghur */
    ug = 'ug',
    /** Ukrainian */
    uk = 'uk',
    /** Urdu */
    ur = 'ur',
    /** Uzbek */
    uz = 'uz',
    /** Vietnamese */
    vi = 'vi',
    /** Volapük */
    vo = 'vo',
    /** Wolof */
    wo = 'wo',
    /** Xhosa */
    xh = 'xh',
    /** Yiddish */
    yi = 'yi',
    /** Yoruba */
    yo = 'yo',
    /** Chinese */
    zh = 'zh',
    /** Simplified Chinese */
    zh_Hans = 'zh_Hans',
    /** Traditional Chinese */
    zh_Hant = 'zh_Hant',
    /** Zulu */
    zu = 'zu',
}

export class AuthenticationMethod {
    createdAt: Date;
    id: ID;
    strategy?: string;
    updatedAt: Date;
    // TODO
    user: any;
}

export class Role {
    code: string;
    createdAt: Date;
    description: string;
    id: ID;
    permissions: Array<Permission>;
    updatedAt: Date;
}

export class User {
    authenticationMethods: Array<AuthenticationMethod>;
    createdAt: Date;
    id: ID;
    identifier: string;
    lastLogin?: Date | null;
    roles: Array<Role>;
    updatedAt: Date;
    verified: boolean;
}

export class Customer {
    deletedAt: Date | null;
    title: string | null;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    emailAddress: string;
    user?: User;
}

export class JobPost {
    deletedAt: Date | null;
    publishedAt: Date | null;
    customerId: ID;
    customer: Customer;
    title: string;
    description: string;
    enabled: boolean;
    private: boolean;
    assets: Array<Asset>;
    facetValues: Array<FacetValue>;
    collections: Array<Collection>;
}

export class CollectionBreadcrumb {
    id: ID;
    name: string;
    slug: string;
}

export class Collection {
    assets: Array<Asset>;
    breadcrumbs: Array<CollectionBreadcrumb>;
    children?: Array<Collection>;
    createdAt: Date;
    description: string;
    featuredAsset?: Asset;
    filters: Array<ConfigurableOperation>;
    id: ID;
    inheritFilters: boolean;
    isPrivate: boolean;
    languageCode?: LanguageCode;
    name: string;
    parent?: Collection;
    parentId: ID;
    position: number;
    slug: string;
    translations: Array<CollectionTranslation>;
    updatedAt: Date;
    // TODO
    // jobPosts: JobPostList;
}

export class CollectionTranslation {
    createdAt: Date;
    description: string;
    id: ID;
    languageCode: LanguageCode;
    name: string;
    slug: string;
    updatedAt: Date;
}

export class Asset {
    createdAt: Date;
    fileSize: number;
    focalPoint?: Coordinate;
    height: number;
    id: ID;
    mimeType: string;
    name: string;
    preview: string;
    source: string;
    type: AssetType;
    updatedAt: Date;
    width: number;
}

export class Facet {
    code: string;
    createdAt: Date;
    id: ID;
    isPrivate: boolean;
    languageCode: LanguageCode;
    name: string;
    translations: Array<FacetTranslation>;
    updatedAt: Date;
    values: Array<FacetValue>;
}

export class FacetTranslation {
    id: ID;
    languageCode: LanguageCode;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export class FacetValue {
    id: ID;
    code: string;
    facet: Facet;
    facetId: ID;
    languageCode: LanguageCode;
    name: string;
    translations: Array<FacetValueTranslation>;
    createdAt: Date;
    updatedAt: Date;
}

export class FacetValueTranslation {
    id: ID;
    languageCode: LanguageCode;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export class CreateAdministratorInput {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    emailAddress: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lastName: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;
    @ApiProperty({ isArray: true, type: 'number' })
    @IsEntityId({ each: true })
    roleIds: Array<ID>;
}

export class UpdateAdministratorInput {
    @ApiProperty()
    @IsEntityId()
    id: ID;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    emailAddress?: string;
    @ApiProperty()
    @IsString()
    @IsOptional()
    firstName?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    lastName?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    password?: string;
    @ApiProperty({ isArray: true, type: 'number' })
    @IsOptional()
    @IsEntityId({ each: true })
    roleIds?: Array<ID>;
}

export class UpdateActiveAdministratorInput {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    emailAddress?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    firstName?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    lastName?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    password?: string;
}

export class CurrentUser {
    @ApiProperty()
    @IsEntityId()
    id: ID;
    @ApiProperty()
    @IsString()
    identifier: string;
    @ApiProperty()
    @IsEnum(Permission, { each: true })
    permissions: Array<Permission>;
}

export class MutationLoginArgs {
    @ApiProperty()
    @IsString()
    password: string;
    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    rememberMe?: boolean;
    @ApiProperty()
    @IsString()
    username: string;
}

export class NativeAuthInput {
    @ApiProperty()
    @IsString()
    password: string;
    @ApiProperty()
    @IsString()
    username: string;
}

export class AuthenticationInput {
    @ApiPropertyOptional()
    @IsOptional()
    native?: NativeAuthInput;
}

export class MutationAuthenticateArgs {
    @ApiProperty()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => AuthenticationInput)
    input: AuthenticationInput;
    @IsBoolean()
    @IsOptional()
    rememberMe?: boolean;
}

export class CreateCustomerInput {
    @ApiProperty()
    @IsString()
    emailAddress: string;
    @ApiProperty()
    @IsEnum(CustomerType)
    customerType: CustomerType;
    @ApiProperty()
    @IsString()
    firstName: string;
    @ApiProperty()
    @IsString()
    lastName: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    phoneNumber?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title?: string;
}

export class UpdateCustomerInput {
    @ApiProperty()
    @IsEntityId()
    id: ID;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    emailAddress?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    firstName?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    lastName?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    phoneNumber?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title?: string;
}

export class RegisterCustomerInput {
    @ApiProperty()
    @IsString()
    emailAddress: string;
    @ApiProperty()
    @IsEnum(CustomerType)
    customerType: CustomerType;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    firstName?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    lastName?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    password?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    phoneNumber?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title?: string;
}

export class CreateRoleInput {
    @ApiProperty()
    @IsString()
    code: string;
    @ApiProperty()
    @IsString()
    description: string;
    @ApiProperty()
    @IsEnum(Permission, { each: true })
    permissions: Array<Permission>;
}

export class UpdateRoleInput {
    @ApiProperty()
    @IsEntityId()
    id: ID;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    code?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;
    @ApiPropertyOptional()
    @IsEnum(Permission, { each: true })
    @IsOptional()
    permissions?: Array<Permission>;
}

export class MutationRegisterCustomerAccountArgs {
    @ApiProperty()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => RegisterCustomerInput)
    input: RegisterCustomerInput;
}

export class MutationVerifyCustomerAccountArgs {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    password?: string;
    @ApiProperty()
    @IsString()
    token: string;
}

export class MutationRefreshCustomerVerificationArgs {
    @ApiProperty()
    @IsString()
    emailAddress: string;
}

export class MutationRequestPasswordResetArgs {
    @ApiProperty()
    @IsString()
    emailAddress: string;
}

export class MutationResetPasswordArgs {
    @ApiProperty()
    @IsString()
    password: string;
    @ApiProperty()
    @IsString()
    token: string;
}

export class MutationUpdateCustomerPasswordArgs {
    @ApiProperty()
    @IsString()
    currentPassword: string;
    @ApiProperty()
    @IsString()
    newPassword: string;
}

export class MutationRequestUpdateCustomerEmailAddressArgs {
    @ApiProperty()
    @IsString()
    newEmailAddress: string;
    @ApiProperty()
    @IsString()
    password: string;
}

export class MutationUpdateCustomerEmailAddressArgs {
    @ApiProperty()
    @IsString()
    token: string;
}

export class MutationCreateAdministratorArgs {
    @ApiProperty()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CreateAdministratorInput)
    input: CreateAdministratorInput;
}

export class MutationUpdateAdministratorArgs {
    @ApiProperty()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => UpdateAdministratorInput)
    input: UpdateAdministratorInput;
}

export class MutationUpdateActiveAdministratorArgs {
    @ApiProperty()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => UpdateActiveAdministratorInput)
    input: UpdateActiveAdministratorInput;
}

export class MutationAssignRoleToAdministratorArgs {
    @ApiProperty()
    @IsEntityId()
    administratorId: ID;
    @ApiProperty()
    @IsEntityId()
    roleId: ID;
}

export class MutationDeleteAdministratorArgs {
    @ApiProperty()
    @IsEntityId()
    id: ID;
}

export class MutationDeleteAdministratorsArgs {
    ids: Array<ID>;
}

export class QueryAdministratorArgs {
    @ApiProperty()
    @IsEntityId()
    id: ID;
}

export class File {
    @IsString()
    originalname: string;
    @IsString()
    mimetype: string;
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @Type(() => Buffer)
    buffer: Buffer;
    @IsNumber()
    size: number;
}

export class CreateAssetInput {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => File)
    file: File;
}

export class CoordinateInput {
    @ApiProperty()
    @IsNumber()
    x: number;
    @ApiProperty()
    @IsNumber()
    y: number;
}

export class UpdateAssetInput {
    @ApiProperty()
    @IsEntityId()
    id: ID;
    @IsOptional()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @ApiProperty()
    @Type(() => CoordinateInput)
    focalPoint?: CoordinateInput;
    @ApiProperty()
    @IsString()
    @IsOptional()
    name?: string;
    @ApiProperty()
    @IsString()
    @IsOptional()
    tags?: string;
}

export class CreateJobPostInput {
    @ApiProperty()
    @IsEntityId()
    customerId: ID;
    @ApiProperty()
    @IsString()
    title: string;
    @ApiProperty()
    @IsString()
    description: string;
    @ApiProperty()
    @IsBoolean()
    enabled: boolean;
    @ApiProperty()
    @IsBoolean()
    private: boolean;
    @ApiPropertyOptional({ isArray: true, type: 'number' })
    @IsOptional()
    @IsEntityId({ each: true })
    assetIds?: Array<ID>;
    @ApiPropertyOptional({ isArray: true, type: 'number' })
    @IsOptional()
    @IsEntityId({ each: true })
    facetValueIds?: Array<ID>;
}

export class MutationCreateJobPostArgs {
    @ApiProperty()
    @IsString()
    title: string;
    @ApiProperty()
    @IsString()
    description: string;
    @ApiProperty()
    @IsBoolean()
    private: boolean;
    @ApiPropertyOptional({ isArray: true, type: 'number' })
    @IsOptional()
    @IsEntityId({ each: true })
    facetValueIds?: Array<ID>;
}

export class FacetValueTranslationInput {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEntityId()
    id?: ID;
    @ApiProperty()
    @IsEnum(LanguageCode)
    languageCode: LanguageCode;
    @ApiProperty()
    @IsString()
    @IsOptional()
    name?: string;
}

export class CreateFacetValueInput {
    @ApiProperty()
    @IsString()
    code: string;
    @ApiProperty()
    @IsEntityId()
    facetId: ID;
    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacetValueTranslationInput)
    translations: Array<FacetValueTranslationInput>;
}

export class UpdateFacetValueInput {
    @ApiProperty()
    @IsEntityId()
    id: ID;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    code?: string;
    @ApiPropertyOptional()
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => FacetValueTranslationInput)
    translations?: Array<FacetValueTranslationInput>;
}

export class CreateFacetValueWithFacetInput {
    @ApiProperty()
    @IsString()
    code: string;
    @ApiProperty()
    @IsString()
    name: string;
}

export class FacetTranslationInput {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEntityId()
    id?: ID;
    @ApiProperty()
    @IsEnum(LanguageCode)
    languageCode: LanguageCode;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;
}

export class CreateFacetInput {
    @ApiProperty()
    @IsString()
    code: string;
    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacetTranslationInput)
    translations: Array<FacetTranslationInput>;
    @ApiPropertyOptional()
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateFacetValueWithFacetInput)
    values?: CreateFacetValueWithFacetInput[];
}

export class UpdateFacetInput {
    @ApiProperty()
    @IsEntityId()
    id: ID;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    code?: string;
    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacetTranslationInput)
    translations: Array<FacetTranslationInput>;
}

export class CreateBalanceEntryInput {
    @ApiProperty()
    @IsObject()
    @ValidateNested()
    @Type(() => Customer)
    customer: Customer;
    @IsEnum(BalanceEntryType)
    type: BalanceEntryType;
    @IsInt()
    @IsPositive()
    @IsOptional()
    reviewDays?: number;
    @IsEnum(CurrencyCode)
    currencyCode: CurrencyCode;
    @IsInt()
    @IsPositive()
    credit: number;
    @IsInt()
    @IsPositive()
    debit: number;
    @IsString()
    @IsOptional()
    description?: string;
    @IsOptional()
    metadata?: Record<string, string>;
}

export class ConfigArg {
    @IsString()
    name: string;
    @IsString()
    value: string;
}

export class ConfigurableOperation {
    @IsString()
    code: string;
    @IsString()
    args: Array<ConfigArg>;
}

export class CreateCollectionTranslationInput {
    @ApiProperty()
    @IsEnum(LanguageCode)
    languageCode: LanguageCode;
    @ApiProperty()
    @IsString()
    name: string;
    @ApiProperty()
    @IsString()
    slug: string;
    @ApiProperty()
    @IsString()
    description: string;
}

export class CreateCollectionInput {
    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCollectionTranslationInput)
    translations: Array<CreateCollectionTranslationInput>;
    @ApiPropertyOptional()
    @IsOptional()
    @IsEntityId()
    featuredAssetId?: ID;
    @ApiPropertyOptional({ isArray: true, type: 'number' })
    @IsOptional()
    @IsEntityId({ each: true })
    assetIds?: Array<ID>;
    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConfigurableOperation)
    filters: Array<ConfigurableOperation>;
    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    inheritFilters?: boolean;
    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isPrivate?: boolean;
    @ApiPropertyOptional()
    @IsOptional()
    @IsEntityId()
    parentId?: ID;
}

export class MutationCreateCollectionArgs {
    @ApiProperty()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CreateCollectionInput)
    input: CreateCollectionInput;
}

export class UpdateCollectionTranslationInput {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEntityId()
    id?: ID;
    @ApiPropertyOptional()
    @IsEnum(LanguageCode)
    languageCode: LanguageCode;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    slug?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateCollectionInput {
    @ApiProperty()
    @IsEntityId()
    id: ID;
    @ApiPropertyOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateCollectionTranslationInput)
    @IsOptional()
    translations?: Array<UpdateCollectionTranslationInput>;
    @ApiPropertyOptional()
    @IsOptional()
    @IsEntityId()
    featuredAssetId?: ID;
    @ApiPropertyOptional({ isArray: true, type: 'number' })
    @IsOptional()
    @IsEntityId({ each: true })
    assetIds?: Array<ID>;
    @ApiPropertyOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConfigurableOperation)
    @IsOptional()
    filters?: Array<ConfigurableOperation>;
    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    inheritFilters?: boolean;
    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isPrivate?: boolean;
    @ApiPropertyOptional()
    @IsOptional()
    @IsEntityId()
    parentId?: ID;
}

export class MutationUpdateCollectionArgs {
    @ApiProperty()
    @IsObject()
    @ValidateNested()
    @Type(() => UpdateCollectionInput)
    input: UpdateCollectionInput;
}

export class MoveCollectionInput {
    @IsEntityId()
    collectionId: ID;
    @IsNumber()
    index: number;
    @IsEntityId()
    parentId: ID;
}

export class MutationMoveCollectionArgs {
    @ApiProperty()
    @IsObject()
    @ValidateNested()
    @Type(() => MoveCollectionInput)
    input: MoveCollectionInput;
}

export class Success {
    @ApiProperty()
    @IsBoolean()
    success: boolean;
}

export class GetCurrentUserQuery {
    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => CurrentUser)
    me?: CurrentUser | null;
}

export class AttemptLoginMutation {
    @ApiProperty()
    @IsObject()
    @ValidateNested()
    @Type(() => CurrentUser)
    login: CurrentUser;
}

export class LogOutMutation {
    @ApiProperty()
    @IsObject()
    @ValidateNested()
    @Type(() => Success)
    logout: Success;
}

export class Coordinate {
    x: number;
    y: number;
}

export class AssetFragment {
    id: string;
    createdAt: any;
    updatedAt: any;
    name: string;
    fileSize: number;
    mimeType: string;
    type: AssetType;
    preview: string;
    source: string;
    width: number;
    height: number;
    focalPoint?: Coordinate | null;
}

export class GetActiveAdministratorQuery {
    activeAdministrator: {
        id: string;
        emailAddress: string;
        firstName: string;
        lastName: string;
        createdAt: any;
        updatedAt: any;
        user: {
            id: string;
            identifier: string;
            lastLogin?: any | null;
            roles: Array<{
                id: string;
                createdAt: any;
                updatedAt: any;
                code: string;
                description: string;
                permissions: Array<Permission>;
            }>;
        };
    } | null;
}

export class CreateAdministratorMutation {
    createAdministrator: {
        id: string;
        createdAt: any;
        updatedAt: any;
        firstName: string;
        lastName: string;
        emailAddress: string;
        user: {
            id: string;
            identifier: string;
            lastLogin?: any | null;
            roles: Array<{
                id: string;
                createdAt: any;
                updatedAt: any;
                code: string;
                description: string;
                permissions: Array<Permission>;
            }>;
        };
    };
}

export class UpdateAdministratorMutation {
    updateAdministrator: {
        id: string;
        createdAt: any;
        updatedAt: any;
        firstName: string;
        lastName: string;
        emailAddress: string;
        user: {
            id: string;
            identifier: string;
            lastLogin?: any | null;
            roles: Array<{
                id: string;
                createdAt: any;
                updatedAt: any;
                code: string;
                description: string;
                permissions: Array<Permission>;
            }>;
        };
    };
}

export class UpdateActiveAdministratorMutation {
    updateActiveAdministrator: {
        id: string;
        createdAt: any;
        updatedAt: any;
        firstName: string;
        lastName: string;
        emailAddress: string;
        user: {
            id: string;
            identifier: string;
            lastLogin?: any | null;
            roles: Array<{
                id: string;
                createdAt: any;
                updatedAt: any;
                code: string;
                description: string;
                permissions: Array<Permission>;
            }>;
        };
    } | null;
}

export class DeleteAdministratorMutation {
    deleteAdministrator: {
        result: DeletionResult;
        message?: string | null;
    };
}

export class DeleteAdministratorsMutation {
    deleteAdministrators: Array<{
        result: DeletionResult;
        message?: string | null;
    }>;
}

export class QueryRoleArgs {
    id: ID;
}

export class MutationCreateRoleArgs {
    input: CreateRoleInput;
}

export class MutationUpdateRoleArgs {
    input: UpdateRoleInput;
}

export class MutationDeleteRoleArgs {
    id: ID;
}

export class MutationDeleteRolesArgs {
    ids: Array<ID>;
}

export class GetRolesQuery {
    roles: {
        totalItems: number;
        items: Array<{
            id: string;
            createdAt: any;
            updatedAt: any;
            code: string;
            description: string;
            permissions: Array<Permission>;
        }>;
    };
}

export class CreateRoleMutation {
    createRole: {
        id: string;
        createdAt: any;
        updatedAt: any;
        code: string;
        description: string;
        permissions: Array<Permission>;
    };
}

export class UpdateRoleMutation {
    updateRole: {
        id: string;
        createdAt: any;
        updatedAt: any;
        code: string;
        description: string;
        permissions: Array<Permission>;
    };
}

export class DeleteRoleMutation {
    deleteRole: {
        result: DeletionResult;
        message?: string | null;
    };
}

export class DeleteRolesMutation {
    deleteRoles: Array<{
        result: DeletionResult;
        message?: string | null;
    }>;
}

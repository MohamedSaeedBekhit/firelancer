import { Administrator } from './administrator/administrator.entity';
import { Asset } from './asset/asset.entity';
import { OrderableAsset } from './asset/orderable-asset.entity';
import { AuthenticationMethod } from './authentication-method/authentication-method.entity';
import { ExternalAuthenticationMethod } from './authentication-method/external-authentication-method.entity';
import { NativeAuthenticationMethod } from './authentication-method/native-authentication-method.entity';
import { BalanceEntry } from './balance-entry/balance-entry.entity';
import { CollectionAsset } from './collection/collection-asset.entity';
import { CollectionTranslation } from './collection/collection-translation.entity';
import { Collection } from './collection/collection.entity';
import { Customer } from './customer/customer.entity';
import { FacetValueTranslation } from './facet-value/facet-value-translation.entity';
import { FacetValue } from './facet-value/facet-value.entity';
import { FacetTranslation } from './facet/facet-translation.entity';
import { Facet } from './facet/facet.entity';
import { CustomerHistoryEntry } from './history-entry/customer-history-entry.entity';
import { HistoryEntry } from './history-entry/history-entry.entity';
import { JobPostAsset } from './job-post/job-post-asset.entity';
import { JobPost } from './job-post/job-post.entity';
import { Role } from './role/role.entity';
import { AnonymousSession } from './session/anonymous-session.entity';
import { AuthenticatedSession } from './session/authenticated-session.entity';
import { Session } from './session/session.entity';
import { User } from './user/user.entity';

/**
 * A map of all the core database entities.
 */
export const coreEntitiesMap = {
    Administrator,
    Asset,
    AuthenticatedSession,
    AuthenticationMethod,
    AnonymousSession,
    BalanceEntry,
    Collection,
    CollectionAsset,
    CollectionTranslation,
    Customer,
    CustomerHistoryEntry,
    Session,
    Facet,
    FacetTranslation,
    FacetValue,
    FacetValueTranslation,
    JobPost,
    JobPostAsset,
    ExternalAuthenticationMethod,
    NativeAuthenticationMethod,
    OrderableAsset,
    User,
    Role,
    HistoryEntry,
};

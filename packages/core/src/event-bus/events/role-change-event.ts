import { ID } from '../../common/shared-schema';
import { RequestContext } from '../../common/request-context';
import { Administrator } from '../../entity/administrator/administrator.entity';
import { FirelancerEvent } from '../firelancer-event';

/**
 * @description
 * This event is fired whenever one Role is assigned or removed from a user.
 * The property `roleIds` only contains the removed or assigned role ids.
 */
export class RoleChangeEvent extends FirelancerEvent {
    constructor(
        public ctx: RequestContext,
        public admin: Administrator,
        public roleIds: ID[],
        public type: 'assigned' | 'removed',
    ) {
        super();
    }
}

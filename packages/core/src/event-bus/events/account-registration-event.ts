import { RequestContext } from '../../common/request-context';
import { User } from '../../entity/user/user.entity';
import { FirelancerEvent } from '../firelancer-event';

/**
 * @description
 * This event is fired when a new user registers an account, either as a stand-alone signup or after
 * placing an order.
 */
export class AccountRegistrationEvent extends FirelancerEvent {
    constructor(
        public ctx: RequestContext,
        public user: User,
    ) {
        super();
    }
}

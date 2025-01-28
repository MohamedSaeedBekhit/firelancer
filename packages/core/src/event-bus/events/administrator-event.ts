import { RequestContext } from '../../common/request-context';
import { CreateAdministratorInput, ID, UpdateAdministratorInput } from '../../common/shared-schema';
import { Administrator } from '../../entity/administrator/administrator.entity';
import { FirelancerEntityEvent } from '../firelancer-entity-event';

type AdministratorInputTypes = CreateAdministratorInput | UpdateAdministratorInput | ID;

/**
 * @description
 * This event is fired whenever a Administrator is added, updated or deleted.
 */
export class AdministratorEvent extends FirelancerEntityEvent<Administrator, AdministratorInputTypes> {
    constructor(
        ctx: RequestContext,
        entity: Administrator,
        type: 'created' | 'updated' | 'deleted',
        input?: AdministratorInputTypes,
    ) {
        super(entity, type, ctx, input);
    }
}

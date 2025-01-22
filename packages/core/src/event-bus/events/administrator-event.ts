import { ID } from '@firelancer/common';
import { CreateAdministratorInput, UpdateAdministratorInput } from '../../api/schema';
import { RequestContext } from '../../common/request-context';
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

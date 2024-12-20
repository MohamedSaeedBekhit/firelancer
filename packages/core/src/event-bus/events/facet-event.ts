import { CreateFacetInput, UpdateFacetInput } from '../../api';
import { ID, RequestContext } from '../../common';
import { Facet } from '../../entity/facet/facet.entity';
import { FirelancerEntityEvent } from '../firelancer-entity-event';

type FacetInputTypes = CreateFacetInput | UpdateFacetInput | ID;

/**
 * @description
 * This event is fired whenever a Facet is added, updated or deleted.
 */
export class FacetEvent extends FirelancerEntityEvent<Facet, FacetInputTypes> {
    constructor(ctx: RequestContext, entity: Facet, type: 'created' | 'updated' | 'deleted', input?: FacetInputTypes) {
        super(entity, type, ctx, input);
    }
}

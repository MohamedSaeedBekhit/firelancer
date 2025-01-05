import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { CalculatedColumnDefinition, CALCULATED_PROPERTIES } from '../common/calculated-decorator';

interface EntityPrototype {
    [CALCULATED_PROPERTIES]: CalculatedColumnDefinition[];
}

/**
 * Subscribes to events entities to handle calculated decorators
 */
@EventSubscriber()
export class CalculatedPropertySubscriber implements EntitySubscriberInterface {
    afterLoad(event: unknown) {
        this.moveCalculatedGettersToInstance(event);
    }

    afterInsert(event: InsertEvent<unknown>): Promise<unknown> | void {
        this.moveCalculatedGettersToInstance(event.entity);
    }

    /**
     * For any entity properties decorated with @Calculated(), this subscriber transfers
     * the getter from the entity prototype to the entity instance, so that it can be
     * correctly enumerated and serialized in the API response.
     */
    private moveCalculatedGettersToInstance(entity: unknown) {
        if (entity) {
            const prototype: EntityPrototype = Object.getPrototypeOf(entity);
            if (Object.prototype.hasOwnProperty.call(prototype, CALCULATED_PROPERTIES)) {
                for (const calculatedPropertyDef of prototype[CALCULATED_PROPERTIES]) {
                    const getterDescriptor = Object.getOwnPropertyDescriptor(prototype, calculatedPropertyDef.name);
                    const getFn = getterDescriptor && getterDescriptor.get;
                    if (getFn && !Object.prototype.hasOwnProperty.call(entity, calculatedPropertyDef.name)) {
                        const boundGetFn = getFn.bind(entity);
                        Object.defineProperties(entity, {
                            [calculatedPropertyDef.name]: {
                                get: () => boundGetFn(),
                                enumerable: true,
                            },
                        });
                    }
                }
            }
        }
    }
}

/**
 * A map of the core TypeORM Subscribers.
 */
export const coreSubscribersMap = {
    CalculatedPropertySubscriber,
};

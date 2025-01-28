import { CreateDateColumn, DeepPartial, UpdateDateColumn } from 'typeorm';
import { ID } from '../../common/shared-schema';
import { PrimaryGeneratedId } from '../entity-id.decorator';

/**
 * @description
 * This is the base class from which all entities inherit. The type of
 * the `id` property is defined by the EntityIdStrategy.
 */
export abstract class FirelancerEntity {
    protected constructor(input?: DeepPartial<FirelancerEntity>) {
        if (input) {
            for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(input))) {
                if (descriptor.get && !descriptor.set) {
                    // A getter has been moved to the entity instance
                    // by the CalculatedPropertySubscriber
                    // and cannot be copied over to the new instance.
                    continue;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (this as any)[key] = descriptor.value;
            }
        }
    }

    @PrimaryGeneratedId()
    id: ID;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

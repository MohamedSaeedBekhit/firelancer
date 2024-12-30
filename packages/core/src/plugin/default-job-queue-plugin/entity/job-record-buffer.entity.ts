import { DeepPartial } from '@firelancer/common';
import { Column, Entity } from 'typeorm';
import { FirelancerEntity } from '../../../entity/base/base.entity';
import { JobConfig } from '../../../job-queue/types';

@Entity()
export class JobRecordBuffer extends FirelancerEntity {
    constructor(input: DeepPartial<JobRecordBuffer>) {
        super(input);
    }

    @Column()
    bufferId: string;

    @Column('simple-json')
    job: JobConfig<any>;
}

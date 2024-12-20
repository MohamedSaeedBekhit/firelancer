import { Column, Entity } from 'typeorm';
import { FirelancerEntity } from '../../../entity/base/base.entity';
import { DeepPartial, JobState } from '../../../common';

@Entity()
export class JobRecord extends FirelancerEntity {
  constructor(input: DeepPartial<JobRecord>) {
    super(input);
  }

  @Column()
  queueName: string;

  @Column('simple-json', { nullable: true })
  data: any;

  @Column('varchar')
  state: JobState;

  @Column()
  progress: number;

  @Column('simple-json', { nullable: true })
  result: any;

  @Column({ nullable: true })
  error: string;

  @Column({ nullable: true, precision: 6 })
  startedAt?: Date;

  @Column({ nullable: true, precision: 6 })
  settledAt?: Date;

  @Column()
  isSettled: boolean;

  @Column()
  retries: number;

  @Column()
  attempts: number;
}

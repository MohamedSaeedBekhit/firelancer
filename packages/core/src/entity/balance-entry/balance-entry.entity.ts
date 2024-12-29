import date from 'date-fns';
import { Check, Column, DeepPartial, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BalanceEntryStatus, BalanceEntryType, CurrencyCode, ID } from '../../common';
import { FirelancerEntity } from '../base/base.entity';
import { Customer } from '../customer/customer.entity';
import { EntityId } from '../entity-id.decorator';
import { Money } from '../money.decorator';

/**
 * @description
 * BalanceEntry
 */
@Entity()
@Check('"balance" = COALESCE("prevBalance", 0) + "credit" - "debit"')
@Check('"prevSettledAt" < "settledAt"')
@Check('("prevSettledAt" IS NULL AND "prevBalance" IS NULL) OR ("prevSettledAt" IS NOT NULL AND "prevBalance" IS NOT NULL)')
export class BalanceEntry extends FirelancerEntity {
    constructor(input?: DeepPartial<BalanceEntry>) {
        super(input);
    }

    @Column()
    type: BalanceEntryType;

    @Column({ type: 'varchar', nullable: true })
    description: string | null;

    @EntityId()
    customerId: ID;

    @ManyToOne(() => Customer)
    customer: Customer;

    @Column('varchar')
    currencyCode: CurrencyCode;

    @Money({ nullable: true })
    balance: number | null;

    @Money({ default: 0 })
    credit: number;

    @Money({ default: 0 })
    debit: number;

    @Column({ default: 0 })
    reviewDays: number;

    @Column({ type: 'timestamp', nullable: true })
    settledAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    rejectedAt: Date | null;

    @Money({ nullable: true })
    prevBalance: number | null;

    @Column({ type: 'timestamp', nullable: true })
    prevSettledAt: Date | null;

    @EntityId({ nullable: true })
    parentId: ID | null;

    @ManyToOne(() => BalanceEntry, (entry) => entry.children, { nullable: true, onDelete: 'CASCADE' })
    parent: BalanceEntry | null;

    @OneToMany(() => BalanceEntry, (entry) => entry.parent)
    children: BalanceEntry[];

    @Column('simple-json', { nullable: true })
    metadata: any;

    getStatus(): BalanceEntryStatus {
        if (this.balance !== null && this.settledAt !== null) {
            return BalanceEntryStatus.SETTLED;
        }

        if (this.balance === null && this.settledAt === null) {
            return BalanceEntryStatus.PENDING;
        }

        if (this.rejectedAt !== null) {
            return BalanceEntryStatus.REJECTED;
        }

        throw Error("Cannot determine balance entry's status. please review entry fields for invalid values");
    }

    isEligibleForSettlement() {
        const reviewExpiryDate = date.addDays(this.createdAt, this.reviewDays);
        const hasReviewPeriodElapsed = this.reviewDays === 0 || date.isBefore(reviewExpiryDate, new Date());
        return this.getStatus() === BalanceEntryStatus.PENDING && hasReviewPeriodElapsed;
    }

    validate() {
        if (this.debit < 0) {
            throw new Error('entry.debit cannot be negative number');
        }

        if (this.credit < 0) {
            throw new Error('entry.credit cannot be negative number');
        }

        if (!Number.isInteger(this.debit)) {
            throw new Error('entry.debit must be integer number');
        }

        if (!Number.isInteger(this.credit)) {
            throw new Error('entry.credit must be integer number');
        }
    }
}

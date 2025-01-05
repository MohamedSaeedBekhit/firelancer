import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBalanceEntryCheckConstraint1736054603792 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "balance_entry" ADD CONSTRAINT "CHK_d0585709b1da007a151d90ad82" CHECK ("settledAt" IS NULL OR "rejectedAt" IS NULL)`,
            undefined,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "balance_entry" DROP CONSTRAINT "CHK_d0585709b1da007a151d90ad82"`, undefined);
    }
}

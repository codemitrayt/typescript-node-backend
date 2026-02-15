import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1771130174995 implements MigrationInterface {
  name = "Init1771130174995";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "createdAt"`);
  }
}

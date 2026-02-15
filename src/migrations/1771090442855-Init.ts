import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1771090442855 implements MigrationInterface {
  name = "Init1771090442855";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" uuid NOT NULL, "name" character varying NOT NULL, "websiteUrl" character varying NOT NULL, "email" character varying NOT NULL, "domain" character varying NOT NULL, CONSTRAINT "UQ_32731f181236a46182a38c992a8" UNIQUE ("name"), CONSTRAINT "UQ_d8713d43c2923b346711ac8b579" UNIQUE ("websiteUrl"), CONSTRAINT "UQ_155c343439adc83ada6ee3f48be" UNIQUE ("email"), CONSTRAINT "UQ_da4054294eaae43ec7f85b6a3a1" UNIQUE ("domain"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "tenantId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD CONSTRAINT "FK_31a42d30fbcbfc3e6d76c030ab3" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_c58f7e88c286e5e3478960a998b" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenants" DROP CONSTRAINT "FK_31a42d30fbcbfc3e6d76c030ab3"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tenantId"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
  }
}

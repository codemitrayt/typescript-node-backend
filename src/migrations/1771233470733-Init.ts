import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1771233470733 implements MigrationInterface {
  name = "Init1771233470733";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "conversations_assignees_users" ("conversationsId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_742235b70419805a7c0e2ac38c8" PRIMARY KEY ("conversationsId", "usersId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3e92f41bab10082ec6862b1eff" ON "conversations_assignees_users" ("conversationsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_425126915e63c95126ec5fe3f1" ON "conversations_assignees_users" ("usersId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations_assignees_users" ADD CONSTRAINT "FK_3e92f41bab10082ec6862b1efff" FOREIGN KEY ("conversationsId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations_assignees_users" ADD CONSTRAINT "FK_425126915e63c95126ec5fe3f1d" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversations_assignees_users" DROP CONSTRAINT "FK_425126915e63c95126ec5fe3f1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations_assignees_users" DROP CONSTRAINT "FK_3e92f41bab10082ec6862b1efff"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_425126915e63c95126ec5fe3f1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3e92f41bab10082ec6862b1eff"`,
    );
    await queryRunner.query(`DROP TABLE "conversations_assignees_users"`);
  }
}

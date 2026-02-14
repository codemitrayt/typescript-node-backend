import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1771083764606 implements MigrationInterface {
  name = "Init1771083764606";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('Admin', 'User', 'Super Admin')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_logintype_enum" AS ENUM('GOOGLE', 'EMAIL_PASSWORD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "fullName" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'User', "isVerified" boolean NOT NULL DEFAULT false, "avatar" jsonb, "password" text, "loginType" "public"."users_logintype_enum", "lastActiveAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_logintype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}

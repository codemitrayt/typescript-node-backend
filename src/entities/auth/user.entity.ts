import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

import { AvailableLoginType, AvailableUserRole } from "../../constant";
import { ILoginType, UserRole } from "../../types/user.types";

@Entity("users")
@Index(["email"], { unique: true })
export class User {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  @Column({ unique: true })
  declare email: string;

  @Column()
  declare fullName: string;

  @Column({ type: "enum", enum: AvailableUserRole, default: UserRole.USER })
  declare role: UserRole;

  @Column({ default: false })
  declare isVerified: boolean;

  @Column({ type: "jsonb", nullable: true })
  declare avatar: Record<string, string>;

  @Column({ type: "text", nullable: true })
  declare password: string;

  @Column({
    type: "enum",
    enum: AvailableLoginType,
    nullable: true,
  })
  declare loginType: ILoginType;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  declare lastActiveAt: Date;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;
}

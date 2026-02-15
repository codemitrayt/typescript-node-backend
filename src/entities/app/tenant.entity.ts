import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../entities";

@Entity("tenants")
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  @Column({ type: "uuid" })
  declare createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdBy" })
  declare creator: User;

  @Column({ unique: true })
  declare name: string;

  @Column({ unique: true })
  declare websiteUrl: string;

  @Column({ unique: true })
  declare email: string;

  @Column({ unique: true })
  declare domain: string;

  @OneToMany(() => User, (user) => user.tenant)
  declare users: User[];

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;
}

import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  PrimaryGeneratedColumn,
  Index,
  JoinTable,
} from "typeorm";
import { Message, User } from "../../entities";

@Entity("conversations")
@Index("IDX_CONV_USER_LAST_MSG", ["createdBy", "lastMessageAt"])
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  @Column({ type: "uuid" })
  declare createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdBy" })
  declare creator: User;

  @Column({ default: "New Chat" })
  declare title: string;

  @Column({ default: "gpt-4o" })
  declare model: string;

  @Column({ type: "text", nullable: true })
  declare systemPrompt: string;

  @Column({ type: "text", nullable: true })
  declare taskType: string;

  @Column({ default: false })
  declare isDeleted: boolean;

  @Column({ default: false })
  declare isPinned: boolean;

  @Column({ type: "timestamp", nullable: true })
  declare lastMessageAt: Date;

  @OneToMany(() => Message, (message) => message.conversation)
  @JoinTable()
  declare messages: Message[];

  @ManyToMany(() => User, (user) => user.assignee)
  @JoinTable()
  declare assignees: User[];

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;
}

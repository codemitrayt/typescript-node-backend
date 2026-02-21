import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { Conversation } from "./conversation.entity";
import { MessageRole, MessageStatus } from "../../types/message.types";

@Entity("messages")
@Index("IDX_MEG_CONV_CREATED_AT", ["conversationId", "createdAt"])
export class Message {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  @Column({ type: "uuid" })
  declare conversationId: string;

  @ManyToOne(() => Conversation, (conv) => conv.messages)
  @JoinColumn({ name: "conversationId" })
  declare conversation: Conversation;

  @Column({ type: "enum", enum: MessageRole })
  declare role: MessageRole;

  @Column({ type: "text" })
  declare content: string;

  @Column({ type: "uuid", nullable: true })
  declare parentMessageId: string;

  @Column({ type: "int", default: 0 })
  declare tokenCount: number;

  @Column({ type: "int", default: 0 })
  declare cost: number;

  @Column({ type: "text", nullable: true })
  declare model: string;

  @Column("text", { array: true, default: [] })
  declare generatedIds: string[];

  @Column({
    type: "enum",
    enum: MessageStatus,
    default: MessageStatus.PENDING,
  })
  declare status: MessageStatus;

  @Column({ type: "jsonb", nullable: true })
  declare metadata: Record<string, unknown>;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;
}

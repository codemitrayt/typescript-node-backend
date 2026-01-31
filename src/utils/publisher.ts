// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import amqp from "amqplib";
import type { Connection, Channel } from "amqplib";

import { logger } from "../logger";
import { ENV } from "../config";

const RABBITMQ_CONFIG = {
  protocol: "amqps",
  hostname: ENV.RABBITMQ_HOST,
  port: ENV.RABBITMQ_PORT,
  username: ENV.RABBITMQ_USERNAME,
  password: ENV.RABBITMQ_PASSWORD,
  vhost: ENV.RABBITMQ_VHOST,
};

const EXCHANGE = ENV.RABBITMQ_EXCHANGE;
const ROUTING_KEY = ENV.RABBITMQ_MAIN_QUEUE;

interface PublishMessage {
  task_id: string;
  invoice: string[];
  awb: string[];
  pl: string[];
}

export async function publishMessage(payload: PublishMessage): Promise<void> {
  let connection!: Connection;
  let channel!: Channel;

  try {
    connection = await amqp.connect(RABBITMQ_CONFIG);
    channel = await connection.createChannel();

    channel.publish(
      EXCHANGE,
      ROUTING_KEY,
      Buffer.from(JSON.stringify(payload)),
      {
        contentType: "application/json",
        persistent: true,
      },
    );

    logger.info("✅ Message published successfully");
  } catch (err) {
    logger.error("❌ Publish failed:", err);
  } finally {
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
}

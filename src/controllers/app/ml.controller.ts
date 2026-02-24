import { Logger } from "winston";
import type { Response as ExpressResponse } from "express";
import fetch, { HeadersInit } from "node-fetch";
import { Readable } from "stream";

import { ENV } from "../../config";
import { ApiError } from "../../utils";
import { IUser } from "../../types/user.types";
import { CustomRequest } from "../../types/shared.types";

export class MLController {
  constructor(private readonly logger: Logger) {}

  public async getChatResponse(
    req: CustomRequest,
    res: ExpressResponse,
  ): Promise<void> {
    const { _id: userId, email } = req.user as IUser;
    const requestPayload = req.body;

    this.logger.info({
      msg: "ML_AI_RESPONSE",
      body: JSON.stringify(requestPayload),
      data: { userId, email },
    });

    const controller = new AbortController();

    try {
      /**
       * ==========================
       * SSE HEADERS
       * ==========================
       */
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
      res.setHeader(
        "Access-Control-Expose-Headers",
        "Stream-Id, Content-Type, X-Stream-Id",
      );

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      res.flushHeaders?.();

      /**
       * Abort if client disconnects
       */
      req.on("close", () => {
        controller.abort();
        this.logger.info({
          msg: "CLIENT_DISCONNECTED_ABORTING_STREAM",
          userId,
        });
      });

      /**
       * ==========================
       * CALL ML BACKEND
       * ==========================
       */
      const url = `${ENV.BACKEND_ML_URL}/get-chat-response`;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ApiError(
          response.status,
          `External API error: ${response.statusText}`,
        );
      }

      if (!response.body) {
        throw new ApiError(400, "No response body received from external API");
      }

      /**
       * Forward Stream ID if exists
       */
      const streamId = response.headers.get("Stream-Id");
      if (streamId) {
        res.setHeader("Stream-Id", streamId);
      }

      /**
       * ==========================
       * STREAM HANDLING (Node Stream)
       * ==========================
       */
      const stream = response.body as unknown as Readable;
      const decoder = new TextDecoder();
      let buffer = "";

      for await (const chunk of stream) {
        const text = decoder.decode(chunk as Buffer, { stream: true });
        buffer += text;

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const canContinue = res.write(`data: ${trimmed}\n\n`);

          /**
           * Handle backpressure
           */
          if (!canContinue) {
            this.logger.warn({
              msg: "BACKPRESSURE_DETECTED",
              userId,
            });
            await new Promise<void>((resolve) => res.once("drain", resolve));
          }
        }
      }

      /**
       * Flush remaining buffer
       */
      if (buffer.trim()) {
        res.write(`data: ${buffer}\n\n`);
      }
    } catch (error: any) {
      this.logger.error({
        msg: "CHAT_RESPONSE_ERROR",
        error: error?.message || error,
      });

      if (!res.headersSent) {
        res.setHeader("Content-Type", "text/event-stream");
      }

      res.write(
        `data: ${JSON.stringify({
          role: "assistant",
          content: error?.message || "Streaming failed",
        })}\n\n`,
      );
    } finally {
      res.end();
    }
  }
}

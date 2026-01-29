import { Queue } from "bullmq";
import { redis } from "../redis";

export const reminderQueue = new Queue("reminder", {
    connection: redis,
});
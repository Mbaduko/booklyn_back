import { Worker } from "bullmq";
import Config from "./src/config/index";
import { processReminder } from "./src/reminder/index.reminder";
import { redis } from "./src/lib/redis";

export const reminderWorker = new Worker(
  "reminder-queue",
  processReminder,
  {
    connection: redis
  }
);

reminderWorker.on("ready", () => {
  console.log("🟢 Reminder worker ready");
});

reminderWorker.on("completed", job => {
  console.log(`✅ Job ${job.id} completed`);
});

reminderWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed`, err);
});

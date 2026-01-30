import { Queue } from "bullmq";
import Config from "@/config";

export const reminderQueue = new Queue("reminder", {
    connection: {
        url: Config.env.redisUrl,
        tls: {}
    }
});
import { Job } from "bullmq";
import ReminderHandler from "./reminder.handler";

export async function processReminder(job: Job) {
  console.log("Processing job:", job.name, job.data);

  switch (job.name) {
    case "due-reminder":
      break;
    
    case "pickup-reminder":
      return await ReminderHandler.pickupReminderHandler(job);
    
    case "pickup-expiry":
      return await ReminderHandler.pickupExpiryHandler(job);

    default:
      console.warn("⚠️ Unknown job:", job.name);
  }
}

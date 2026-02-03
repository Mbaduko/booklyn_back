import { Job } from "bullmq";
import ReminderHandler from "./reminder.handler";

export async function processReminder(job: Job) {
  console.log("Processing job:", job.name, job.data);

  switch (job.name) {
    case "pickup-reminder":
      return await ReminderHandler.pickupReminderHandler(job);
    
    case "pickup-expiry":
      return await ReminderHandler.pickupExpiryHandler(job);
    
    case "due-reminder":
      return await ReminderHandler.dueReminderHandler(job);
    
    case "overdue-setter":
      console.log("Processing overdue setter job:", job.data);
      return await ReminderHandler.overdueSetterHandler(job);

    default:
      console.warn("⚠️ Unknown job:", job.name);
  }
}

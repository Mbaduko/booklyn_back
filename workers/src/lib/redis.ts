import IORedis from "ioredis";
import Config from "../config";

export const redis = new IORedis(Config.env.redisUrl, {
  family: 4,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {},
});

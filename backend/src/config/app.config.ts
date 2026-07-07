import { getEnv } from "../utils/get-env";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("X_ZOHO_CATALYST_LISTEN_PORT", getEnv("PORT", "8009")),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  MONGO_URI: getEnv("MONGO_URI", "mongodb+srv://abineshk436_db_user:vKyobH7qobTPlVXc@cluster0.nxko1km.mongodb.net/?appName=Cluster0"),

  SESSION_SECRET: getEnv("SESSION_SECRET"),
  SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN"),

  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL"),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "https://officehubtech.onslate.com"),
  FRONTEND_GOOGLE_CALLBACK_URL: getEnv("FRONTEND_GOOGLE_CALLBACK_URL", "https://officehubtech.onslate.com/google/callback"),
});

export const config = appConfig();

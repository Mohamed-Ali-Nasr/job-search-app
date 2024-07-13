import { cleanEnv } from "envalid";
import { port, str } from "envalid/dist/validators";

export default cleanEnv(process.env, {
  PORT: port(),

  MONGODB_URI: str(),

  MAIL_HOST: str(),
  MAIL_PORT: port(),
  MAIL_USERNAME: str(),
  MAIL_PASSWORD: str(),

  JWT_SIGNIN: str(),
  JWT_VERIFIED_EMAIL: str(),
  JWT_RESET_PASSWORD: str(),
});

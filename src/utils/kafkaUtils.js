import { createTopics } from "../config/kafka.config";

export const sendRegistrationOTP = async (
  userId,
  username,
  emailId,
  role,
  otp
) => {
  await createTopics();

  await sendMessage("registration-otp", {
    userId: userId,
    username: username,
    role: role,
    emailId: emailId,
    otp: otp,
  });
};

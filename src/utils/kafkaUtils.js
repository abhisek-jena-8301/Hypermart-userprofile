/*  
    Kafka utils package 
    All functions and services related to kafka present here 
    testMessage() function to test Kafka process for all the available topics 
*/

import { createTopics } from "../config/kafka.config.js";
import logger from "../config/logger.config.js";
import { sendMessage } from "../config/kafka.config.js";

//send Message for registration-otp
export const sendRegistrationOTP = async (
  userId,
  username,
  emailId,
  role,
  otp
) => {
  await createTopics();
  logger.info("Topics are present");
  await sendMessage("registration-otp", {
    userId: userId,
    username: username,
    role: role,
    emailId: emailId,
    otp: otp,
  });
  logger.info("Message sent at sendRegistrationOTP");
};

//test function for kafka
export const testMessage = async (req, res) => {
  try {
    logger.info("Testing kafka setup | req : " + JSON.stringify(req.body));
    const topic = req.body.topic;
    if (topic === "registration-otp") {
      const { userId, username, emailId, role, otp } = req.body;
      if (!userId || !username || !emailId || !role || !otp) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      await sendRegistrationOTP(userId, username, emailId, role, otp);
      logger.info("Testing complete");
      return res.status(200).json({ message: "OTP sent to Kafka topic" });
    } else {
      return res.status(400).json({ error: "Invalid topic name" });
    }
  } catch (err) {
    logger.error("Kafka test error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

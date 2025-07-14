import prisma from "../config/db.config.js";

export const createOtpRecord = async (userId, otp, emailId, type) => {
  await prisma.otp_record.create({
    data: {
      userId: userId,
      otp: otp,
      type: type,
      emailId: emailId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry time for otp
    },
  });
};

export const updateRetryCount = async (userId, newRetries) => {
  await prisma.otp_record.update({
    where: { userId: userId },
    data: {
      lastAttempt: new Date(),
      retries: newRetries,
    },
  });
};

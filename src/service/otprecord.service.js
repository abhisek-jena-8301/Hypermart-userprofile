import prisma from "../config/db.config.js";

export const createOtpRecord = async (userId, otp) => {
  await prisma.otp_record.create({
    data: {
      userId: userId,
      otp: otp,
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

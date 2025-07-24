import logger from "../config/logger.config.js";
import bcrypt from "bcrypt";
import prisma from "../config/db.config.js";
import { Prisma } from "@prisma/client";
import {
  createOTP,
  createUserId,
  validateEmail,
  validateMobileNo,
  validateOtp,
  validatePassword,
} from "../utils/commonUtils.js";
import {
  validateDeleteRequest,
  validateAdminRequests,
} from "../utils/commonUtils.js";
import {
  DEFAULT_PASSWORD,
  ERROR_MESSAGES,
  REGISTRATION_MAIL_VERIFY,
} from "../constants.js";
import { sendRegistrationOTP } from "../utils/kafkaUtils.js";
import { createOtpRecord } from "./otprecord.service.js";

export const statusCheckApi = (req, res) => {
  console.log("Working");
  logger.info("testApi");
  res.status(200).send({ message: "user Profile service is working fine" });
};

export const registerUser = async (req, res) => {
  try {
    console.log("req.body: ", req.body);
    const {
      username,
      password,
      mobileNo,
      firstName,
      lastName,
      address,
      emailId,
      role,
    } = req.body;

    //validating request payload
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username and password" });
    }

    if (!firstName || !mobileNo || !emailId || !role) {
      return res
        .status(400)
        .json({ message: "Mandatory details missing. Please try again" });
    }

    //validating mobileNo
    if (validateMobileNo(mobileNo) !== true) {
      return res.status(400).json({ message: "Invalid Mobile number" });
    }

    //validating password
    if (validatePassword(password) !== true) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.PASSWORD_CRITERIA_NOT_MET });
    }

    //validating Emailid
    if (validateEmail(emailId) !== true) {
      return res.status(400).json({ message: "Invalid email id" });
    }

    logger.info("User Details validated " + username);

    //creating new userId
    const userId = createUserId(role);

    //creating hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    logger.info("userId created: " + userId);

    //creating user_profile table
    await prisma.user_profile.create({
      data: {
        userId: userId,
        first_name: firstName,
        last_name: lastName,
        contact: mobileNo,
        emailId: emailId,
        address: address,
        role: role,
        status: "U", //Unverified user
      },
    });

    logger.info("user_profile record created: " + userId);

    //creating user_profile record
    await prisma.user_auth.create({
      data: {
        userId: userId,
        username: username,
        password: hashedPassword,
        isMFAActive: false,
        role: role,
      },
    });

    logger.info("user_auth record created: " + userId);

    //create otp for 2nd step verification
    const otp = createOTP();

    //creating messages for kafka
    await sendRegistrationOTP(userId, username, emailId, role, otp);
    logger.info("sent message through kafka");

    //create otp record
    await createOtpRecord(userId, otp, emailId, REGISTRATION_MAIL_VERIFY);
    logger.info("otp_record created");

    res.status(201).json({
      message: "User registered successfully",
      userId: userId,
      userName: username,
    });
  } catch (error) {
    logger.error("Error at registerUser: " + error);
    return res
      .status(500)
      .json({ message: "Error at register user", error: error });
  }
};

export const verifyOtpForRegistration = async (req, res) => {
  const userId = req.body.userId;
  logger.info("Verify for userId : " + userId);
  const otp_record = await prisma.otp_record.findFirst({
    where: { userId: userId, type: REGISTRATION_MAIL_VERIFY },
    orderBy: {
      createdAt: "desc",
    },
  });

  //null check for otp record
  if (!otp_record) {
    return res.status(404).json({ message: "No OTP record found for user" });
  }

  const validatedOtp = await validateOtp(otp_record, req.body.otp);
  if (!validatedOtp.otpcheck) {
    //otp not matched
    res.status(400).json({ message: validatedOtp.message });
  } else {
    //otp matched
    await prisma.user_profile.update({
      where: { userId },
      data: { status: "A" },
    });
    logger.info("Activated the user : " + userId);
    res
      .status(200)
      .json({ message: "Successful verification of email", userId: userId });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: "Inavlid request" });
    } else {
      console.log("userId: ", userId);

      if (validateDeleteRequest(req.user.userId, userId)) {
        await deleteUserRecords(userId);

        return res.status(200).json({
          message: "user record deleted successfully",
          userId: userId,
        });
      }
      return res
        .status(401)
        .send({ message: "Insufficient privilege to delete user" });
    }
  } catch (error) {
    logger.error("Error at deleteUser: " + error);
    return res
      .status(500)
      .json({ loggedIn: false, message: "Not able to delete user" });
  }
};

export const deleteUserRecords = async (userId) => {
  //deleting record
  try {
    await prisma.$transaction([
      prisma.user_auth.delete({ where: { userId } }),
      prisma.user_profile.delete({ where: { userId } }),
      prisma.employee_sal_details.deleteMany({ where: { emp_id: userId } }),
    ]);

    logger.info(`All user records deleted for userId: ${userId}`);
  } catch (error) {
    logger.error(
      `Error deleting user records for userId ${userId}: ${error.message}`
    );
    throw new Error("Failed to delete user records.");
  }
};

export const fetchUserRole = async (req, res) => {
  logger.info("Here at fetchUserRole ");
  try {
    logger.info("req.user : " + req.user);
    if (!req.user) {
      return res.status(400).json({ message: "Invalid request" });
    } else {
      const username = req.user.username;
      console.log("username: ", username);
      const userRole = await prisma.user_auth.findUnique({
        where: { username: username },
        select: {
          role: true,
        },
      });
      console.log("userRole: ", userRole);
      logger.info("Fetched userRole for user: " + username);
      return res
        .status(200)
        .send({ message: "userRole fetched succesfully", role: userRole });
    }
  } catch (error) {
    logger.error("Error at fetch user role : " + error);
    return res.status(401).send({ message: "not able to fetch userRole" });
  }
};

export const fetchUserDetails = async (req, res) => {
  console.log("inside fetchuserDetails");
  try {
    if (!req.user) {
      return res.status(400).json({ message: "Invalid request" });
    }
    console.log("req.user : " + JSON.stringify(req.user));
    const userId = req.user.userId;
    console.log(userId);
    const user = await prisma.user_profile.findUnique({
      where: { userId: userId },
    });
    return res
      .status(200)
      .json({ message: "User details fetched succesfully", user: user });
  } catch (error) {
    console.log("Error: " + error);
    logger.error("Error at fetch user details: " + error);
    return res.status(400).json({ message: "Unable to fetch user details" });
  }
};

export const suspendUser = async (req, res) => {
  try {
    if (validateAdminRequests(req.user.userId) === false) {
      return res
        .status(401)
        .send({ message: ERROR_MESSAGES.INSUFFICIENT_PRIVILEGES });
    }
    const userId = req.body.userId;

    //delete record from user_auth table
    await prisma.user_auth.delete({
      where: { userId: userId },
    });

    //update the status in user_profile
    const updatedUser = await prisma.user_profile.update({
      where: { userId },
      data: { status: "S" },
    });

    logger.info("User suspended : " + updatedUser);
    return res.status(200).json({ message: "User suspended succesfully" });
  } catch (error) {
    let error_msg = "Error : ";
    if (error.code === "P2025") {
      error_msg += ERROR_MESSAGES.USER_DOES_NOT_EXIST;
      logger.error("At suspendUser : " + error_msg);
    } else {
      logger.error("Error at suspendUser : " + error);
      error_msg += error;
    }
    return res
      .status(500)
      .json({ message: "Error at suspendUser", error: error_msg });
  }
};

export const resumeUser = async (req, res) => {
  try {
    if (validateAdminRequests(req.user.userId) === false) {
      return res
        .status(401)
        .send({ message: ERROR_MESSAGES.INSUFFICIENT_PRIVILEGES });
    }
    console.log("req.body : ", req.body);
    const userId = req.body.userId;
    const username = req.body.username;
    if (!userId || !username) {
      return res.status(400).json({ message: ERROR_MESSAGES.INAVLID_DATA });
    }

    //updated status in user_profile
    const updatedUser = await prisma.user_profile.update({
      where: { userId },
      data: { status: "A" },
    });
    console.log("updatedUser : ", updatedUser);

    //user_auth created
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const role = updatedUser.role;
    await prisma.user_auth.create({
      data: {
        userId: userId,
        username: username,
        password: hashedPassword,
        isMFAActive: false,
        role: role,
      },
    });

    logger.info("User resumed : " + updatedUser);

    return res.status(200).json({ message: "User resumed succesfully" });
  } catch (error) {
    let error_msg = "Error : ";
    if (error.code === "P2025") {
      error_msg += ERROR_MESSAGES.USER_DOES_NOT_EXIST;
      logger.error("At resumeUser : " + error_msg);
    } else {
      logger.error("Error at resumeUser : " + error);
      error_msg += error;
    }
    return res
      .status(500)
      .json({ message: "Error at resumeUser", error: error_msg });
  }
};

export const updateUserProfile = async (req, res) => {
  console.log("Inside updateUser");
  try {
    console.log("req: " + req.body);
    const { firstName, lastName, address, mobileNo, emailId } = req.body;
    if (!firstName || !mobileNo || !emailId) {
      return res
        .status(400)
        .json({ message: "Mandatory details missing. Please try again" });
    }
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Invalid request - No userId found",
      });
    }
    await prisma.user_profile.update({
      where: { userId },
      data: {
        first_name: firstName,
        last_name: lastName,
        emailId: emailId,
        contact: mobileNo,
        address: address,
      },
    });

    return res
      .status(200)
      .json({ message: "Your profile has been updated successfully!" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      logger.warn("No record found");
      return res.status(404).json({ message: "User not found" });
    }
    logger.error("Error at updateUserProfile : " + error);
    return res.status(500).json({ message: "Error at updateUserProfile" });
  }
};

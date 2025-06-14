import logger from "../config/logger.config.js";
import bcrypt from "bcrypt";
import prisma from "../config/db.config.js";
import {
  createUserId,
  validateEmail,
  validateMobileNo,
  validatePassword,
} from "../utils/commonUtils.js";
import { validateDeleteRequest } from "../utils/commonUtils.js";

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
        .json({ message: "Password not according to guidelines" });
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

export const deleteUser = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: "Inavlid request" });
    } else {
      console.log("userId: ", userId);

      if (validateDeleteRequest(req.user.userId, userId)) {
        //deleting record
        await prisma.user_auth.delete({
          where: { userId: userId },
        });

        logger.info("user_auth record deleted");

        await prisma.user_profile.delete({
          where: { userId: userId },
        });

        logger.info("user_profile record deleted: " + userId);

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

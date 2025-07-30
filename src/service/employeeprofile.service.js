import logger from "../config/logger.config.js";
import prisma from "../config/db.config.js";
import {
  provideAccessRights,
  validateAdminRequests,
} from "../utils/commonUtils.js";
import { ERROR_MESSAGES } from "../constants.js";

export const fetchUserList = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!validateAdminRequests(userId)) {
      return res
        .status(401)
        .send({ message: ERROR_MESSAGES.INSUFFICIENT_PRIVILEGES });
    }
    //access rights check
    const roles = provideAccessRights(userId);
    console.log("req query : ", req.query);

    //Paginated request
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    //with skip and take:limit
    const [empList, totalCount] = await Promise.all([
      prisma.user_profile.findMany({
        where: { role: { in: roles } },
        skip,
        take: limit,
      }),
      prisma.user_profile.count({ where: { role: { in: roles } } }),
    ]);

    console.log("empList; ", empList);
    console.log("totalCount: ", totalCount);

    res.status(200).send({
      message: "Employee list fetched successfully",
      list: empList,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    logger.error("Error at fetchEmployeeList: " + error);
    res.status(500).json({ message: "Error at fetch Employee List" });
  }
};

export const fetchUserListByName = async (req, res) => {
  try {
    if (!req.query.name)
      return res.status(400).json({ message: ERROR_MESSAGES.INAVLID_DATA });
    const name = req.query.name;

    const userId = req.user.userId;
    if (!validateAdminRequests(userId)) {
      return res
        .status(401)
        .send({ message: ERROR_MESSAGES.INSUFFICIENT_PRIVILEGES });
    }
    //access rights check
    const roles = provideAccessRights(userId);
    const PAGE_SIZE = 20;
    const page = parseInt(req.query.page) || 1;

    //users search for a given name contains the character (case-insenstive) along with pagination
    const users = await prisma.user_profile.findMany({
      where: {
        OR: [
          { first_name: { contains: name, mode: "insensitive" } },
          { last_name: { contains: name, mode: "insensitive" } },
        ],
        role: { in: roles },
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    console.log("users: ", users);
    if (users.length === 0)
      return res.status(200).json({ message: "No user found" });
    return res
      .status(200)
      .json({ message: "Users found succesfull", users: users });
  } catch (error) {
    logger.error("Error at fetch user details: " + error);
    return res
      .status(400)
      .json({ message: "Unable to fetch user details by name" });
  }
};

export const fetchUserDetails = async (req, res) => {
  try {
    if (validateAdminRequests(req.user.userId) === false) {
      return res
        .status(401)
        .send({ message: ERROR_MESSAGES.INSUFFICIENT_PRIVILEGES });
    }
    const userId = req.params.userId;
    console.log("userId : " + userId);
    const employee = await prisma.user_profile.findUnique({
      where: {
        userId: userId,
      },
      include: {
        employeeSalary: true, // Include related employee salary details
      },
    });
    console.log("Employee : ", employee);
    res.status(200).send({
      message: "Fetched employee details succesfully",
      employee: employee,
    });
  } catch (error) {
    logger.error("Error at fetchEmployeeDetail : " + error);
    res.status(400).json({ message: "Error at fetchUserDetails" });
  }
};

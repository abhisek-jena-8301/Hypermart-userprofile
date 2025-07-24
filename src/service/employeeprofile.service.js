import logger from "../config/logger.config.js";
import prisma from "../config/db.config.js";
import {
  provideAccessRights,
  validateAdminRequests,
} from "../utils/commonUtils.js";
import { ERROR_MESSAGES } from "../constants.js";

export const fetchEmployeeList = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!validateAdminRequests(userId)) {
      return res
        .status(401)
        .send({ message: ERROR_MESSAGES.INSUFFICIENT_PRIVILEGES });
    }
    //access rights check
    const roles = provideAccessRights(userId);

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

export const fetchEmployeeDetail = async (req, res) => {
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

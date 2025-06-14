import logger from "../config/logger.config.js";
import prisma from "../config/db.config.js";
import { validateAdminRequests } from "../utils/commonUtils.js";

export const fetchEmployeeList = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("userId : ", userId);
    if (validateAdminRequests(userId) === false) {
      return res.status(401).send({ message: "Insufficient privileges" });
    }
    const empList = await prisma.user_profile.findMany({
      where: {
        role: "Employee",
      },
    });
    logger.info("fetchEmployeeList working");
    console.log("Employee List : ", empList);
    res
      .status(200)
      .send({ message: "Employee list fetched successfully", list: empList });
  } catch (error) {
    logger.error("Error at fetchEmployeeList : " + error);
    res.status(500).send({ message: "Error at fetch Emplyoee List" });
  }
};

export const fetchEmployeeDetail = async (req, res) => {
  try {
    if (validateAdminRequests(req.user.userId) === false) {
      return res.status(401).send({ message: "Insufficient privileges" });
    }
    const userId = req.params.userId;
    console.log("userId : " + userId);
    const employee = await prisma.user_profile.findUnique({
      where: {
        userId: userId,
      },
      include: {
        employee_sal_details: true, // Include related employee salary details
      },
    });
    console.log("Employee : ", employee);
    res.status(200).send({
      message: "Fetched employee details succesfully",
      employee: employee,
    });
  } catch (error) {
    logger.error("Error at fetchEmployeeDetail : " + error);
    res.status(500).send({ message: "Error at fetchUserDetails" });
  }
};

import logger from "../config/logger.config.js";
import prisma from "../config/db.config.js";
import { validateAdminRequests } from "../utils/commonUtils.js";

export const fetchEmployeeSalDetails = async (req, res) => {
  try {
    if (validateAdminRequests(req.user.userId) === false) {
      return res.status(401).send({ message: "Insufficient privileges" });
    }
    const empId = req.params.empId;
    const employeeSalDetail = await prisma.employee_sal_details.findUnique({
      where: {
        emp_id: empId,
      },
    });
    console.log("Employee Salary Detail : " + employeeSalDetail);
    if (employeeSalDetail) {
      res.status(200).json({
        message: "Fetched employee salary details",
        employeeSalDetail: employeeSalDetail,
      });
    } else {
      res.status(404).json({ message: "No record found!" });
    }
  } catch (error) {
    logger.error("Error at fetchEmployeeSalDetails : " + error);
    return res
      .status(400)
      .json({ message: "Error at fetchEmployeeDetails", error: error });
  }
};

export const addSalaryDetails = async (req, res) => {
  try {
    console.log("req.body : ", req.body);
    return res.status(200).json({ message: "Added salaryDetails" });
  } catch (error) {
    logger.error("Error at addSalaryDetails : " + error);
    res.status(400).json({ message: "Error at addSalaryDetails" });
  }
};

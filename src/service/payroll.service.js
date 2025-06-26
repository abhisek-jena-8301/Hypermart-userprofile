import logger from "../config/logger.config.js";
import prisma from "../config/db.config.js";
import {
  calculateSalary,
  validateAdminRequests,
  validatePanCardDetails,
  verifyDeptDetails,
} from "../utils/commonUtils.js";
import { BASIC_MIN_WAGE, ERROR_MESSAGES } from "../constants.js";

export const fetchEmployeeSalDetails = async (req, res) => {
  try {
    if (validateAdminRequests(req.user.userId) === false) {
      return res
        .status(401)
        .send({ message: ERROR_MESSAGES.INSUFFICIENT_PRIVILEGES });
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
    logger.debug("req.body for addSalaryDetails : " + JSON.stringify(req.body));
    //validating request
    if (validateAdminRequests(req.user.userId) === false) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.INSUFFICIENT_PRIVILEGES });
    }
    const { id, dept, panId, allowance, attendance } = req.body;

    //validating request body
    if (!panId || typeof panId !== "string" || !validatePanCardDetails(panId)) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.PAN_ERROR_MESSAGE });
    }
    if (!allowance || allowance < BASIC_MIN_WAGE) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.WRONG_ALLOWANCE_VALUE });
    }
    if (!id || !verifyEmployeeId(id) || !dept || !verifyDeptDetails(dept)) {
      return res.status(400).json({ message: ERROR_MESSAGES.INAVLID_DATA });
    }
    if (!attendance || attendance <= 0 || attendance > 30) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.INVALID_ATTENDANCE_DETAILS });
    }
    logger.info("Validated user add salary request : " + req.body);

    //adding other values
    const { salary, bonus, tax, net_payable } = calculateSalary(
      allowance,
      attendance
    );
    logger.debug("Calculated income details");

    //adding record to the table
    const result = await prisma.employee_sal_details.create({
      data: {
        emp_id: id,
        dept_id: dept,
        pan_number: panId,
        per_day_allowance: allowance,
        attendance: attendance,
        salary: salary,
        bonus: bonus,
        tax: tax,
        net_payable: net_payable,
      },
    });

    logger.info("Added record to employee_sal_detail");

    return res
      .status(200)
      .json({ message: "Added salaryDetails", record: result });
  } catch (error) {
    logger.error("Error at addSalaryDetails : " + error);
    let error_msg = "Error :  ";
    if (error.code === "P2002" && error.meta?.target?.includes("emp_id")) {
      error_msg += "emp_id already exists.";
      logger.error(error_msg);
    } else {
      error_msg += error;
    }
    res
      .status(400)
      .json({ message: "Error at addSalaryDetails", error: error_msg });
  }
};

const verifyEmployeeId = async (id) => {
  logger.debug("in verifyEmployeeId function");
  const emp = await prisma.user_profile.findUnique({
    where: {
      userId: id,
      status: "A",
    },
  });
  logger.debug("Empoyee record found " + emp.userId);
  return emp;
};

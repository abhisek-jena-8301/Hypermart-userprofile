import { Router } from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
import {
  addSalaryDetails,
  fetchEmployeeSalDetails,
} from "../service/payroll.service.js";

const router = Router();

router.get("/fetchDetails/:empId", verifyJWT, fetchEmployeeSalDetails);
router.post("/addDetails", verifyJWT, addSalaryDetails);

export default router;

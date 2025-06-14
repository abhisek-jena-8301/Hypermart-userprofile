import { Router } from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
import {
  fetchEmployeeDetail,
  fetchEmployeeList,
} from "../service/employeeprofile.service.js";

const router = Router();

router.get("/fetchList", verifyJWT, fetchEmployeeList);
router.get("/fetch/:userId", verifyJWT, fetchEmployeeDetail);

export default router;

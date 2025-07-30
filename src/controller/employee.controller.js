import { Router } from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
import {
  fetchUserDetails,
  fetchUserListByName,
  fetchUserList,
} from "../service/employeeprofile.service.js";

const router = Router();

//fetchUserList
router.get("/fetchList", verifyJWT, fetchUserList);
//fetchCompleteUserDetail
router.get("/fetch/:userId", verifyJWT, fetchUserDetails);
//fetch user details by name
router.get("/fetchUserByName", verifyJWT, fetchUserListByName);

export default router;

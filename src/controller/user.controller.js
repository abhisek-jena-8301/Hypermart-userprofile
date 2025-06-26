import { Router } from "express";
import {
  deleteUser,
  fetchUserDetails,
  fetchUserRole,
  registerUser,
  resumeUser,
  statusCheckApi,
  suspendUser,
} from "../service/userprofile.service.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

router.get("/test", statusCheckApi);

// register api
router.post("/register", registerUser);
//delete user
router.delete("/delete", deleteUser);
//fetchUserRole
router.get("/fetchUserRole", verifyJWT, fetchUserRole);
//fetchuserDetails
router.get("/fetchUserDetails", verifyJWT, fetchUserDetails);
//suspendUser
router.put("/suspendUser", verifyJWT, suspendUser);
//resumeUser
router.put("/resumeUser", verifyJWT, resumeUser);
//terminateUser

export default router;

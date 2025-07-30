import { Router } from "express";
import {
  deleteUser,
  fetchUserRole,
  registerUser,
  resumeUser,
  statusCheckApi,
  suspendUser,
  updateUserProfile,
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
//suspendUser
router.put("/suspendUser", verifyJWT, suspendUser);
//resumeUser
router.put("/resumeUser", verifyJWT, resumeUser);
//updateUserProfile
router.put("/updateUserProfile", verifyJWT, updateUserProfile);

export default router;

import { Router } from "express";
import {
  deleteUser,
  fetchUserDetails,
  fetchUserRole,
  registerUser,
  statusCheckApi,
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

export default router;

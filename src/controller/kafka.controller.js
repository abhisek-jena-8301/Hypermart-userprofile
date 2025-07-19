/* Controller/service file for testing kafka related functionalities
   Not part of the actual project functionality  */

import { Router } from "express";
import { testMessage } from "../utils/kafkaUtils.js";

const router = Router();

router.post("/sendRegistationOtp", testMessage);

export default router;
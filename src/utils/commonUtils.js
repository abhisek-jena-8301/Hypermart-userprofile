import {
  EMAIL_REGEX,
  MOBILE_NO_REGEX,
  PAN_REGEX,
  PASSWORD_REGEX,
  USER_ROLE,
} from "../constants.js";

//creating UserId
export const createUserId = (role) => {
  var rolePrefix;
  if (role === USER_ROLE.ADMIN_ROLE) {
    rolePrefix = USER_ROLE.ADMIN_PREFIX;
  } else if (role === USER_ROLE.EMPLOYEE_ROLE) {
    rolePrefix = USER_ROLE.EMPLOYEE_PREFIX;
  }
  const userId = rolePrefix + "." + Date.now().toString();
  return userId;
};

//validate MobileNo
export const validateMobileNo = (mobileNo) => {
  return MOBILE_NO_REGEX.test(mobileNo);
};

//validateEmailId
export const validateEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

//validate password
export const validatePassword = (password) => {
  return PASSWORD_REGEX.test(password);
};

export const validateDeleteRequest = (userId, userToBeDeleted) => {
  const role = userId.slice(0, 3);
  const deletedRole = userToBeDeleted.slice(0, 3);
  if (role === USER_ROLE.EMPLOYEE_PREFIX) return false;
  else if (userId === process.env.SUPERADMIN_USER) return true;
  else if (role === USER_ROLE.ADMIN_PREFIX && deletedRole === USER_ROLE.ADMIN_PREFIX) return false;
  return true;
};

export const validateAdminRequests = (userId) => {
  console.log("validateAdminRequest : " + userId);
  const role = userId.slice(0, 3);
  if (role === USER_ROLE.ADMIN_PREFIX) return true;
  return false;
};

export const validatePanCardDetails = (panId) => {
  //regex check for PAN card detail check
  return PAN_REGEX.test(panId.toUpperCase());
};

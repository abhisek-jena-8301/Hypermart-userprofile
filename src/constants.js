export const ERROR_MESSAGES = {
  INSUFFICIENT_PRIVILEGES: "The user is not authorized to perform the action.",
  PAN_ERROR_MESSAGE: "PAN details are wrong. Please update",
  WRONG_ALLOWANCE_VALUE: "Per day Allowance criteria not met.",
  INAVLID_DATA: "Invalid Data",
  INVALID_ATTENDANCE_DETAILS: "Invalid Attendance value recorded",
  USER_DOES_NOT_EXIST: "userId does not exist",
  PASSWORD_CRITERIA_NOT_MET: "Password criteria not met, Please try again",
};

export const DEFAULT_PASSWORD = "000000";
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
export const MOBILE_NO_REGEX = /^[6-9]\d{9}$/;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]{8,}$/;

export const USER_ROLE = {
  ADMIN_ROLE: "Admin",
  ADMIN_PREFIX: "ADM",
  EMPLOYEE_ROLE: "Employee",
  EMPLOYEE_PREFIX: "EMP",
};

export const BASIC_MIN_WAGE = 350;

export const DEPT = {
  SECURITY: "Security",
  ADMINISTRATION: "Administration",
  STAFF: "Staff",
  SALES: "Sales",
};

export const NO_MORE_TRIES = "No more tries left. Please register again";
export const SUCCESS_MAIL_OTP_CHECK = "Successfull verification of mail Id";

export const REGISTRATION_MAIL_VERIFY = "registration-mailverify";

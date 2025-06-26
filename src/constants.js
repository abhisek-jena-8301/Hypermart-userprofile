export const ERROR_MESSAGES = {
    INSUFFICIENT_PRIVILEGES : "The user is not authorized to perform the action.",
}

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
export const MOBILE_NO_REGEX = /^[6-9]\d{9}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]{8,}$/;

export const USER_ROLE = {
    ADMIN_ROLE : "Admin",
    ADMIN_PREFIX : "ADM",
    EMPLOYEE_ROLE : "Employee",
    EMPLOYEE_PREFIX : "EMP"
};

export const 

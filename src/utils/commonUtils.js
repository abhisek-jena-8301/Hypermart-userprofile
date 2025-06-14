//creating UserId
export const createUserId = (role) => {
  var rolePrefix;
  if (role === "Admin") {
    rolePrefix = "ADM";
  } else if (role === "Employee") {
    rolePrefix = "EMP";
  }
  const userId = rolePrefix + "." + Date.now().toString();
  return userId;
};

//validate MobileNo
export const validateMobileNo = (mobileNo) => {
  const regex = /^[6-9]\d{9}$/;
  const res = regex.test(mobileNo);
  return res;
};

//validateEmailId
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return regex.test(email);
};

//validate password
export const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]{8,}$/;
  return regex.test(password);
};

export const validateDeleteRequest = (userId, userToBeDeleted) => {
  const role = userId.slice(0, 3);
  const deletedRole = userToBeDeleted.slice(0, 3);
  if (role === "EMP") return false;
  else if (userId === process.env.SUPERADMIN_USER) return true;
  else if (role === "ADM" && deletedRole === "ADM") return false;
  return true;
};

export const validateAdminRequests = (userId) => {
  console.log("validateAdminRequest : " + userId);
  const role = userId.slice(0, 3);
  if (role === "ADM") return true;
  return false;
};

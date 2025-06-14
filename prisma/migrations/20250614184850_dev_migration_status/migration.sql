-- CreateTable
CREATE TABLE "user_profile" (
    "userId" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "contact" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "address" TEXT,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'A',

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "user_auth" (
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isMFAActive" BOOLEAN DEFAULT false,
    "twoFactorSecret" TEXT,
    "role" TEXT NOT NULL DEFAULT 'Admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "employee_sal_details" (
    "emp_id" TEXT NOT NULL,
    "dept_id" TEXT NOT NULL,
    "pan_number" TEXT NOT NULL,
    "per_day_allowance" DECIMAL(65,30) NOT NULL,
    "attendance" INTEGER NOT NULL,
    "salary" DECIMAL(65,30) NOT NULL,
    "bonus" DECIMAL(65,30) NOT NULL,
    "tax" DECIMAL(65,30) NOT NULL,
    "net_payable" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "employee_sal_details_pkey" PRIMARY KEY ("emp_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_userId_key" ON "user_auth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_username_key" ON "user_auth"("username");

-- AddForeignKey
ALTER TABLE "user_auth" ADD CONSTRAINT "user_auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_sal_details" ADD CONSTRAINT "employee_sal_details_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "user_profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

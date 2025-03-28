/*
  Warnings:

  - You are about to drop the `Attorney` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attorney" DROP CONSTRAINT "Attorney_userId_fkey";

-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_attorneyId_fkey";

-- DropForeignKey
ALTER TABLE "CaseManager" DROP CONSTRAINT "CaseManager_attorneyId_fkey";

-- DropTable
DROP TABLE "Attorney";

-- CreateTable
CREATE TABLE "attorneys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barNumber" TEXT,
    "firm" TEXT,
    "phone" TEXT,
    "faxNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipcode" TEXT,
    "notes" TEXT,
    "hasLogin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attorneys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attorneys_userId_key" ON "attorneys"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "attorneys_barNumber_key" ON "attorneys"("barNumber");

-- AddForeignKey
ALTER TABLE "attorneys" ADD CONSTRAINT "attorneys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseManager" ADD CONSTRAINT "CaseManager_attorneyId_fkey" FOREIGN KEY ("attorneyId") REFERENCES "attorneys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_attorneyId_fkey" FOREIGN KEY ("attorneyId") REFERENCES "attorneys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

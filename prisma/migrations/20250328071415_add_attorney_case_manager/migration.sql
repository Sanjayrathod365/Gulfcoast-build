-- AlterTable
ALTER TABLE "Attorney" ADD COLUMN     "faxNumber" TEXT;

-- CreateTable
CREATE TABLE "CaseManager" (
    "id" TEXT NOT NULL,
    "attorneyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneExt" TEXT,
    "faxNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseManager_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseManager_attorneyId_key" ON "CaseManager"("attorneyId");

-- AddForeignKey
ALTER TABLE "CaseManager" ADD CONSTRAINT "CaseManager_attorneyId_fkey" FOREIGN KEY ("attorneyId") REFERENCES "Attorney"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

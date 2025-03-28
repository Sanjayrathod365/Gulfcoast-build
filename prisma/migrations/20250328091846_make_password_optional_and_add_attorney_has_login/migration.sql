-- AlterTable
ALTER TABLE "Attorney" ADD COLUMN     "hasLogin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

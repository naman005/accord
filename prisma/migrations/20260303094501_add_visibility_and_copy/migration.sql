-- CreateEnum
CREATE TYPE "FormVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "allowCopy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "copiedFromId" TEXT,
ADD COLUMN     "visibility" "FormVisibility" NOT NULL DEFAULT 'PRIVATE';

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_copiedFromId_fkey" FOREIGN KEY ("copiedFromId") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - The primary key for the `Promotion_Wrestlers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `exit` column on the `Promotion_Wrestlers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `debut` on the `Promotion_Wrestlers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Promotion_Wrestlers" DROP CONSTRAINT "Promotion_Wrestlers_pkey",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "debut",
ADD COLUMN     "debut" SMALLINT NOT NULL,
DROP COLUMN "exit",
ADD COLUMN     "exit" SMALLINT,
ADD CONSTRAINT "Promotion_Wrestlers_pkey" PRIMARY KEY ("id");

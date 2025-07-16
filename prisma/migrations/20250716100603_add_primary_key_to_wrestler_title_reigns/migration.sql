/*
  Warnings:

  - The primary key for the `Wrestler_Titles` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Wrestler_Titles" DROP CONSTRAINT "Wrestler_Titles_pkey",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "Wrestler_Titles_pkey" PRIMARY KEY ("id");

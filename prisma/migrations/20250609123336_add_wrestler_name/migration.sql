/*
  Warnings:

  - Added the required column `name` to the `Wrestler` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wrestler" ADD COLUMN     "name" TEXT NOT NULL;

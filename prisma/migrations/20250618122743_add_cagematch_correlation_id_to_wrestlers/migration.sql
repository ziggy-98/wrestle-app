/*
  Warnings:

  - A unique constraint covering the columns `[cagematch_correlation_id]` on the table `Wrestler` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cagematch_correlation_id` to the `Wrestler` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wrestler" ADD COLUMN     "cagematch_correlation_id" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Wrestler_cagematch_correlation_id_key" ON "Wrestler"("cagematch_correlation_id");

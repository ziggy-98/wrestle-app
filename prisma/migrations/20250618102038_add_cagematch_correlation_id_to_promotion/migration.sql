/*
  Warnings:

  - A unique constraint covering the columns `[cagematch_correlation_id]` on the table `Promotion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cagematch_correlation_id` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "cagematch_correlation_id" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_cagematch_correlation_id_key" ON "Promotion"("cagematch_correlation_id");

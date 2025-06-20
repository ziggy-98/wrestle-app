/*
  Warnings:

  - A unique constraint covering the columns `[cagematch_correlation_id]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cagematch_correlation_id]` on the table `Title` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cagematch_correlation_id` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cagematch_correlation_id` to the `Title` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "cagematch_correlation_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Title" ADD COLUMN     "cagematch_correlation_id" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_cagematch_correlation_id_key" ON "Event"("cagematch_correlation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Title_cagematch_correlation_id_key" ON "Title"("cagematch_correlation_id");

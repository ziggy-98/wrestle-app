/*
  Warnings:

  - You are about to drop the `Match` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Match_Wrestlers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `promotion_id` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Match_Wrestlers" DROP CONSTRAINT "Match_Wrestlers_match_id_fkey";

-- DropForeignKey
ALTER TABLE "Match_Wrestlers" DROP CONSTRAINT "Match_Wrestlers_wrestler_id_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "promotion_id" BIGINT NOT NULL;

-- DropTable
DROP TABLE "Match";

-- DropTable
DROP TABLE "Match_Wrestlers";

-- CreateTable
CREATE TABLE "Event_Wrestler" (
    "event_id" BIGINT NOT NULL,
    "wrestler_id" BIGINT NOT NULL,
    "match_descriptor" TEXT NOT NULL,

    CONSTRAINT "Event_Wrestler_pkey" PRIMARY KEY ("event_id","wrestler_id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event_Wrestler" ADD CONSTRAINT "Event_Wrestler_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event_Wrestler" ADD CONSTRAINT "Event_Wrestler_wrestler_id_fkey" FOREIGN KEY ("wrestler_id") REFERENCES "Wrestler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

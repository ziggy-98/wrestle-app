/*
  Warnings:

  - You are about to drop the column `signatureMoves` on the `Wrestler` table. All the data in the column will be lost.
  - Added the required column `signature_moves` to the `Wrestler` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wrestler" DROP COLUMN "signatureMoves",
ADD COLUMN     "signature_moves" JSONB NOT NULL,
ALTER COLUMN "debut" DROP NOT NULL;

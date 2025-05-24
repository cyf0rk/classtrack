/*
  Warnings:

  - You are about to drop the column `duration` on the `Class` table. All the data in the column will be lost.
  - Added the required column `capacity` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Class" DROP COLUMN "duration",
ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

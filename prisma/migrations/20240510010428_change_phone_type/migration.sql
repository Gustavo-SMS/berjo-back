/*
  Warnings:

  - You are about to alter the column `phone` on the `customers` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `customers` MODIFY `phone` DOUBLE NOT NULL;

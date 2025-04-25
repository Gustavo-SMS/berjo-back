/*
  Warnings:

  - You are about to drop the column `userId` on the `customers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `customers` DROP FOREIGN KEY `customers_userId_fkey`;

-- AlterTable
ALTER TABLE `customers` DROP COLUMN `userId`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `customerId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_customerId_key` ON `User`(`customerId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

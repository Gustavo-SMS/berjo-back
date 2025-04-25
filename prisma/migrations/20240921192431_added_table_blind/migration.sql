/*
  Warnings:

  - You are about to drop the column `color` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `orders` table. All the data in the column will be lost.
  - Added the required column `blind_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` DROP COLUMN `color`,
    DROP COLUMN `type`,
    ADD COLUMN `blind_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Blind` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `collection` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_blind_id_fkey` FOREIGN KEY (`blind_id`) REFERENCES `Blind`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

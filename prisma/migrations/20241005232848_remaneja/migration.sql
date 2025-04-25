/*
  Warnings:

  - You are about to drop the column `collection` on the `blind` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `blind` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `blind` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `blind` table. All the data in the column will be lost.
  - You are about to drop the column `blind_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `command_height` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `orders` table. All the data in the column will be lost.
  - Added the required column `command_height` to the `Blind` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `Blind` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Blind` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `Blind` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Blind` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type_id` to the `Blind` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Blind` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_blind_id_fkey`;

-- AlterTable
ALTER TABLE `blind` DROP COLUMN `collection`,
    DROP COLUMN `color`,
    DROP COLUMN `price`,
    DROP COLUMN `type`,
    ADD COLUMN `command_height` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `height` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `model` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `order_id` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `type_id` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `width` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `blind_id`,
    DROP COLUMN `command_height`,
    DROP COLUMN `height`,
    DROP COLUMN `model`,
    DROP COLUMN `quantity`,
    DROP COLUMN `width`,
    ADD COLUMN `total_price` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `Blind_Type` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `collection` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `max_width` DOUBLE NULL,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Blind` ADD CONSTRAINT `Blind_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Blind` ADD CONSTRAINT `Blind_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `Blind_Type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

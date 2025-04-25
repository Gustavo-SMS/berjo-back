/*
  Warnings:

  - You are about to drop the column `altura` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `altura_comando` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `cor` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `largura` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `modelo` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `orders` table. All the data in the column will be lost.
  - Added the required column `color` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `command_height` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` DROP COLUMN `altura`,
    DROP COLUMN `altura_comando`,
    DROP COLUMN `cor`,
    DROP COLUMN `largura`,
    DROP COLUMN `modelo`,
    DROP COLUMN `quantidade`,
    DROP COLUMN `tipo`,
    ADD COLUMN `color` VARCHAR(191) NOT NULL,
    ADD COLUMN `command_height` DOUBLE NOT NULL,
    ADD COLUMN `height` DOUBLE NOT NULL,
    ADD COLUMN `model` VARCHAR(191) NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL,
    ADD COLUMN `width` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `login` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_login_key`(`login`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

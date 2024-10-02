-- CreateTable
CREATE TABLE `UserEntity` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(72) NOT NULL,

    UNIQUE INDEX `UserEntity_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

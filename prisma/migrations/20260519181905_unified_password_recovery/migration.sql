-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password_token_expiry" TIMESTAMP(3),
ADD COLUMN     "password_token_hash" TEXT,
ADD COLUMN     "password_token_type" TEXT;

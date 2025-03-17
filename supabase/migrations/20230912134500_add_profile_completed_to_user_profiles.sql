-- Add profile_completed column to user_profiles table
ALTER TABLE "public"."user_profiles" ADD COLUMN IF NOT EXISTS "profile_completed" BOOLEAN DEFAULT false;

-- Update existing users with phone_numbers to have profile_completed = true
UPDATE "public"."user_profiles" SET "profile_completed" = true WHERE "phone_number" IS NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN "public"."user_profiles"."profile_completed" IS 'Indicates whether the user has completed their profile setup'; 
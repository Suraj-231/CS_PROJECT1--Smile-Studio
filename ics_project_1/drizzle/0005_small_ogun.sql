ALTER TABLE "appointments" ALTER COLUMN "date" TYPE timestamp with time zone
USING date::timestamp with time zone;;

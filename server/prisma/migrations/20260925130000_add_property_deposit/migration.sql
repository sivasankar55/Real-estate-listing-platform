-- Security deposit for rental listings; null for sale listings.
ALTER TABLE "Property" ADD COLUMN "depositAmount" DECIMAL(14,2);

ALTER TABLE "Property"
  ADD CONSTRAINT "Property_price_positive" CHECK ("price" > 0),
  ADD CONSTRAINT "Property_areaSqft_positive" CHECK ("areaSqft" > 0),
  ADD CONSTRAINT "Property_bedrooms_nonnegative" CHECK ("bedrooms" IS NULL OR "bedrooms" >= 0),
  ADD CONSTRAINT "Property_bathrooms_nonnegative" CHECK ("bathrooms" IS NULL OR "bathrooms" >= 0),
  ADD CONSTRAINT "Property_depositAmount_nonnegative" CHECK ("depositAmount" IS NULL OR "depositAmount" >= 0),
  ADD CONSTRAINT "Property_ageYears_nonnegative" CHECK ("ageYears" IS NULL OR "ageYears" >= 0);

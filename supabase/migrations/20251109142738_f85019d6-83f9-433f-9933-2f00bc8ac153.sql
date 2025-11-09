-- Add additional ef_unit values for comprehensive emission factors
ALTER TYPE ef_unit ADD VALUE IF NOT EXISTS 'kgCO2e/passenger_km';
ALTER TYPE ef_unit ADD VALUE IF NOT EXISTS 'kgCO2e/tonne_km';
ALTER TYPE ef_unit ADD VALUE IF NOT EXISTS 'kgCO2e/night';

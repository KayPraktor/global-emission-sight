-- Add additional emission units for comprehensive factor coverage
ALTER TYPE emission_unit ADD VALUE IF NOT EXISTS 'passenger_km';
ALTER TYPE emission_unit ADD VALUE IF NOT EXISTS 'tonne_km';
ALTER TYPE emission_unit ADD VALUE IF NOT EXISTS 'night';

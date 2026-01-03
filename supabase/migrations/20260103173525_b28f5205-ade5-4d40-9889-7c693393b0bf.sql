-- Add missing kgCO2e/USD enum value for spend-based emission factors
ALTER TYPE ef_unit ADD VALUE IF NOT EXISTS 'kgCO2e/USD';
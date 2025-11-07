import { z } from 'zod';

// Consumption data schema
export const consumptionDataSchema = z.object({
  type: z.string().min(1, 'Type is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  period: z.string().min(1, 'Period is required'),
});

// Equipment info schema
export const equipmentInfoSchema = z.object({
  name: z.string().max(200),
  type: z.string().max(200),
  capacity: z.number().nonnegative(),
  age: z.number().nonnegative(),
});

// Emission factor schema
export const emissionFactorSchema = z.object({
  source: z.string().min(1, 'Source is required').max(100),
  factor: z.number().positive('Factor must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  methodology: z.string().min(1, 'Methodology is required').max(100),
});

// Step 1 validation
export const step1Schema = z.object({
  organizationName: z.string().min(1, 'Organization name is required').max(200),
  facilityName: z.string().min(1, 'Facility name is required').max(200),
  facilityType: z.string().min(1, 'Facility type is required'),
  address: z.string().max(500),
  reportingPeriodStart: z.string().min(1, 'Start date is required'),
  reportingPeriodEnd: z.string().min(1, 'End date is required'),
  operationalBoundaries: z.string().max(1000),
});

// Step 2 validation
export const step2Schema = z.object({
  consumptionData: z.array(consumptionDataSchema).min(1, 'At least one consumption entry is required'),
  operationalHours: z.number().min(0).max(8760, 'Max 8,760 hours per year'),
  productionVolume: z.number().nonnegative(),
});

// Step 3 validation (optional fields)
export const step3Schema = z.object({
  equipmentInfo: z.array(equipmentInfoSchema),
  fuelSpecifications: z.string().max(2000),
  processDetails: z.string().max(2000),
});

// Step 4 validation
export const step4Schema = z.object({
  emissionFactors: z.array(emissionFactorSchema).min(1, 'At least one emission factor is required'),
  calculationMethodology: z.string().max(1000),
  uncertaintyRange: z.number().min(0).max(100),
});

// Step 5 validation
export const step5Schema = z.object({
  confidenceLevel: z.string().min(1, 'Confidence level is required'),
  dataSources: z.array(z.string()),
  measurementType: z.string(),
  reviewComments: z.string().max(2000),
  approvalRequired: z.boolean(),
});

// Full form validation
export const fullFormSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

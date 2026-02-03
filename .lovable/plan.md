

## Fix seed-sample-data Edge Function Enum Values

The edge function has mismatched enum values for the `emission_unit` type used in emissions entries. The database requires exact case-sensitive matches.

---

### Issues Identified

| Location | Current Value | Correct Value | Issue |
|----------|---------------|---------------|-------|
| Line 124 | `"kwh"` | `"kWh"` | Case mismatch |
| Line 154 | `"kwh"` | `"kWh"` | Case mismatch |
| Line 139 | `"liters"` | `"L"` | Wrong format |
| Line 169 | `"km"` | `"km"` | OK |
| Line 184 | `"km"` | `"km"` | OK |
| Line 199 | `"usd"` | N/A | Not a valid emission_unit |

---

### Valid Enum Values (from database schema)

**`ef_unit`** (for emission_factors table):
```
kgCO2e/kWh, kgCO2e/MWh, kgCO2e/L, kgCO2e/kg, kgCO2e/t, 
kgCO2e/m3, kgCO2e/km, kgCO2e/passenger_km, kgCO2e/tonne_km, 
kgCO2e/night, kgCO2e/USD
```

**`emission_unit`** (for emissions_entries table):
```
kWh, MWh, L, kg, t, m3, km, passenger_km, tonne_km, night
```

---

### Fix Plan

**File to modify:** `supabase/functions/seed-sample-data/index.ts`

#### Change 1: Fix Natural Gas unit (Line 124)
Change `"kwh"` to `"kWh"`

#### Change 2: Fix Diesel unit (Line 139)  
Change `"liters"` to `"L"`

#### Change 3: Fix Electricity unit (Line 154)
Change `"kwh"` to `"kWh"`

#### Change 4: Fix Purchased Goods (Lines 87, 189-202)
The "Purchased Goods" entry uses USD as a unit which is not valid for emissions_entries. 

**Solution:** 
- Change the emission factor unit from `kgCO2e/kg` to `kgCO2e/USD` (valid for ef_unit)
- Change the emissions entry unit from `"usd"` to `"kg"` and adjust the activity to represent material weight instead of spend
- OR remove this sample entry entirely since spend-based calculations need special handling

**Recommended approach:** Convert to weight-based (kg) since USD is not a valid emission_unit:
- Change emission factor: keep as `kgCO2e/kg` 
- Change entry: use `"kg"` as unit with adjusted quantity representing material weight

---

### Technical Details

The changes are straightforward enum value corrections:

```typescript
// Line 124: Natural Gas entry
unit: "kWh",  // was: "kwh"

// Line 139: Diesel entry  
unit: "L",    // was: "liters"

// Line 154: Electricity entry
unit: "kWh",  // was: "kwh"

// Line 199: Purchased Goods entry
unit: "kg",   // was: "usd" (not valid)
// Also update notes to reflect kg-based measurement
```

---

### Expected Outcome

After this fix, the seed-sample-data edge function will successfully insert:
- 1 facility
- 6 emission factors with valid `ef_unit` values
- 72 emissions entries (12 months × 6 categories) with valid `emission_unit` values
- 72 calculations


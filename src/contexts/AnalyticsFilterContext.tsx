
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterState {
  facility: string;
  department: string;
  project: string;
  dateRange: {
    from: Date;
    to: Date;
  };
}

interface AnalyticsFilterContextType {
  filters: FilterState;
  updateFilters: (newFilters: Partial<FilterState>) => void;
}

const defaultFilters: FilterState = {
  facility: 'all',
  department: 'all',
  project: 'all',
  dateRange: {
    from: new Date(2025, 0, 1), // Jan 1, 2025
    to: new Date(2025, 11, 31), // Dec 31, 2025
  },
};

const AnalyticsFilterContext = createContext<AnalyticsFilterContextType>({
  filters: defaultFilters,
  updateFilters: () => {},
});

export const useAnalyticsFilters = () => useContext(AnalyticsFilterContext);

export const AnalyticsFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <AnalyticsFilterContext.Provider value={{ filters, updateFilters }}>
      {children}
    </AnalyticsFilterContext.Provider>
  );
};

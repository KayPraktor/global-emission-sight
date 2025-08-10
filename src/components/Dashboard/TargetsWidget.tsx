import React, { useMemo } from 'react';
import PredictiveChart from '@/components/Dashboard/PredictiveChart';

const TargetsWidget: React.FC = () => {
  const data = useMemo(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const base = 1000;
    const actual = months.slice(0,6).map((m,i)=>({ period: m, actual: base - i*20 + (i%2?30:-10), predicted: base - i*20, upperBound: base - i*20 + 80, lowerBound: base - i*20 - 80, target: base - i*25 }));
    const forecast = months.slice(6,12).map((m,i)=>({ period: m, predicted: base - (6+i)*22, upperBound: base - (6+i)*22 + 90, lowerBound: base - (6+i)*22 - 90, target: base - (6+i)*25 }));
    return [...actual, ...forecast];
  }, []);

  return (
    <PredictiveChart title="Targets vs Actual (tCO₂e)" unit="tCO₂e" data={data} />
  );
};

export default TargetsWidget;

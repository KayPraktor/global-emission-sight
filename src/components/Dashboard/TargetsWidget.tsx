import React from 'react';
import PredictiveChart from '@/components/Dashboard/PredictiveChart';

const TargetsWidget: React.FC = () => {
  const data = [
    { period: 'Jan', actual: 980, predicted: 980, upperBound: 1050, lowerBound: 910, target: 900 },
    { period: 'Feb', actual: 960, predicted: 950, upperBound: 1020, lowerBound: 880, target: 880 },
    { period: 'Mar', actual: 940, predicted: 930, upperBound: 1000, lowerBound: 860, target: 860 },
    { period: 'Apr', actual: 920, predicted: 910, upperBound: 980, lowerBound: 840, target: 840 },
    { period: 'May', actual: 900, predicted: 890, upperBound: 960, lowerBound: 820, target: 820 },
    { period: 'Jun', predicted: 870, upperBound: 940, lowerBound: 800, target: 800 },
    { period: 'Jul', predicted: 850, upperBound: 920, lowerBound: 780, target: 780 },
    { period: 'Aug', predicted: 830, upperBound: 900, lowerBound: 760, target: 760 },
  ];

  return <PredictiveChart data={data} title="Targets vs Actual (tCO₂e)" unit="tCO₂e" />;
};

export default TargetsWidget;

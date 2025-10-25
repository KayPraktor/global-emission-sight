
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { emissionsData, monthlySummary } from '@/utils/dummyData';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { toast } from "sonner";

const EmissionsReport: React.FC = () => {
  
  // Function to handle exporting to CSV - Improved with error handling
  const handleExport = () => {
    try {
      // Create headers for CSV
      const headers = ['Month', 'Category', 'Subcategory', 'Source', 'Amount', 'Unit', 'CO₂e (tonnes)'];
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...emissionsData.map(item => 
          [
            item.month,
            item.category,
            item.subcategory,
            item.source,
            item.amount,
            item.unit,
            item.co2e.toFixed(1)
          ].join(',')
        )
      ].join('\n');
      
      // Create a blob with the CSV data
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'emissions_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup the URL object
      URL.revokeObjectURL(url);
      
      toast.success("Report exported to CSV successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export report. Please try again.");
    }
  };
  
  // Function to handle printing the report
  const handlePrint = () => {
    try {
      window.print();
      toast.success("Print dialog opened");
    } catch (error) {
      console.error("Error printing:", error);
      toast.error("Failed to print. Please try again.");
    }
  };
  
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Emissions Report</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlySummary}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis unit=" tCO₂e" />
              <Tooltip 
                formatter={(value) => [`${value} tCO₂e`, '']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Bar dataKey="scope1" name="Scope 1" fill="#159947" />
              <Bar dataKey="scope2" name="Scope 2" fill="#2c7da0" />
              <Bar dataKey="scope3" name="Scope 3" fill="#61a5c2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmissionsReport;

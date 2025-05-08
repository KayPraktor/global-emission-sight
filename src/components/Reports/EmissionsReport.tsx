
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { emissionsData, monthlySummary } from '@/utils/dummyData';
import { Download, FileSpreadsheet, Filter, Printer } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EmissionsReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState("table");
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Emissions Report</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Data Table</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="line">Line Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="w-full">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">CO₂e (tonnes)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emissionsData.map((emission) => (
                    <TableRow key={emission.id}>
                      <TableCell>{emission.month}</TableCell>
                      <TableCell>{emission.category}</TableCell>
                      <TableCell>{emission.subcategory}</TableCell>
                      <TableCell>{emission.source}</TableCell>
                      <TableCell>{emission.amount.toLocaleString()}</TableCell>
                      <TableCell>{emission.unit}</TableCell>
                      <TableCell className="text-right font-medium">{emission.co2e.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="bar" className="w-full">
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
          </TabsContent>
          
          <TabsContent value="line" className="w-full">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
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
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="Total Emissions"
                    stroke="#159947" 
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Line type="monotone" dataKey="scope1" name="Scope 1" stroke="#a4f3c0" />
                  <Line type="monotone" dataKey="scope2" name="Scope 2" stroke="#2c7da0" />
                  <Line type="monotone" dataKey="scope3" name="Scope 3" stroke="#61a5c2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmissionsReport;

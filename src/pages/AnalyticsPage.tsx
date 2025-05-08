
import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart, XAxis, YAxis, Bar, Line, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { month: 'Jan', emissions: 400, target: 300 },
  { month: 'Feb', emissions: 380, target: 300 },
  { month: 'Mar', emissions: 410, target: 300 },
  { month: 'Apr', emissions: 370, target: 300 },
  { month: 'May', emissions: 320, target: 300 },
  { month: 'Jun', emissions: 280, target: 300 },
];

const sourceData = [
  { name: 'Electricity', value: 45 },
  { name: 'Natural Gas', value: 25 },
  { name: 'Transportation', value: 20 },
  { name: 'Waste', value: 10 },
];

const intensityData = [
  { year: '2020', intensity: 60 },
  { year: '2021', intensity: 55 },
  { year: '2022', intensity: 47 },
  { year: '2023', intensity: 42 },
  { year: '2024', intensity: 35 },
  { year: '2025', intensity: 31 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Emissions Analytics</h1>
          <p className="text-gray-500">In-depth analysis of your emissions data and trends</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Emissions vs Target</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="emissions" fill="#159947" name="Actual Emissions" />
                  <Bar dataKey="target" fill="#2c7da0" name="Target Emissions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Emission Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Emission Intensity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={intensityData}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="intensity" stroke="#159947" activeDot={{ r: 8 }} name="Emissions Intensity (tCO2e/revenue)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="text-sm flex items-start">
                  <span className="bg-green-100 text-green-700 rounded-full p-1 mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>Emissions decreased by 18% compared to last year</span>
                </li>
                <li className="text-sm flex items-start">
                  <span className="bg-green-100 text-green-700 rounded-full p-1 mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>June emissions were below target for the first time</span>
                </li>
                <li className="text-sm flex items-start">
                  <span className="bg-amber-100 text-amber-700 rounded-full p-1 mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </span>
                  <span>Electricity remains the largest emission source</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="text-sm flex items-start">
                  <span className="bg-ocean-100 text-ocean-700 rounded-full p-1 mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <span>Implement energy efficiency measures in offices</span>
                </li>
                <li className="text-sm flex items-start">
                  <span className="bg-ocean-100 text-ocean-700 rounded-full p-1 mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <span>Switch to renewable energy providers</span>
                </li>
                <li className="text-sm flex items-start">
                  <span className="bg-ocean-100 text-ocean-700 rounded-full p-1 mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <span>Develop electric vehicle transition plan</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="text-sm flex items-start">
                  <span className="bg-gray-100 text-gray-700 rounded-full p-1 mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </span>
                  <span>On track for 40% reduction by 2030</span>
                </li>
                <li className="text-sm flex items-start">
                  <span className="bg-gray-100 text-gray-700 rounded-full p-1 mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </span>
                  <span>Carbon neutrality possible by 2040</span>
                </li>
                <li className="text-sm flex items-start">
                  <span className="bg-gray-100 text-gray-700 rounded-full p-1 mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span>Need to accelerate reductions in Q3 and Q4</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="border-t border-gray-200 py-4 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">© 2025 BARYON. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="#" className="text-sm text-gray-500 hover:text-carbon">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-carbon">Terms of Service</a>
            <a href="#" className="text-sm text-gray-500 hover:text-carbon">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AnalyticsPage;

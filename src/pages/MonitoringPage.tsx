import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Monitor, Gauge, Activity, AlertTriangle, Wifi, Clock } from 'lucide-react';

const MonitoringPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [emissionsRate, setEmissionsRate] = useState(42);
  const [systemStatus, setSystemStatus] = useState('operational');
  const [networkLatency, setNetworkLatency] = useState(120);
  const [dataPoints, setDataPoints] = useState<{ time: Date; value: number }[]>([]);
  
  // Simulate real-time data updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate random fluctuations in emissions rate (between -5 and +5)
      const fluctuation = Math.floor(Math.random() * 11) - 5;
      const newRate = Math.max(20, Math.min(80, emissionsRate + fluctuation));
      setEmissionsRate(newRate);
      
      // Simulate random network latency changes
      const latencyChange = Math.floor(Math.random() * 51) - 25;
      setNetworkLatency(Math.max(50, Math.min(300, networkLatency + latencyChange)));
      
      // Update data points for the chart
      setDataPoints(prevData => {
        const newData = [...prevData, { time: new Date(), value: newRate }];
        // Keep only the last 20 points to prevent too much data
        return newData.slice(-20);
      });
      
      // Occasionally change system status
      if (Math.random() > 0.95) {
        const statuses = ['operational', 'warning', 'critical', 'operational'];
        setSystemStatus(statuses[Math.floor(Math.random() * statuses.length)]);
      }
    }, 3000);
    
    return () => clearInterval(timer);
  }, [emissionsRate, networkLatency]);
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'operational': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getSeverityBadge = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return <Badge className="bg-green-500">Low</Badge>;
    if (value < thresholds[1]) return <Badge className="bg-amber-500">Medium</Badge>;
    return <Badge className="bg-red-500">High</Badge>;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Real-Time Monitoring</h1>
            <p className="text-gray-500">Track emissions and system performance in real-time</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              Last updated: {formatDate(currentTime)}
            </span>
          </div>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(systemStatus)}`}></div>
                <span className="capitalize font-medium">{systemStatus}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Gauge className="h-4 w-4 mr-2" />
                Current Emissions Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{emissionsRate} tCO₂e/hr</span>
                  {getSeverityBadge(emissionsRate, [30, 60])}
                </div>
                <Progress value={emissionsRate} max={100} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-medium text-lg">{systemStatus === 'critical' ? 3 : systemStatus === 'warning' ? 1 : 0}</span>
                {systemStatus !== 'operational' && (
                  <Badge variant={systemStatus === 'critical' ? 'destructive' : 'outline'} className="ml-2">
                    {systemStatus === 'critical' ? 'Action Required' : 'Review'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Wifi className="h-4 w-4 mr-2" />
                Network Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Latency: {networkLatency} ms</span>
                  {getSeverityBadge(networkLatency, [100, 200])}
                </div>
                <Progress value={Math.min(100, networkLatency / 3)} max={100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="emissions">Emissions</TabsTrigger>
            <TabsTrigger value="systems">Systems</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Real-Time Emissions Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {dataPoints.length > 0 ? (
                    <div className="h-full">
                      <div className="relative w-full h-full">
                        {/* Simple visual representation of data points */}
                        <div className="absolute inset-0 flex items-end">
                          {dataPoints.map((point, index) => (
                            <div 
                              key={index} 
                              className="flex-1 bg-blue-500 mx-0.5 transition-all duration-300 ease-in-out"
                              style={{ 
                                height: `${(point.value / 100) * 100}%`,
                                backgroundColor: point.value > 60 ? '#ef4444' : point.value > 40 ? '#f59e0b' : '#22c55e'
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p>No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Monitoring Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {['Electricity Usage', 'Natural Gas', 'Fleet Vehicles', 'Waste Processing'].map((source, index) => (
                      <li key={index} className="flex items-center justify-between p-2 border-b">
                        <span>{source}</span>
                        <Badge variant="outline" className={getStatusColor(Math.random() > 0.3 ? 'operational' : 'warning')}>
                          {Math.random() > 0.3 ? 'Active' : 'Intermittent'}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">CPU Usage</span>
                        <span className="text-sm font-medium">67%</span>
                      </div>
                      <Progress value={67} max={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Memory Usage</span>
                        <span className="text-sm font-medium">42%</span>
                      </div>
                      <Progress value={42} max={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Storage</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <Progress value={78} max={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Network Bandwidth</span>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                      <Progress value={35} max={100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="emissions">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Emissions Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    This panel provides in-depth monitoring of carbon emissions across different sources and locations.
                  </p>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p>Additional emissions monitoring content would be displayed here, including:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Source-specific emissions rates</li>
                      <li>Historical comparisons</li>
                      <li>Anomaly detection</li>
                      <li>Forecast projections</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="systems">
            <Card>
              <CardHeader>
                <CardTitle>System Health Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    This panel displays the health and status of all connected monitoring systems and data sources.
                  </p>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p>System monitoring content would be displayed here, including:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Sensor statuses and health</li>
                      <li>Data collection rates</li>
                      <li>Calibration information</li>
                      <li>Maintenance schedules</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Alert Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    This panel shows active alerts and allows configuration of alert thresholds and notification settings.
                  </p>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p>Alert management content would be displayed here, including:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Active and resolved alerts</li>
                      <li>Alert history and patterns</li>
                      <li>Notification settings</li>
                      <li>Threshold configurations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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

export default MonitoringPage;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Upload, Plus, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedGoalFormProps {
  onComplete?: () => void;
}

const EnhancedGoalForm = ({ onComplete }: EnhancedGoalFormProps) => {
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    description: '',
    category: '',
    priority: '',
    scope: '',
    
    // Targets & Metrics
    baselineValue: '',
    baselineYear: '',
    targetValue: '',
    targetYear: '',
    unit: '',
    methodology: '',
    
    // Implementation
    department: '',
    owner: '',
    budget: '',
    resources: '',
    
    // Timeline
    startDate: '',
    endDate: '',
    milestones: [] as Array<{id: string, title: string, date: string, description: string}>,
    
    // Risk & Dependencies
    risks: [] as Array<{id: string, risk: string, impact: string, mitigation: string}>,
    dependencies: '',
    
    // Compliance
    regulatoryFramework: '',
    reportingRequirements: '',
    verificationNeeded: false,
  });

  const [milestones, setMilestones] = useState([
    { id: '1', title: '', date: '', description: '' }
  ]);

  const [risks, setRisks] = useState([
    { id: '1', risk: '', impact: '', mitigation: '' }
  ]);

  const addMilestone = () => {
    const newMilestone = { 
      id: Date.now().toString(), 
      title: '', 
      date: '', 
      description: '' 
    };
    setMilestones([...milestones, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const addRisk = () => {
    const newRisk = { 
      id: Date.now().toString(), 
      risk: '', 
      impact: '', 
      mitigation: '' 
    };
    setRisks([...risks, newRisk]);
  };

  const removeRisk = (id: string) => {
    setRisks(risks.filter(r => r.id !== id));
  };

  const handleSubmit = () => {
    toast.success('Goal created successfully!');
    onComplete?.();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Sustainability Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="targets">Targets</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Goal Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Reduce Scope 1 emissions by 25%"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emissions-reduction">Emissions Reduction</SelectItem>
                        <SelectItem value="energy-efficiency">Energy Efficiency</SelectItem>
                        <SelectItem value="renewable-energy">Renewable Energy</SelectItem>
                        <SelectItem value="waste-reduction">Waste Reduction</SelectItem>
                        <SelectItem value="water-conservation">Water Conservation</SelectItem>
                        <SelectItem value="supply-chain">Supply Chain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="scope">Emission Scope *</Label>
                    <Select 
                      value={formData.scope}
                      onValueChange={(value) => setFormData({...formData, scope: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scope1">Scope 1 - Direct Emissions</SelectItem>
                        <SelectItem value="scope2">Scope 2 - Indirect Energy</SelectItem>
                        <SelectItem value="scope3">Scope 3 - Value Chain</SelectItem>
                        <SelectItem value="multiple">Multiple Scopes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority Level *</Label>
                    <Select 
                      value={formData.priority}
                      onValueChange={(value) => setFormData({...formData, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Detailed description of the goal, its purpose, and expected impact"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="department">Responsible Department</Label>
                    <Select 
                      value={formData.department}
                      onValueChange={(value) => setFormData({...formData, department: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sustainability">Sustainability</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="facilities">Facilities</SelectItem>
                        <SelectItem value="procurement">Procurement</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="owner">Goal Owner</Label>
                    <Input
                      id="owner"
                      value={formData.owner}
                      onChange={(e) => setFormData({...formData, owner: e.target.value})}
                      placeholder="Name of responsible person"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="targets" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Baseline Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="baselineValue">Baseline Value *</Label>
                      <Input
                        id="baselineValue"
                        type="number"
                        value={formData.baselineValue}
                        onChange={(e) => setFormData({...formData, baselineValue: e.target.value})}
                        placeholder="e.g., 1000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="baselineYear">Baseline Year *</Label>
                      <Input
                        id="baselineYear"
                        type="number"
                        value={formData.baselineYear}
                        onChange={(e) => setFormData({...formData, baselineYear: e.target.value})}
                        placeholder="e.g., 2020"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit of Measurement *</Label>
                      <Select 
                        value={formData.unit}
                        onValueChange={(value) => setFormData({...formData, unit: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tco2e">tCO2e</SelectItem>
                          <SelectItem value="kwh">kWh</SelectItem>
                          <SelectItem value="mwh">MWh</SelectItem>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="gallons">Gallons</SelectItem>
                          <SelectItem value="tons">Tons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Target Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="targetValue">Target Value *</Label>
                      <Input
                        id="targetValue"
                        type="number"
                        value={formData.targetValue}
                        onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                        placeholder="e.g., 750"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetYear">Target Year *</Label>
                      <Input
                        id="targetYear"
                        type="number"
                        value={formData.targetYear}
                        onChange={(e) => setFormData({...formData, targetYear: e.target.value})}
                        placeholder="e.g., 2030"
                      />
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Target Reduction: {formData.baselineValue && formData.targetValue ? 
                          Math.round((1 - Number(formData.targetValue) / Number(formData.baselineValue)) * 100) 
                          : 0}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Label htmlFor="methodology">Calculation Methodology</Label>
                <Textarea
                  id="methodology"
                  value={formData.methodology}
                  onChange={(e) => setFormData({...formData, methodology: e.target.value})}
                  placeholder="Describe the methodology for calculating progress and emission factors used"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="implementation" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="budget">Estimated Budget</Label>
                    <Input
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      placeholder="e.g., $50,000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="resources">Required Resources</Label>
                    <Textarea
                      id="resources"
                      value={formData.resources}
                      onChange={(e) => setFormData({...formData, resources: e.target.value})}
                      placeholder="Equipment, personnel, technology, etc."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dependencies">Dependencies</Label>
                    <Textarea
                      id="dependencies"
                      value={formData.dependencies}
                      onChange={(e) => setFormData({...formData, dependencies: e.target.value})}
                      placeholder="Other goals, external factors, regulatory changes, etc."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-medium">Risk Assessment</Label>
                  <Button onClick={addRisk} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Risk
                  </Button>
                </div>

                <div className="space-y-4">
                  {risks.map((risk, index) => (
                    <Card key={risk.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="outline">Risk #{index + 1}</Badge>
                          {risks.length > 1 && (
                            <Button 
                              onClick={() => removeRisk(risk.id)}
                              variant="ghost" 
                              size="sm"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Risk Description</Label>
                            <Input
                              value={risk.risk}
                              onChange={(e) => {
                                const updatedRisks = risks.map(r => 
                                  r.id === risk.id ? {...r, risk: e.target.value} : r
                                );
                                setRisks(updatedRisks);
                              }}
                              placeholder="Describe the risk"
                            />
                          </div>
                          <div>
                            <Label>Impact Level</Label>
                            <Select
                              value={risk.impact}
                              onValueChange={(value) => {
                                const updatedRisks = risks.map(r => 
                                  r.id === risk.id ? {...r, impact: value} : r
                                );
                                setRisks(updatedRisks);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select impact" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Mitigation Strategy</Label>
                            <Input
                              value={risk.mitigation}
                              onChange={(e) => {
                                const updatedRisks = risks.map(r => 
                                  r.id === risk.id ? {...r, mitigation: e.target.value} : r
                                );
                                setRisks(updatedRisks);
                              }}
                              placeholder="Mitigation approach"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-medium">Milestones</Label>
                  <Button onClick={addMilestone} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Milestone
                  </Button>
                </div>

                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <Card key={milestone.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="outline">Milestone #{index + 1}</Badge>
                          {milestones.length > 1 && (
                            <Button 
                              onClick={() => removeMilestone(milestone.id)}
                              variant="ghost" 
                              size="sm"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Milestone Title</Label>
                            <Input
                              value={milestone.title}
                              onChange={(e) => {
                                const updatedMilestones = milestones.map(m => 
                                  m.id === milestone.id ? {...m, title: e.target.value} : m
                                );
                                setMilestones(updatedMilestones);
                              }}
                              placeholder="e.g., Complete energy audit"
                            />
                          </div>
                          <div>
                            <Label>Due Date</Label>
                            <Input
                              type="date"
                              value={milestone.date}
                              onChange={(e) => {
                                const updatedMilestones = milestones.map(m => 
                                  m.id === milestone.id ? {...m, date: e.target.value} : m
                                );
                                setMilestones(updatedMilestones);
                              }}
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={milestone.description}
                              onChange={(e) => {
                                const updatedMilestones = milestones.map(m => 
                                  m.id === milestone.id ? {...m, description: e.target.value} : m
                                );
                                setMilestones(updatedMilestones);
                              }}
                              placeholder="Milestone details"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="regulatoryFramework">Regulatory Framework</Label>
                  <Select 
                    value={formData.regulatoryFramework}
                    onValueChange={(value) => setFormData({...formData, regulatoryFramework: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sbti">Science Based Targets initiative (SBTi)</SelectItem>
                      <SelectItem value="cdp">CDP (Carbon Disclosure Project)</SelectItem>
                      <SelectItem value="tcfd">TCFD (Task Force on Climate-related Financial Disclosures)</SelectItem>
                      <SelectItem value="ghg-protocol">GHG Protocol</SelectItem>
                      <SelectItem value="iso14001">ISO 14001</SelectItem>
                      <SelectItem value="eu-taxonomy">EU Taxonomy</SelectItem>
                      <SelectItem value="local-regulations">Local Regulations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reportingRequirements">Reporting Requirements</Label>
                  <Textarea
                    id="reportingRequirements"
                    value={formData.reportingRequirements}
                    onChange={(e) => setFormData({...formData, reportingRequirements: e.target.value})}
                    placeholder="Specific reporting requirements and frequency"
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Verification Requirements</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      This goal may require third-party verification for compliance reporting. 
                      Consider engaging a qualified verification body early in the process.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline">Save as Draft</Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={onComplete}>Cancel</Button>
              <Button onClick={handleSubmit}>Create Goal</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedGoalForm;

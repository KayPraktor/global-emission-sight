
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
import { Calendar, Upload, Plus, X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { goalsService } from '@/services/goalsService';
import { useQueryClient } from '@tanstack/react-query';

interface EnhancedGoalFormProps {
  onComplete?: () => void;
}

// Zod validation schema
const currentYear = new Date().getFullYear();

const goalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  priority: z.string().min(1, 'Priority is required'),
  scope: z.string().min(1, 'Emission scope is required'),
  baselineValue: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Baseline value must be a positive number'),
  baselineYear: z.string().refine(val => {
    const year = Number(val);
    return !isNaN(year) && year >= 1990 && year <= currentYear;
  }, `Baseline year must be between 1990 and ${currentYear}`),
  targetValue: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'Target value must be a non-negative number'),
  targetYear: z.string().refine(val => {
    const year = Number(val);
    return !isNaN(year) && year >= currentYear;
  }, `Target year must be ${currentYear} or later`),
});

type ValidationErrors = Partial<Record<keyof z.infer<typeof goalSchema>, string>>;

const EnhancedGoalForm = ({ onComplete }: EnhancedGoalFormProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
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

  const validateForm = (): boolean => {
    const result = goalSchema.safeParse({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      scope: formData.scope,
      baselineValue: formData.baselineValue,
      baselineYear: formData.baselineYear,
      targetValue: formData.targetValue,
      targetYear: formData.targetYear,
    });

    if (!result.success) {
      const errors: ValidationErrors = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof ValidationErrors;
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      return false;
    }

    // Additional validation: target year must be after baseline year
    if (Number(formData.targetYear) <= Number(formData.baselineYear)) {
      setValidationErrors({ targetYear: 'Target year must be after baseline year' });
      return false;
    }

    setValidationErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double-click

    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map scope to array format expected by the service
      const scopeMapping: Record<string, string[]> = {
        'scope1': ['Scope 1'],
        'scope2': ['Scope 2'],
        'scope3': ['Scope 3'],
        'multiple': ['Scope 1', 'Scope 2', 'Scope 3'],
      };

      const { data, error } = await goalsService.createGoal({
        title: formData.title,
        description: formData.description || undefined,
        baseline_emissions: Number(formData.baselineValue),
        baseline_year: Number(formData.baselineYear),
        target_emissions: Number(formData.targetValue),
        target_date: `${formData.targetYear}-12-31`,
        scope_covered: scopeMapping[formData.scope] || ['Scope 1'],
        status: 'not_started',
        milestones: milestones.filter(m => m.title).length > 0 ? milestones.filter(m => m.title) : undefined,
        metadata: {
          category: formData.category,
          priority: formData.priority,
          department: formData.department || undefined,
          owner: formData.owner || undefined,
          budget: formData.budget || undefined,
          resources: formData.resources || undefined,
          risks: risks.filter(r => r.risk).length > 0 ? risks.filter(r => r.risk) : undefined,
          dependencies: formData.dependencies || undefined,
          regulatoryFramework: formData.regulatoryFramework || undefined,
          reportingRequirements: formData.reportingRequirements || undefined,
          unit: formData.unit || 'tCO2e',
          methodology: formData.methodology || undefined,
        },
      });

      if (error) {
        throw new Error(error);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals-dashboard'] });

      toast.success('Goal created successfully!');
      onComplete?.();
    } catch (error: any) {
      console.error('Error creating goal:', error);
      toast.error(error.message || 'Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldError = (field: keyof ValidationErrors) => {
    if (!validationErrors[field]) return null;
    return (
      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {validationErrors[field]}
      </p>
    );
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
                      className={validationErrors.title ? 'border-destructive' : ''}
                    />
                    {renderFieldError('title')}
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger className={validationErrors.category ? 'border-destructive' : ''}>
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
                    {renderFieldError('category')}
                  </div>

                  <div>
                    <Label htmlFor="scope">Emission Scope *</Label>
                    <Select 
                      value={formData.scope}
                      onValueChange={(value) => setFormData({...formData, scope: value})}
                    >
                      <SelectTrigger className={validationErrors.scope ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scope1">Scope 1 - Direct Emissions</SelectItem>
                        <SelectItem value="scope2">Scope 2 - Indirect Energy</SelectItem>
                        <SelectItem value="scope3">Scope 3 - Value Chain</SelectItem>
                        <SelectItem value="multiple">Multiple Scopes</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderFieldError('scope')}
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority Level *</Label>
                    <Select 
                      value={formData.priority}
                      onValueChange={(value) => setFormData({...formData, priority: value})}
                    >
                      <SelectTrigger className={validationErrors.priority ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderFieldError('priority')}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
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
                        className={validationErrors.baselineValue ? 'border-destructive' : ''}
                      />
                      {renderFieldError('baselineValue')}
                    </div>
                    <div>
                      <Label htmlFor="baselineYear">Baseline Year *</Label>
                      <Input
                        id="baselineYear"
                        type="number"
                        value={formData.baselineYear}
                        onChange={(e) => setFormData({...formData, baselineYear: e.target.value})}
                        placeholder="e.g., 2020"
                        className={validationErrors.baselineYear ? 'border-destructive' : ''}
                      />
                      {renderFieldError('baselineYear')}
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit of Measurement</Label>
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
                        className={validationErrors.targetValue ? 'border-destructive' : ''}
                      />
                      {renderFieldError('targetValue')}
                    </div>
                    <div>
                      <Label htmlFor="targetYear">Target Year *</Label>
                      <Input
                        id="targetYear"
                        type="number"
                        value={formData.targetYear}
                        onChange={(e) => setFormData({...formData, targetYear: e.target.value})}
                        placeholder="e.g., 2030"
                        className={validationErrors.targetYear ? 'border-destructive' : ''}
                      />
                      {renderFieldError('targetYear')}
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
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
                              placeholder="How to mitigate"
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
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
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
                            <Label>Title</Label>
                            <Input
                              value={milestone.title}
                              onChange={(e) => {
                                const updated = milestones.map(m => 
                                  m.id === milestone.id ? {...m, title: e.target.value} : m
                                );
                                setMilestones(updated);
                              }}
                              placeholder="Milestone title"
                            />
                          </div>
                          <div>
                            <Label>Target Date</Label>
                            <Input
                              type="date"
                              value={milestone.date}
                              onChange={(e) => {
                                const updated = milestones.map(m => 
                                  m.id === milestone.id ? {...m, date: e.target.value} : m
                                );
                                setMilestones(updated);
                              }}
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={milestone.description}
                              onChange={(e) => {
                                const updated = milestones.map(m => 
                                  m.id === milestone.id ? {...m, description: e.target.value} : m
                                );
                                setMilestones(updated);
                              }}
                              placeholder="Brief description"
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
                      <SelectItem value="ghg-protocol">GHG Protocol</SelectItem>
                      <SelectItem value="sbti">Science Based Targets initiative (SBTi)</SelectItem>
                      <SelectItem value="cdp">CDP</SelectItem>
                      <SelectItem value="tcfd">TCFD</SelectItem>
                      <SelectItem value="csrd">CSRD</SelectItem>
                      <SelectItem value="sec-climate">SEC Climate Disclosure</SelectItem>
                      <SelectItem value="iso-14064">ISO 14064</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reportingRequirements">Reporting Requirements</Label>
                  <Textarea
                    id="reportingRequirements"
                    value={formData.reportingRequirements}
                    onChange={(e) => setFormData({...formData, reportingRequirements: e.target.value})}
                    placeholder="Describe any specific reporting requirements"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onComplete}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Goal'
                )}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedGoalForm;

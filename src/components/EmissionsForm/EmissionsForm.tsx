
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const EmissionsForm: React.FC = () => {
  const [formData, setFormData] = useState({
    date: '',
    category: '',
    subcategory: '',
    source: '',
    amount: '',
    unit: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    toast.success('Emission data submitted successfully!');
    // Reset form
    setFormData({
      date: '',
      category: '',
      subcategory: '',
      source: '',
      amount: '',
      unit: '',
    });
  };
  
  const subcategories: Record<string, string[]> = {
    'scope1': ['Stationary Combustion', 'Mobile Combustion', 'Process Emissions', 'Fugitive Emissions'],
    'scope2': ['Purchased Electricity', 'Purchased Heat', 'Purchased Steam', 'Purchased Cooling'],
    'scope3': ['Business Travel', 'Employee Commuting', 'Waste Generated', 'Purchased Goods & Services', 'Transportation & Distribution'],
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Record Emissions Data</CardTitle>
        <CardDescription>Enter details about your carbon emissions to track and analyze your organization's footprint.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Reporting Date</Label>
              <Input 
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Emissions Category</Label>
              <Select 
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scope1">Scope 1 (Direct Emissions)</SelectItem>
                  <SelectItem value="scope2">Scope 2 (Indirect Emissions - Energy)</SelectItem>
                  <SelectItem value="scope3">Scope 3 (Other Indirect Emissions)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.category && (
              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select 
                  value={formData.subcategory}
                  onValueChange={(value) => handleSelectChange('subcategory', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories[formData.category]?.map((subcat) => (
                      <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="source">Emission Source</Label>
              <Input 
                id="source"
                name="source"
                placeholder="e.g., Natural Gas, Company Vehicles, Flight Travel"
                value={formData.source}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="e.g., 1000"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select 
                  value={formData.unit}
                  onValueChange={(value) => handleSelectChange('unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kWh">kWh</SelectItem>
                    <SelectItem value="MWh">MWh</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="tonnes">Tonnes</SelectItem>
                    <SelectItem value="km">Kilometers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="button" variant="outline" className="mr-2">Cancel</Button>
            <Button type="submit" className="bg-carbon hover:bg-carbon-dark">Save Emission Data</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmissionsForm;

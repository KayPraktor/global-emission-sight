
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/ui/page-header';
import { BreadcrumbNav } from '@/components/navigation/BreadcrumbNav';
import GoalsDashboard from '@/components/Goals/GoalsDashboard';
import EnhancedGoalForm from '@/components/Goals/EnhancedGoalForm';
import ProfessionalGoalsList from '@/components/Goals/ProfessionalGoalsList';
import GoalsAnalytics from '@/components/Goals/GoalsAnalytics';

const GoalsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <BreadcrumbNav />
        <PageHeader
          title="Sustainability Goals & Targets" 
          subtitle="Comprehensive goal management with advanced tracking, analytics, and professional workflows"
          actions={
            <div className="flex gap-2">
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <EnhancedGoalForm onComplete={() => setOpenDialog(false)} />
                </DialogContent>
              </Dialog>
            </div>
          }
        />

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="goals">All Goals</TabsTrigger>
            <TabsTrigger value="scope1">Scope 1</TabsTrigger>
            <TabsTrigger value="scope2">Scope 2</TabsTrigger>
            <TabsTrigger value="scope3">Scope 3</TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <GoalsDashboard />
          </TabsContent>
          
          <TabsContent value="goals">
            <ProfessionalGoalsList />
          </TabsContent>
          
          <TabsContent value="scope1">
            <ProfessionalGoalsList scope="Scope 1" />
          </TabsContent>
          
          <TabsContent value="scope2">
            <ProfessionalGoalsList scope="Scope 2" />
          </TabsContent>
          
          <TabsContent value="scope3">
            <ProfessionalGoalsList scope="Scope 3" />
          </TabsContent>

          <TabsContent value="analytics">
            <GoalsAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GoalsPage;

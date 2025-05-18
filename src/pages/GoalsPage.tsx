
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Plus, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GoalForm from '@/components/Goals/GoalForm';
import GoalsList from '@/components/Goals/GoalsList';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/ui/page-header';

const GoalsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <PageHeader 
          title="Emissions Goals & Targets" 
          subtitle="Set, track and manage your organization's sustainability goals"
          actions={
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <GoalForm onComplete={() => setOpenDialog(false)} />
              </DialogContent>
            </Dialog>
          }
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-2 text-center mb-2">
                <Target className="h-8 w-8 text-green-500" />
                <h3 className="font-semibold text-xl">8</h3>
                <p className="text-sm text-muted-foreground">Active Goals</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-2 text-center mb-2">
                <CheckCircle className="h-8 w-8 text-blue-500" />
                <h3 className="font-semibold text-xl">3</h3>
                <p className="text-sm text-muted-foreground">On Track</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-2 text-center mb-2">
                <AlertCircle className="h-8 w-8 text-amber-500" />
                <h3 className="font-semibold text-xl">2</h3>
                <p className="text-sm text-muted-foreground">At Risk</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Goals</TabsTrigger>
            <TabsTrigger value="scope1">Scope 1</TabsTrigger>
            <TabsTrigger value="scope2">Scope 2</TabsTrigger>
            <TabsTrigger value="scope3">Scope 3</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <GoalsList />
          </TabsContent>
          
          <TabsContent value="scope1">
            <GoalsList scope="Scope 1" />
          </TabsContent>
          
          <TabsContent value="scope2">
            <GoalsList scope="Scope 2" />
          </TabsContent>
          
          <TabsContent value="scope3">
            <GoalsList scope="Scope 3" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GoalsPage;

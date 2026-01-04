import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { Stakeholder, InfluenceLevel, StakeholderCategory } from '@/types/materiality';
import { 
  getMockStakeholders, 
  STAKEHOLDER_CATEGORIES, 
  ENGAGEMENT_METHODS,
  saveStakeholder,
  deleteStakeholder as deleteStakeholderApi,
  getStakeholders
} from '@/services/materialityService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const StakeholderMapping: React.FC = () => {
  const { user } = useAuth();
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'investors' as StakeholderCategory,
    influence: 'medium' as InfluenceLevel,
    interest: 'medium' as InfluenceLevel,
    engagementMethods: [] as string[],
  });

  useEffect(() => {
    loadStakeholders();
  }, []);

  const loadStakeholders = async () => {
    try {
      const data = await getStakeholders();
      if (data.length === 0) {
        setStakeholders(getMockStakeholders());
      } else {
        setStakeholders(data);
      }
    } catch {
      setStakeholders(getMockStakeholders());
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Please enter a stakeholder name');
      return;
    }

    try {
      if (user) {
        await saveStakeholder({
          userId: user.id,
          name: formData.name,
          category: formData.category,
          influence: formData.influence,
          interest: formData.interest,
          engagementMethods: formData.engagementMethods,
          topicPriorities: [],
        });
        await loadStakeholders();
      } else {
        const newStakeholder: Stakeholder = {
          id: Date.now().toString(),
          userId: 'demo',
          name: formData.name,
          category: formData.category,
          influence: formData.influence,
          interest: formData.interest,
          engagementMethods: formData.engagementMethods,
          topicPriorities: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setStakeholders(prev => [...prev, newStakeholder]);
      }
      
      setIsDialogOpen(false);
      setFormData({ name: '', category: 'investors', influence: 'medium', interest: 'medium', engagementMethods: [] });
      toast.success('Stakeholder added successfully');
    } catch {
      toast.error('Failed to save stakeholder');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (user) {
        await deleteStakeholderApi(id);
      }
      setStakeholders(prev => prev.filter(s => s.id !== id));
      toast.success('Stakeholder removed');
    } catch {
      toast.error('Failed to delete stakeholder');
    }
  };

  const getInfluenceColor = (level: InfluenceLevel) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getQuadrant = (influence: InfluenceLevel, interest: InfluenceLevel) => {
    if (influence === 'high' && interest === 'high') return 'Manage Closely';
    if (influence === 'high' && interest !== 'high') return 'Keep Satisfied';
    if (influence !== 'high' && interest === 'high') return 'Keep Informed';
    return 'Monitor';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stakeholder Mapping</h2>
          <p className="text-muted-foreground">Identify and manage key stakeholder groups</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Stakeholder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStakeholder ? 'Edit' : 'Add'} Stakeholder</DialogTitle>
              <DialogDescription>Define stakeholder group and their characteristics</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Institutional Investors"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: StakeholderCategory) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAKEHOLDER_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Influence Level</Label>
                  <Select
                    value={formData.influence}
                    onValueChange={(value: InfluenceLevel) => setFormData(prev => ({ ...prev, influence: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Interest Level</Label>
                  <Select
                    value={formData.interest}
                    onValueChange={(value: InfluenceLevel) => setFormData(prev => ({ ...prev, interest: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Engagement Methods</Label>
                <div className="flex flex-wrap gap-2">
                  {ENGAGEMENT_METHODS.slice(0, 6).map(method => (
                    <Badge
                      key={method}
                      variant={formData.engagementMethods.includes(method) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          engagementMethods: prev.engagementMethods.includes(method)
                            ? prev.engagementMethods.filter(m => m !== method)
                            : [...prev.engagementMethods, method]
                        }));
                      }}
                    >
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">Save Stakeholder</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Influence-Interest Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Interest-Influence Matrix
          </CardTitle>
          <CardDescription>Stakeholder positioning for engagement prioritization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 aspect-square max-w-2xl mx-auto">
            {/* High Influence, Low Interest */}
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Keep Satisfied</h4>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-3">High influence, low interest</p>
              <div className="space-y-2">
                {stakeholders.filter(s => s.influence === 'high' && s.interest !== 'high').map(s => (
                  <Badge key={s.id} variant="secondary" className="mr-1">{s.name}</Badge>
                ))}
              </div>
            </div>
            
            {/* High Influence, High Interest */}
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Manage Closely</h4>
              <p className="text-xs text-red-600 dark:text-red-400 mb-3">High influence, high interest</p>
              <div className="space-y-2">
                {stakeholders.filter(s => s.influence === 'high' && s.interest === 'high').map(s => (
                  <Badge key={s.id} variant="secondary" className="mr-1">{s.name}</Badge>
                ))}
              </div>
            </div>
            
            {/* Low Influence, Low Interest */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Monitor</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Low influence, low interest</p>
              <div className="space-y-2">
                {stakeholders.filter(s => s.influence !== 'high' && s.interest !== 'high').map(s => (
                  <Badge key={s.id} variant="secondary" className="mr-1">{s.name}</Badge>
                ))}
              </div>
            </div>
            
            {/* Low Influence, High Interest */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Keep Informed</h4>
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">Low influence, high interest</p>
              <div className="space-y-2">
                {stakeholders.filter(s => s.influence !== 'high' && s.interest === 'high').map(s => (
                  <Badge key={s.id} variant="secondary" className="mr-1">{s.name}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder List */}
      <Card>
        <CardHeader>
          <CardTitle>Stakeholder Registry</CardTitle>
          <CardDescription>{stakeholders.length} stakeholder groups identified</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stakeholders.map(stakeholder => (
              <div key={stakeholder.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{stakeholder.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {STAKEHOLDER_CATEGORIES.find(c => c.value === stakeholder.category)?.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Influence: <Badge className={getInfluenceColor(stakeholder.influence)}>{stakeholder.influence}</Badge>
                    </span>
                    <span className="flex items-center gap-1">
                      Interest: <Badge className={getInfluenceColor(stakeholder.interest)}>{stakeholder.interest}</Badge>
                    </span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {getQuadrant(stakeholder.influence, stakeholder.interest)}
                    </span>
                  </div>
                  {stakeholder.lastEngaged && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Last engaged: {new Date(stakeholder.lastEngaged).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(stakeholder.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StakeholderMapping;

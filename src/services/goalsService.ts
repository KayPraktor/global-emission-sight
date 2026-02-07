import { supabase } from '@/integrations/supabase/client';
import { startOfYear, endOfYear } from 'date-fns';

export interface Goal {
  id: string;
  user_id: string;
  facility_id?: string;
  title: string;
  description?: string;
  baseline_emissions?: number;
  baseline_year?: number;
  target_emissions?: number;
  target_date: string;
  target_reduction_percentage?: number;
  scope_covered?: string[];
  status: 'not_started' | 'in_progress' | 'at_risk' | 'overdue' | 'completed';
  current_emissions?: number;
  progress_percentage?: number;
  milestones?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface GoalWithProgress extends Goal {
  actualEmissions: number;
  progressPercentage: number;
  isOnTrack: boolean;
  trend: 'up' | 'down';
}

class GoalsService {
  /**
   * Fetch all goals for the authenticated user
   */
  async getGoals(scope?: string): Promise<{ data: Goal[] | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      let query = supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (scope) {
        query = query.contains('scope_covered', [scope]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching goals:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Calculate actual progress for goals based on real emissions data
   */
  async getGoalsWithProgress(scope?: string): Promise<{ data: GoalWithProgress[] | null; error: string | null }> {
    try {
      const { data: goals, error: goalsError } = await this.getGoals(scope);
      
      if (goalsError || !goals) {
        return { data: null, error: goalsError };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Fetch current year emissions for progress calculation
      const currentYear = new Date().getFullYear();
      const yearStart = startOfYear(new Date()).toISOString();
      const yearEnd = endOfYear(new Date()).toISOString();

      // Use Promise.allSettled to handle partial failures gracefully
      const goalsWithProgressResults = await Promise.allSettled(
        goals.map(async (goal) => {
          try {
            // Calculate actual emissions for the current period
            let query = supabase
              .from('emissions_entries')
              .select('calculations(calculated_emissions), scope')
              .eq('user_id', user.id)
              .gte('entry_date', yearStart)
              .lte('entry_date', yearEnd);

            // Filter by facility if goal is facility-specific
            if (goal.facility_id) {
              query = query.eq('facility_id', goal.facility_id);
            }

            // Filter by scope if goal has scope coverage
            if (goal.scope_covered && goal.scope_covered.length > 0) {
              const scopes = goal.scope_covered.map(s => {
                if (s === 'Scope 1') return 'S1';
                if (s === 'Scope 2') return 'S2';
                if (s === 'Scope 3') return 'S3';
                return s;
              });
              query = query.in('scope', scopes as any);
            }

            const { data: entries, error: entriesError } = await query;

            if (entriesError) {
              console.error('Error fetching emissions for goal:', entriesError);
            }

            const actualEmissions = entries?.reduce((sum, entry: any) => {
              return sum + (entry.calculations?.[0]?.calculated_emissions || 0);
            }, 0) || 0;

            // Calculate progress percentage
            let progressPercentage = 0;
            if (goal.baseline_emissions && goal.target_emissions !== undefined) {
              const targetReduction = goal.baseline_emissions - goal.target_emissions;
              const actualReduction = goal.baseline_emissions - actualEmissions;
              progressPercentage = targetReduction > 0 
                ? Math.min(100, Math.max(0, (actualReduction / targetReduction) * 100))
                : 0;
            } else if (goal.target_reduction_percentage && goal.baseline_emissions) {
              const targetEmissions = goal.baseline_emissions * (1 - goal.target_reduction_percentage / 100);
              const targetReduction = goal.baseline_emissions - targetEmissions;
              const actualReduction = goal.baseline_emissions - actualEmissions;
              progressPercentage = targetReduction > 0
                ? Math.min(100, Math.max(0, (actualReduction / targetReduction) * 100))
                : 0;
            }

            // Determine if on track (within 10% of expected progress based on time)
            const targetDate = new Date(goal.target_date);
            const baselineDate = new Date(goal.baseline_year || currentYear - 1, 0, 1);
            const totalDays = (targetDate.getTime() - baselineDate.getTime()) / (1000 * 60 * 60 * 24);
            const elapsedDays = (new Date().getTime() - baselineDate.getTime()) / (1000 * 60 * 60 * 24);
            const expectedProgress = (elapsedDays / totalDays) * 100;
            const isOnTrack = progressPercentage >= expectedProgress - 10;

            // Determine trend (comparing to previous update)
            const trend: 'up' | 'down' = (goal.progress_percentage || 0) < progressPercentage ? 'up' : 'down';

            return {
              ...goal,
              actualEmissions,
              progressPercentage: Math.round(progressPercentage),
              isOnTrack,
              trend,
            } as GoalWithProgress;
          } catch (error) {
            // Return a default state for failed goals rather than crashing the whole operation
            console.warn(`Failed to calculate progress for goal ${goal.id}:`, error);
            return {
              ...goal,
              actualEmissions: 0,
              progressPercentage: 0,
              isOnTrack: false,
              trend: 'down' as const,
            } as GoalWithProgress;
          }
        })
      );

      // Filter out rejected promises and extract fulfilled values
      const goalsWithProgress = goalsWithProgressResults
        .filter((result): result is PromiseFulfilledResult<GoalWithProgress> => result.status === 'fulfilled')
        .map(result => result.value);

      return { data: goalsWithProgress, error: null };
    } catch (error: any) {
      console.error('Error calculating goals with progress:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update goal progress based on current emissions
   */
  async updateGoalProgress(goalId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: goals, error } = await this.getGoalsWithProgress();
      
      if (error || !goals) {
        return { success: false, error };
      }

      const goal = goals.find(g => g.id === goalId);
      if (!goal) {
        return { success: false, error: 'Goal not found' };
      }

      // Update the goal with new progress
      const { error: updateError } = await supabase
        .from('goals')
        .update({
          current_emissions: goal.actualEmissions,
          progress_percentage: goal.progressPercentage,
          status: goal.isOnTrack ? 'in_progress' : 'at_risk',
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId);

      if (updateError) {
        console.error('Error updating goal progress:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error updating goal progress:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new goal
   */
  async createGoal(goalData: Partial<Goal>): Promise<{ data: Goal | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('goals')
        .insert([{
          ...goalData,
          user_id: user.id,
        }] as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating goal:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating goal:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update a goal
   */
  async updateGoal(goalId: string, goalData: Partial<Goal>): Promise<{ data: Goal | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', goalId)
        .select()
        .single();

      if (error) {
        console.error('Error updating goal:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating goal:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Delete a goal
   */
  async deleteGoal(goalId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) {
        console.error('Error deleting goal:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      return { success: false, error: error.message };
    }
  }
}

export const goalsService = new GoalsService();

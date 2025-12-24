import { supabase } from "@/integrations/supabase/client";

export type CarbonCreditType = 'VCU' | 'GCC' | 'CER' | 'EUA' | 'ACR' | 'CAR' | 'GS_VER' | 'OTHER';
export type CarbonCreditStatus = 'active' | 'retired' | 'sold' | 'pending';

export interface CarbonCredit {
  id: string;
  organization_id: string | null;
  user_id: string;
  credit_type: CarbonCreditType;
  vintage_year: number;
  quantity: number;
  purchase_price: number | null;
  current_price: number | null;
  currency: string;
  registry: string | null;
  project_name: string | null;
  project_type: string | null;
  project_location: string | null;
  status: CarbonCreditStatus;
  purchase_date: string | null;
  retirement_date: string | null;
  retirement_purpose: string | null;
  serial_numbers: string[] | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface CarbonPrice {
  id: string;
  price_type: string;
  price_per_tonne: number;
  currency: string;
  effective_date: string;
  source: string | null;
  created_at: string;
}

export interface PortfolioSummary {
  totalCredits: number;
  totalValue: number;
  totalCost: number;
  unrealizedGainLoss: number;
  gainLossPercentage: number;
  byType: { type: CarbonCreditType; quantity: number; value: number }[];
  byStatus: { status: CarbonCreditStatus; quantity: number }[];
  byVintage: { year: number; quantity: number }[];
}

export interface AddCreditInput {
  credit_type: CarbonCreditType;
  vintage_year: number;
  quantity: number;
  purchase_price?: number;
  registry?: string;
  project_name?: string;
  project_type?: string;
  project_location?: string;
  purchase_date?: string;
  serial_numbers?: string[];
}

export const carbonCreditService = {
  async addCredit(input: AddCreditInput): Promise<CarbonCredit | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userData.user.id)
      .single();

    // Get current market price
    const currentPrice = await this.getMarketPrice(input.credit_type);

    const { data, error } = await (supabase
      .from('carbon_credits' as any)
      .insert({
        user_id: userData.user.id,
        organization_id: orgMember?.organization_id || null,
        credit_type: input.credit_type,
        vintage_year: input.vintage_year,
        quantity: input.quantity,
        purchase_price: input.purchase_price || null,
        current_price: currentPrice,
        registry: input.registry || null,
        project_name: input.project_name || null,
        project_type: input.project_type || null,
        project_location: input.project_location || null,
        purchase_date: input.purchase_date || null,
        serial_numbers: input.serial_numbers || null,
        status: 'active',
      } as any)
      .select()
      .single()) as { data: CarbonCredit | null; error: any };

    if (error) {
      console.error('Failed to add carbon credit:', error);
      return null;
    }

    return data;
  },

  async retireCredits(
    creditId: string,
    quantity: number,
    purpose: string
  ): Promise<boolean> {
    const { data: credit } = await (supabase
      .from('carbon_credits' as any)
      .select('*')
      .eq('id', creditId)
      .single()) as { data: CarbonCredit | null; error: any };

    if (!credit || credit.quantity < quantity) {
      console.error('Insufficient credits or credit not found');
      return false;
    }

    if (credit.quantity === quantity) {
      // Retire entire credit
      const { error } = await (supabase
        .from('carbon_credits' as any)
        .update({
          status: 'retired',
          retirement_date: new Date().toISOString().split('T')[0],
          retirement_purpose: purpose,
        } as any)
        .eq('id', creditId)) as { error: any };

      return !error;
    } else {
      // Partial retirement - split the credit
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      // Update original with reduced quantity
      await (supabase
        .from('carbon_credits' as any)
        .update({ quantity: credit.quantity - quantity } as any)
        .eq('id', creditId)) as { error: any };

      // Create new retired credit record
      await (supabase
        .from('carbon_credits' as any)
        .insert({
          user_id: userData.user.id,
          organization_id: credit.organization_id,
          credit_type: credit.credit_type,
          vintage_year: credit.vintage_year,
          quantity: quantity,
          purchase_price: credit.purchase_price,
          current_price: credit.current_price,
          registry: credit.registry,
          project_name: credit.project_name,
          project_type: credit.project_type,
          status: 'retired',
          retirement_date: new Date().toISOString().split('T')[0],
          retirement_purpose: purpose,
        } as any)
        .select()) as { data: any; error: any };

      return true;
    }
  },

  async getPortfolio(): Promise<CarbonCredit[]> {
    const { data, error } = await (supabase
      .from('carbon_credits' as any)
      .select('*')
      .order('created_at', { ascending: false })) as { data: CarbonCredit[] | null; error: any };

    if (error) {
      console.error('Failed to fetch portfolio:', error);
      return [];
    }

    return data || [];
  },

  async getActiveCredits(): Promise<CarbonCredit[]> {
    const { data, error } = await (supabase
      .from('carbon_credits' as any)
      .select('*')
      .eq('status', 'active')
      .order('vintage_year', { ascending: false })) as { data: CarbonCredit[] | null; error: any };

    if (error) {
      console.error('Failed to fetch active credits:', error);
      return [];
    }

    return data || [];
  },

  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const credits = await this.getPortfolio();
    const marketPrices = await this.getAllMarketPrices();

    let totalCredits = 0;
    let totalValue = 0;
    let totalCost = 0;
    const byType: Record<string, { quantity: number; value: number }> = {};
    const byStatus: Record<string, number> = {};
    const byVintage: Record<number, number> = {};

    for (const credit of credits) {
      if (credit.status !== 'active') continue;

      const marketPrice = marketPrices.find(p => p.price_type === credit.credit_type)?.price_per_tonne || 0;
      const creditValue = credit.quantity * marketPrice;
      const creditCost = credit.quantity * (credit.purchase_price || 0);

      totalCredits += credit.quantity;
      totalValue += creditValue;
      totalCost += creditCost;

      // By type
      if (!byType[credit.credit_type]) {
        byType[credit.credit_type] = { quantity: 0, value: 0 };
      }
      byType[credit.credit_type].quantity += credit.quantity;
      byType[credit.credit_type].value += creditValue;

      // By status
      byStatus[credit.status] = (byStatus[credit.status] || 0) + credit.quantity;

      // By vintage
      byVintage[credit.vintage_year] = (byVintage[credit.vintage_year] || 0) + credit.quantity;
    }

    const unrealizedGainLoss = totalValue - totalCost;
    const gainLossPercentage = totalCost > 0 ? (unrealizedGainLoss / totalCost) * 100 : 0;

    return {
      totalCredits,
      totalValue,
      totalCost,
      unrealizedGainLoss,
      gainLossPercentage,
      byType: Object.entries(byType).map(([type, data]) => ({
        type: type as CarbonCreditType,
        ...data,
      })),
      byStatus: Object.entries(byStatus).map(([status, quantity]) => ({
        status: status as CarbonCreditStatus,
        quantity,
      })),
      byVintage: Object.entries(byVintage)
        .map(([year, quantity]) => ({ year: parseInt(year), quantity }))
        .sort((a, b) => b.year - a.year),
    };
  },

  async getMarketPrice(creditType: CarbonCreditType): Promise<number> {
    const { data, error } = await (supabase
      .from('carbon_prices' as any)
      .select('price_per_tonne')
      .eq('price_type', creditType)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single()) as { data: { price_per_tonne: number } | null; error: any };

    if (error || !data) return 0;
    return data.price_per_tonne;
  },

  async getAllMarketPrices(): Promise<CarbonPrice[]> {
    const { data, error } = await (supabase
      .from('carbon_prices' as any)
      .select('*')
      .order('effective_date', { ascending: false })) as { data: CarbonPrice[] | null; error: any };

    if (error) {
      console.error('Failed to fetch market prices:', error);
      return [];
    }

    // Get latest price for each type
    const latestPrices: Record<string, CarbonPrice> = {};
    for (const price of data || []) {
      if (!latestPrices[price.price_type]) {
        latestPrices[price.price_type] = price;
      }
    }

    return Object.values(latestPrices);
  },

  async updateMarketPrices(): Promise<void> {
    // In a real app, this would fetch from an API
    // For now, we'll simulate small price changes
    const prices = await this.getAllMarketPrices();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    for (const price of prices) {
      const change = (Math.random() - 0.5) * 2; // -1 to +1 change
      const newPrice = Math.max(1, price.price_per_tonne + change);

      await (supabase
        .from('carbon_prices' as any)
        .insert({
          price_type: price.price_type,
          price_per_tonne: parseFloat(newPrice.toFixed(2)),
          currency: price.currency,
          effective_date: new Date().toISOString().split('T')[0],
          source: price.source,
        } as any)) as { error: any };
    }
  },

  async getRetiredCredits(): Promise<CarbonCredit[]> {
    const { data, error } = await (supabase
      .from('carbon_credits' as any)
      .select('*')
      .eq('status', 'retired')
      .order('retirement_date', { ascending: false })) as { data: CarbonCredit[] | null; error: any };

    if (error) {
      console.error('Failed to fetch retired credits:', error);
      return [];
    }

    return data || [];
  },

  async getTotalRetiredQuantity(): Promise<number> {
    const retired = await this.getRetiredCredits();
    return retired.reduce((sum, credit) => sum + credit.quantity, 0);
  },

  async deleteCredit(creditId: string): Promise<boolean> {
    const { error } = await (supabase
      .from('carbon_credits' as any)
      .delete()
      .eq('id', creditId)) as { error: any };

    return !error;
  },
};

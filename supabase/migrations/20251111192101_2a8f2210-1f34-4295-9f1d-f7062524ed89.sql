-- Enable realtime for emissions_entries table
ALTER PUBLICATION supabase_realtime ADD TABLE public.emissions_entries;

-- Enable realtime for calculations table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.calculations;

-- Enable realtime for facilities table
ALTER PUBLICATION supabase_realtime ADD TABLE public.facilities;
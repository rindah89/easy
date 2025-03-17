-- Create user_addresses table
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  address_name VARCHAR NOT NULL,
  address VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  state VARCHAR NOT NULL,
  postal_code VARCHAR,
  country VARCHAR NOT NULL DEFAULT 'Cameroon',
  coordinates GEOGRAPHY(POINT),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own addresses
CREATE POLICY "Users can view their own addresses" 
  ON public.user_addresses
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own addresses
CREATE POLICY "Users can insert their own addresses" 
  ON public.user_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own addresses
CREATE POLICY "Users can update their own addresses" 
  ON public.user_addresses
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete their own addresses
CREATE POLICY "Users can delete their own addresses" 
  ON public.user_addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Add function to ensure only one default address per user
CREATE OR REPLACE FUNCTION public.handle_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.user_addresses
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for handling default addresses
DROP TRIGGER IF EXISTS ensure_single_default_address ON public.user_addresses;
CREATE TRIGGER ensure_single_default_address
  BEFORE INSERT OR UPDATE OF is_default
  ON public.user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_default_address();

-- Add index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);

-- Grant appropriate permissions
GRANT ALL ON public.user_addresses TO authenticated; 
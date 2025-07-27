-- Add reference_number field to loans table
ALTER TABLE loans ADD COLUMN reference_number TEXT;

-- Create index for reference_number for better performance
CREATE INDEX idx_loans_reference_number ON loans(reference_number);
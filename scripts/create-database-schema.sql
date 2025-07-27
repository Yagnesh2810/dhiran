-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    mobile TEXT NOT NULL,
    first_loan_date DATE NOT NULL,
    total_loan_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_interest DECIMAL(15,2) NOT NULL DEFAULT 0,
    loan_item TEXT NOT NULL,
    notes TEXT,
    interest_rate DECIMAL(5,2) NOT NULL,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    remaining_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    start_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'સક્રિય',
    total_interest DECIMAL(15,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    remaining_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    loan_item TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create repayments table
CREATE TABLE IF NOT EXISTS repayments (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    interest_info DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_given DECIMAL(15,2) NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    receipt_id TEXT NOT NULL,
    notes TEXT,
    verification_images TEXT[], -- Array of image URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fund_transactions table
CREATE TABLE IF NOT EXISTS fund_transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('add', 'remove')),
    amount DECIMAL(15,2) NOT NULL,
    reason TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create history table
CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    customer_id TEXT,
    customer_name TEXT,
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_start_date ON loans(start_date);
CREATE INDEX IF NOT EXISTS idx_repayments_customer_id ON repayments(customer_id);
CREATE INDEX IF NOT EXISTS idx_repayments_date ON repayments(date);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_date ON fund_transactions(date);
CREATE INDEX IF NOT EXISTS idx_history_date ON history(date);
CREATE INDEX IF NOT EXISTS idx_history_customer_id ON history(customer_id);

-- Create storage bucket for verification images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-images', 'verification-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for verification images
CREATE POLICY "Allow public access to verification images" ON storage.objects
FOR SELECT USING (bucket_id = 'verification-images');

CREATE POLICY "Allow authenticated users to upload verification images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'verification-images');

CREATE POLICY "Allow authenticated users to update verification images" ON storage.objects
FOR UPDATE USING (bucket_id = 'verification-images');

CREATE POLICY "Allow authenticated users to delete verification images" ON storage.objects
FOR DELETE USING (bucket_id = 'verification-images');

-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS history CASCADE;
DROP TABLE IF EXISTS repayments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS fund_transactions CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Create customers table
CREATE TABLE customers (
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
CREATE TABLE loans (
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
CREATE TABLE repayments (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    interest_info DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_given DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_date DATE NOT NULL,
    receipt_id TEXT NOT NULL,
    notes TEXT,
    verification_images TEXT[], -- Array of image URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fund_transactions table
CREATE TABLE fund_transactions (
    id TEXT PRIMARY KEY,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('add', 'remove')),
    amount DECIMAL(15,2) NOT NULL,
    reason TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create history table
CREATE TABLE history (
    id TEXT PRIMARY KEY,
    activity_type TEXT NOT NULL,
    customer_id TEXT,
    customer_name TEXT,
    amount DECIMAL(15,2) NOT NULL,
    activity_date DATE NOT NULL,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customers_mobile ON customers(mobile);
CREATE INDEX idx_customers_created_at ON customers(created_at);

CREATE INDEX idx_loans_customer_id ON loans(customer_id);
CREATE INDEX idx_loans_start_date ON loans(start_date);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_created_at ON loans(created_at);

CREATE INDEX idx_repayments_customer_id ON repayments(customer_id);
CREATE INDEX idx_repayments_payment_date ON repayments(payment_date);
CREATE INDEX idx_repayments_created_at ON repayments(created_at);

CREATE INDEX idx_fund_transactions_date ON fund_transactions(transaction_date);
CREATE INDEX idx_fund_transactions_type ON fund_transactions(transaction_type);
CREATE INDEX idx_fund_transactions_created_at ON fund_transactions(created_at);

CREATE INDEX idx_history_activity_date ON history(activity_date);
CREATE INDEX idx_history_customer_id ON history(customer_id);
CREATE INDEX idx_history_activity_type ON history(activity_type);
CREATE INDEX idx_history_created_at ON history(created_at);

-- Insert sample data
INSERT INTO customers (id, name, city, mobile, first_loan_date, total_loan_amount, total_interest, loan_item, notes, interest_rate, paid_amount, remaining_amount) VALUES
('CID01', 'રાજેશ પટેલ', 'અમદાવાદ', '9876543210', '2024-01-15', 50000.00, 5200.00, 'સોનું', 'સારો ગ્રાહક', 2.5, 15000.00, 40200.00),
('CID02', 'પ્રિયા શાહ', 'સુરત', '9876543211', '2024-02-10', 75000.00, 7800.00, 'રોકડ', 'નિયમિત ચુકવણી', 3.0, 25000.00, 57800.00);

INSERT INTO loans (id, customer_id, customer_name, amount, interest_rate, start_date, status, total_interest, paid_amount, remaining_amount, loan_item, notes) VALUES
('L001', 'CID01', 'રાજેશ પટેલ', 50000.00, 2.5, '2024-01-15', 'સક્રિય', 5200.00, 15000.00, 40200.00, 'સોનું', 'પ્રથમ લોન'),
('L002', 'CID02', 'પ્રિયા શાહ', 75000.00, 3.0, '2024-02-10', 'સક્રિય', 7800.00, 25000.00, 57800.00, 'રોકડ', 'બીજી લોન');

INSERT INTO repayments (id, customer_id, customer_name, amount, interest_info, discount_given, payment_date, receipt_id, notes) VALUES
('R001', 'CID01', 'રાજેશ પટેલ', 15000.00, 2500.00, 0.00, '2024-03-15', 'RCP001', 'પ્રથમ ચુકવણી'),
('R002', 'CID02', 'પ્રિયા શાહ', 25000.00, 4000.00, 0.00, '2024-03-20', 'RCP002', 'આંશિક ચુકવણી');

INSERT INTO history (id, activity_type, customer_id, customer_name, amount, activity_date, status, description) VALUES
('H001', 'લોન આપેલ', 'CID01', 'રાજેશ પટેલ', 50000.00, '2024-01-15', 'સક્રિય', 'પ્રથમ લોન'),
('H002', 'ચુકવણી મળેલ', 'CID01', 'રાજેશ પટેલ', 15000.00, '2024-03-15', 'પૂર્ણ', 'આંશિક ચુકવણી');

-- Create storage bucket for verification images (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-images', 'verification-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for verification images
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public access to verification images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to upload verification images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to update verification images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to delete verification images" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Allow public access to verification images" ON storage.objects
    FOR SELECT USING (bucket_id = 'verification-images');

    CREATE POLICY "Allow authenticated users to upload verification images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'verification-images');

    CREATE POLICY "Allow authenticated users to update verification images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'verification-images');

    CREATE POLICY "Allow authenticated users to delete verification images" ON storage.objects
    FOR DELETE USING (bucket_id = 'verification-images');
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Storage policies creation failed or already exist: %', SQLERRM;
END $$;

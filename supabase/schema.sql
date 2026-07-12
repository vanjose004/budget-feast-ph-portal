CREATE TABLE bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name text NOT NULL,
  contact_number text,
  facebook text,
  event_type text,
  event_date date,
  buffet_time text,
  venue text,
  pax integer,
  package text,
  add_ons text,
  total_amount numeric,
  amount_paid numeric DEFAULT 0,
  balance numeric,
  payment_scheme text,
  payment_status text DEFAULT 'Unpaid',
  notes text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES bookings(id),
  amount numeric,
  payment_type text,
  mode_of_payment text,
  date_paid date,
  received_by text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  category text,
  description text,
  amount numeric,
  created_at timestamp DEFAULT now()
);

CREATE TABLE clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  contact_number text,
  facebook text,
  address text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE,
  value text,
  updated_at timestamp DEFAULT now()
);

INSERT INTO settings (key, value) VALUES
('business_name', 'Budget Feast PH'),
('address', 'Sta. Clara, Santa Maria, Bulacan'),
('contact', ''),
('package_starter_price', '18000'),
('package_classic_price', '22000'),
('package_grand_price', '27000');

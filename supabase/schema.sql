CREATE TABLE bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name text NOT NULL,
  contact_number text,
  facebook text,
  client_address text,
  event_type text,
  event_date date,
  buffet_time text,
  venue text,
  pax integer,
  package text,
  add_ons text,
  selected_menu text,
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

CREATE TABLE menu_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  dish_name text NOT NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp DEFAULT now()
);

INSERT INTO settings (key, value) VALUES
('business_name', 'Budget Feast PH'),
('address', 'Sta. Clara, Santa Maria, Bulacan'),
('contact', ''),
('package_starter_price', '18000'),
('package_classic_price', '22000'),
('package_grand_price', '27000');

ALTER TABLE bookings ADD COLUMN client_address text;
ALTER TABLE bookings ADD COLUMN selected_menu text;

INSERT INTO menu_items (category, dish_name, sort_order) VALUES
('chicken', 'Chicken BBQ', 0),
('chicken', 'Chicken Afritada', 1),
('chicken', 'Chicken Pastel', 2),
('chicken', 'Honey Garlic Chicken', 3),
('chicken', 'Chicken Hamonado', 4),
('chicken', 'Fried Chicken', 5),
('pork', 'Pork Menudo', 0),
('pork', 'Pork Hamonado', 1),
('pork', 'Pork Asado', 2),
('pork', 'Sweet & Sour Pork', 3),
('pork', 'Pork BBQ Strips', 4),
('pork', 'Lechon Kawali', 5),
('pork', 'Pork Humba', 6),
('pork', 'Crispy Pork Kare-Kare', 7),
('pastaNoodles', 'Carbonara', 0),
('pastaNoodles', 'Filipino Spaghetti', 1),
('pastaNoodles', 'Baked Macaroni', 2),
('pastaNoodles', 'Pancit Bihon Guisado', 3),
('pastaNoodles', 'Pesto Pasta', 4),
('beef', 'Beef Caldereta', 0),
('beef', 'Beef Mechado', 1),
('beef', 'Beef Stir Fry w/ Broccoli', 2),
('beef', 'Beef Kare-Kare', 3),
('beef', 'Creamy Beef in Mushroom', 4),
('fishSeafood', 'Fish Fillet Sweet & Sour', 0),
('fishSeafood', 'Fish Fillet w/ Garlic Mayo', 1),
('fishSeafood', 'Fish Fillet w/ Special Sauce', 2),
('vegetables', 'Chopsuey', 0),
('vegetables', 'Buttered Vegetables', 1),
('vegetables', 'Lumpiang Gulay', 2),
('vegetables', 'Sipo Egg', 3),
('vegetables', 'Buttered Carrots and Corn', 4),
('dessert', 'Buko Pandan', 0),
('dessert', 'Coffee Jelly', 1),
('dessert', 'Pandan Gulaman', 2),
('dessert', 'Sweetened Nata and Sago', 3),
('dessert', 'Fruit Salad', 4),
('dessert', 'Cathedral Jelly', 5),
('drinks', 'Lemon Iced Tea', 0),
('drinks', 'Red Iced Tea', 1),
('drinks', 'Blue Lemonade', 2),
('drinks', 'Cucumber Juice', 3),
('drinks', 'Buko Juice', 4);

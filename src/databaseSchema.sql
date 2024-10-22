CREATE SCHEMA IF NOT EXISTS dataluna;
CREATE TABLE IF NOT EXISTS dataluna.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  balance NUMERIC(10, 2) DEFAULT 0
);
CREATE TABLE IF NOT EXISTS dataluna.items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);
CREATE TABLE IF NOT EXISTS dataluna.purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES dataluna.users(id),
  item_id INTEGER NOT NULL REFERENCES dataluna.items(id),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE dataluna.users DROP CONSTRAINT IF EXISTS check_balance;
ALTER TABLE dataluna.users ADD CONSTRAINT check_balance CHECK (balance > 0);

-- Insert dummy data
INSERT INTO dataluna.users (id, name, balance) VALUES (1, 'user', 100.05) ON CONFLICT (id) DO NOTHING;
INSERT INTO dataluna.items (id, name, price) VALUES (1, 'item1', 10.05) ON CONFLICT (id) DO NOTHING;
INSERT INTO dataluna.items (id, name, price) VALUES (2, 'item2', 95) ON CONFLICT (id) DO NOTHING;
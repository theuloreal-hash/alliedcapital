-- Capital Bank schema (libSQL / Turso, SQLite dialect)
-- Money is stored as integer cents so no floating point rounding creeps into balances.
-- Imported historical orders carry no payment price, so an amount of 0 is allowed there.

CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  name           TEXT    NOT NULL,
  email          TEXT    NOT NULL UNIQUE,
  username       TEXT,
  password_hash  TEXT    NOT NULL,
  role           TEXT    NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  account_number TEXT    NOT NULL UNIQUE,
  balance_cents  INTEGER NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
  status         TEXT    NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Deleted')),
  phone          TEXT,
  dob            TEXT,
  created_at     TEXT    NOT NULL,
  deleted_at     TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id                TEXT PRIMARY KEY,
  user_id           TEXT    NOT NULL REFERENCES users(id),
  type              TEXT    NOT NULL CHECK (type IN ('deposit', 'transfer', 'payment', 'credit', 'debit')),
  direction         TEXT    NOT NULL CHECK (direction IN ('in', 'out')),
  description       TEXT    NOT NULL,
  amount_cents      INTEGER NOT NULL CHECK (amount_cents >= 0),
  status            TEXT    NOT NULL CHECK (status IN ('Completed', 'Pending', 'Failed')),
  booked_at         TEXT    NOT NULL,
  reference         TEXT    NOT NULL UNIQUE,
  beneficiary_name  TEXT,
  beneficiary_bank  TEXT,
  beneficiary_iban  TEXT,
  beneficiary_bic   TEXT,
  source            TEXT,
  cot_code          TEXT,
  cot_percent       INTEGER CHECK (cot_percent IS NULL OR (cot_percent >= 0 AND cot_percent <= 100)),
  cot_reason        TEXT,
  cot_submitted_at  TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(lower(username));

CREATE INDEX IF NOT EXISTS idx_transactions_user  ON transactions(user_id, booked_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_cot   ON transactions(cot_code);

CREATE TABLE IF NOT EXISTS sessions (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id),
  impersonator_id TEXT REFERENCES users(id),
  created_at      TEXT NOT NULL,
  expires_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

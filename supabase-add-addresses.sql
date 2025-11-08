-- Add addresses column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN users.addresses IS 'User saved addresses stored as JSON array';

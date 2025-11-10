-- Email logs tablosu (gönderilen maillerin kaydı)

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  template_type TEXT, -- 'welcome', 'orderConfirmation', 'adminOrderNotification', 'campaign', etc.
  email_data JSONB, -- Template'e gönderilen data
  status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'pending'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler (performans için)
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_type ON email_logs(template_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- RLS Policies (sadece admin görebilir)
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Admin read policy
CREATE POLICY "Admins can view email logs"
  ON email_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admin insert policy (sistem otomatik ekleyecek, auth bypass gerekebilir)
CREATE POLICY "System can insert email logs"
  ON email_logs
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE email_logs IS 'Gönderilen email kayıtları';

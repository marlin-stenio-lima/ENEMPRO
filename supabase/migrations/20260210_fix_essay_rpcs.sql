-- 1. Adicionar colunas de controle de redação caso não existam
ALTER TABLE saas_leads ADD COLUMN IF NOT EXISTS essays_current_month INTEGER DEFAULT 0;
ALTER TABLE saas_leads ADD COLUMN IF NOT EXISTS essays_extra_balance INTEGER DEFAULT 0;

-- 2. Função para incrementar uso de redação
CREATE OR REPLACE FUNCTION increment_essay_usage(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE saas_leads
  SET essays_current_month = COALESCE(essays_current_month, 0) + 1
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- 3. Função para decrementar saldo extra
CREATE OR REPLACE FUNCTION decrement_extra_balance(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE saas_leads
  SET essays_extra_balance = GREATEST(0, COALESCE(essays_extra_balance, 0) - 1)
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

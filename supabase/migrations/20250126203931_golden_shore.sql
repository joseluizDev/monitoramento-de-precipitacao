/*
  # Create pluviometros table

  1. New Tables
    - `pluviometros`
      - `id` (uuid, primary key)
      - `nome` (text, not null)
      - `dados` (numeric, not null) - precipitation data in mm
      - `data` (date, not null)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `pluviometros` table
    - Add policies for authenticated users to:
      - Read their own data
      - Insert their own data
      - Delete their own data
*/

CREATE TABLE IF NOT EXISTS pluviometros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  dados numeric NOT NULL,
  data date NOT NULL,
  created_at timestamptz DEFAULT now()
);



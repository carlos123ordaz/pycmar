-- Migration: add Chinese language columns to products and categories
-- Run this in the Supabase SQL Editor

ALTER TABLE products ADD COLUMN IF NOT EXISTS name_zh text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS blurb_zh text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_zh text;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_zh text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_zh text;

-- Migration: [描述遷移的目的]
-- Date: YYYY-MM-DD
-- Author: [你的名字]
-- 
-- 說明: [詳細說明這個遷移做了什麼，為什麼需要這個變更]

-- ============================================
-- 遷移內容
-- ============================================

-- 範例: 添加新欄位
-- DO $$ 
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 FROM information_schema.columns 
--         WHERE table_name = 'table_name' AND column_name = 'column_name'
--     ) THEN
--         ALTER TABLE table_name ADD COLUMN column_name VARCHAR(255);
--     END IF;
-- END $$;

-- 範例: 刪除欄位（謹慎使用，建議先備份資料）
-- DO $$ 
-- BEGIN
--     IF EXISTS (
--         SELECT 1 FROM information_schema.columns 
--         WHERE table_name = 'table_name' AND column_name = 'column_name'
--     ) THEN
--         ALTER TABLE table_name DROP COLUMN column_name;
--     END IF;
-- END $$;

-- 範例: 修改欄位類型
-- DO $$ 
-- BEGIN
--     IF EXISTS (
--         SELECT 1 FROM information_schema.columns 
--         WHERE table_name = 'table_name' 
--         AND column_name = 'column_name' 
--         AND data_type != 'new_type'
--     ) THEN
--         ALTER TABLE table_name ALTER COLUMN column_name TYPE new_type;
--     END IF;
-- END $$;

-- 範例: 添加索引
-- CREATE INDEX IF NOT EXISTS idx_table_name_column_name 
-- ON table_name(column_name);

-- 範例: 添加外鍵約束
-- DO $$ 
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 FROM information_schema.table_constraints 
--         WHERE constraint_name = 'fk_table_name_reference'
--     ) THEN
--         ALTER TABLE table_name 
--         ADD CONSTRAINT fk_table_name_reference 
--         FOREIGN KEY (column_name) REFERENCES other_table(id);
--     END IF;
-- END $$;

-- ============================================
-- 回滾腳本（可選）
-- ============================================
-- 如果需要回滾，請在下方提供回滾 SQL
-- 
-- DO $$ 
-- BEGIN
--     IF EXISTS (
--         SELECT 1 FROM information_schema.columns 
--         WHERE table_name = 'table_name' AND column_name = 'column_name'
--     ) THEN
--         ALTER TABLE table_name DROP COLUMN column_name;
--     END IF;
-- END $$;


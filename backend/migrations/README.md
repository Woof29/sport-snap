# 資料庫遷移腳本

## 📋 使用說明

### 執行遷移腳本

#### 方法 1: 使用 npm script（推薦）

```bash
cd backend
npm run migrate migrations/YYYYMMDD_HHMMSS_description.sql
```

#### 方法 2: 直接使用腳本

```bash
./backend/scripts/run-migration.sh backend/migrations/YYYYMMDD_HHMMSS_description.sql
```

#### 方法 3: 手動執行

```bash
docker exec -i sport_snap_db psql -U postgres -d sport_snap < backend/migrations/YYYYMMDD_HHMMSS_description.sql
```

### 創建新遷移腳本

1. 複製模板檔案：

    ```bash
    cp backend/migrations/TEMPLATE.sql backend/migrations/YYYYMMDD_HHMMSS_your_description.sql
    ```

2. 編輯遷移腳本，填入實際的 SQL 語句

3. 執行遷移：
    ```bash
    npm run migrate migrations/YYYYMMDD_HHMMSS_your_description.sql
    ```

### 命名規範

遷移腳本檔案名稱格式：`YYYYMMDD_HHMMSS_description.sql`

範例：

-   `20241130_143000_add_missing_event_columns.sql`
-   `20241201_100000_add_user_avatar_column.sql`
-   `20241201_110000_add_index_to_events_date.sql`

**注意**：使用時間戳記確保遷移腳本按正確順序執行。

### 遷移腳本撰寫規範

#### ✅ 必須遵守

1. **使用條件檢查**：確保遷移可以安全地重複執行（idempotent）
2. **添加註解**：說明遷移的目的和影響
3. **測試腳本**：在開發環境先測試再提交

#### ✅ 正確範例（可重複執行）

```sql
-- Migration: Add description column to events table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'events' AND column_name = 'description'
    ) THEN
        ALTER TABLE events ADD COLUMN description TEXT;
    END IF;
END $$;
```

#### ❌ 錯誤範例（不可重複執行）

```sql
-- 這樣會導致第二次執行時報錯
ALTER TABLE events ADD COLUMN description TEXT;
```

### 什麼時候需要寫遷移腳本？

-   ✅ 新增/刪除欄位
-   ✅ 修改欄位類型或約束
-   ✅ 新增/刪除索引
-   ✅ 新增/刪除外鍵
-   ✅ 新增/刪除表
-   ✅ 修改預設值
-   ✅ 資料遷移（如資料格式轉換）

### 最佳實踐

1. **每次修改 `schema.sql` 時，同時創建遷移腳本**
2. **遷移腳本應該可以安全地重複執行**
3. **在開發環境先測試遷移腳本**
4. **提交遷移腳本到版本控制**
5. **記錄遷移歷史（見下方表格）**

## 📝 遷移記錄

| 日期       | 檔案名稱                                        | 說明                                                                  | 作者 |
| ---------- | ----------------------------------------------- | --------------------------------------------------------------------- | ---- |
| 2024-11-30 | `20241130_143000_add_missing_event_columns.sql` | 為 events 表添加缺失的欄位（description, sport_type, cover_image 等） | -    |

## 🔄 遷移流程

```
修改 schema.sql
    ↓
創建遷移腳本（使用 TEMPLATE.sql）
    ↓
在開發環境測試遷移
    ↓
提交到 Git
    ↓
團隊成員執行遷移
    ↓
部署到生產環境時執行遷移
```

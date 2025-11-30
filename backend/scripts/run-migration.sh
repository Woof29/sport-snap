#!/bin/bash

# 資料庫遷移腳本執行器
# 用法: ./scripts/run-migration.sh [migration_file.sql]

set -e

DB_CONTAINER="sport_snap_db"
DB_USER="postgres"
DB_NAME="sport_snap"

if [ -z "$1" ]; then
    echo "❌ 錯誤: 請指定遷移腳本檔案"
    echo "用法: ./scripts/run-migration.sh backend/migrations/YYYYMMDD_description.sql"
    exit 1
fi

MIGRATION_FILE="$1"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ 錯誤: 找不到遷移腳本檔案: $MIGRATION_FILE"
    exit 1
fi

echo "🔄 執行遷移腳本: $MIGRATION_FILE"
echo "📦 資料庫容器: $DB_CONTAINER"
echo ""

docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo "✅ 遷移執行成功！"
else
    echo "❌ 遷移執行失敗！"
    exit 1
fi


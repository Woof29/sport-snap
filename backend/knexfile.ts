import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

// 嘗試載入 .env 文件
dotenv.config({ path: path.resolve(__dirname, '.env') });

const config: { [key: string]: Knex.Config } = {
    development: {
        client: 'postgresql',
        connection: {
            // 如果在 Docker 外部 (本機) 執行，連線到 localhost
            // 如果在 Docker 內部執行，通常使用 service name "postgres" (但這裡我們預設為本機開發環境)
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5433,
            database: process.env.DB_NAME || 'sport_snap',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false }
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './src/migrations',
            extension: 'ts'
        }
    },

    production: {
        client: 'postgresql',
        connection: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ssl: { rejectUnauthorized: false }
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './dist/migrations',
            extension: 'js' // 生產環境編譯後是 js
        }
    }
};

export default config;

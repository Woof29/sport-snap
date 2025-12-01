import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // 1. Users Table
    if (!(await knex.schema.hasTable('users'))) {
        await knex.schema.createTable('users', (table) => {
            table.increments('id').primary();
            table.string('email', 255).unique().notNullable();
            table.string('password_hash', 255).notNullable();
            table.string('role', 50).notNullable().defaultTo('buyer');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }

    // 2. Events Table
    if (!(await knex.schema.hasTable('events'))) {
        await knex.schema.createTable('events', (table) => {
            table.increments('id').primary();
            table.string('name', 255).notNullable();
            table.date('date').notNullable();
            table.string('location', 255);
            table.text('description');
            table.string('sport_type', 50);
            table.string('cover_image', 500);
            table.string('status', 50).defaultTo('draft');
            // 外鍵：如果 user 被刪除，這裡設為 NULL
            table.integer('organizer_id').references('id').inTable('users').onDelete('SET NULL');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }

    // 3. Albums Table
    if (!(await knex.schema.hasTable('albums'))) {
        await knex.schema.createTable('albums', (table) => {
            table.increments('id').primary();
            table.integer('event_id').references('id').inTable('events').onDelete('CASCADE');
            table.integer('photographer_id').references('id').inTable('users');
            table.string('name', 255).notNullable();
            table.text('description');
            table.string('status', 50).defaultTo('active');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }

    // 4. Photos Table
    if (!(await knex.schema.hasTable('photos'))) {
        await knex.schema.createTable('photos', (table) => {
            table.increments('id').primary();
            table.integer('album_id').references('id').inTable('albums').onDelete('CASCADE');
            table.string('r2_key', 255).notNullable();
            table.string('r2_thumbnail_key', 255);
            table.string('filename', 255);
            // Knex 支援 PostgreSQL 的陣列類型 specificType
            table.specificType('bib_numbers', 'text[]');
            table.decimal('price', 10, 2).notNullable().defaultTo(0);
            table.string('status', 50).defaultTo('active');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }

    // 5. Orders Table
    if (!(await knex.schema.hasTable('orders'))) {
        await knex.schema.createTable('orders', (table) => {
            table.increments('id').primary();
            table.integer('user_id').references('id').inTable('users');
            table.decimal('total_amount', 10, 2).notNullable();
            table.string('currency', 10).defaultTo('TWD');
            table.string('status', 50).defaultTo('pending');
            table.string('payment_provider', 50);
            table.string('transaction_id', 255);
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }

    // 6. Order Items Table
    if (!(await knex.schema.hasTable('order_items'))) {
        await knex.schema.createTable('order_items', (table) => {
            table.increments('id').primary();
            table.integer('order_id').references('id').inTable('orders').onDelete('CASCADE');
            table.integer('photo_id').references('id').inTable('photos');
            table.decimal('price_at_purchase', 10, 2).notNullable();
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    // 刪除表格，順序很重要 (先刪除有外鍵依賴的表)
    await knex.schema.dropTableIfExists('order_items');
    await knex.schema.dropTableIfExists('orders');
    await knex.schema.dropTableIfExists('photos');
    await knex.schema.dropTableIfExists('albums');
    await knex.schema.dropTableIfExists('events');
    await knex.schema.dropTableIfExists('users');
}

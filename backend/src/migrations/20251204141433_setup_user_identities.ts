import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // 1. Create user_identities table
    await knex.schema.createTable('user_identities', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('provider', 50).notNullable(); // 'local', 'google', 'facebook', 'line'
        table.string('provider_id', 255).nullable(); // UID from provider, NULL for local
        table.string('credential', 255).nullable(); // Password hash for local, access token for others (optional)
        table.timestamp('created_at').defaultTo(knex.fn.now());
        
        // Unique constraint: A user can only have one identity per provider
        // Actually, for 'local', provider_id is null, so we might want unique(user_id, provider)
        // But for OAuth, we want unique(provider, provider_id) to find user by provider
        table.unique(['provider', 'provider_id']);
        table.index(['user_id']);
    });

    // 2. Migrate existing password_hash to user_identities (if any)
    const users = await knex('users').select('id', 'password_hash');
    for (const user of users) {
        if (user.password_hash) {
            await knex('user_identities').insert({
                user_id: user.id,
                provider: 'local',
                credential: user.password_hash
            });
        }
    }

    // 3. Modify users table
    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('password_hash');
        table.dropColumn('reset_password_token'); // Reset token should probably be in identities or separate, but let's keep simple for now.
        // Actually reset password is usually for local account. So logic should move to identities or stay in user?
        // If we keep reset_password_token in users, it implies "User reset", but actually we are resetting "Local Identity Password".
        // Let's remove it from users and handle it later or re-add it if needed.
        // Wait, if I remove it, the previous feature I built breaks.
        // Let's KEEP reset_password_token in users for now, as it's tied to Email which is on User.
        
        table.dropColumn('reset_password_expires');
        table.string('avatar', 500).nullable();
    });
    
    // Re-add reset password columns if we want to keep them on User (simplest for now)
    await knex.schema.alterTable('users', (table) => {
        table.string('reset_password_token', 255).nullable();
        table.timestamp('reset_password_expires').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    // 1. Add password_hash back to users
    await knex.schema.alterTable('users', (table) => {
        table.string('password_hash', 255).nullable();
        table.dropColumn('avatar');
    });

    // 2. Migrate local passwords back to users
    const identities = await knex('user_identities').where({ provider: 'local' });
    for (const identity of identities) {
        await knex('users').where({ id: identity.user_id }).update({ password_hash: identity.credential });
    }

    // 3. Drop user_identities table
    await knex.schema.dropTable('user_identities');
}

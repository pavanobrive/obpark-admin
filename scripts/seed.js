const path = require('path');
require('../apps/api/node_modules/dotenv').config({ path: path.join(__dirname, '../apps/api/.env') });

const { Client } = require('../apps/api/node_modules/pg');
const bcrypt = require('../apps/api/node_modules/bcrypt');

const cleanUrl = process.env.DATABASE_URL.replace(/sslmode=[^&]+/, 'uselibpqcompat=true');
const client = new Client({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  const users = [
    {
      email: 'shiva@obrive.com',
      firstName: 'Shiva',
      lastName: 'Admin',
      name: 'Shiva Admin',
      password: 'obpark-admin-00',
      role: 'ADMIN_OBPARK',
    },
    {
      email: 'admin@obrive.com',
      firstName: 'Admin',
      lastName: 'Obpark',
      name: 'Admin Obpark',
      password: 'obpark-admin-01',
      role: 'ADMIN_OBPARK',
    },
  ];

  // Also remove duplicate case-insensitive rows if any
  await client.query('DELETE FROM "User" WHERE LOWER(email) = \'shiva@obrive.com\' AND email != \'shiva@obrive.com\'');

  for (const item of users) {
    const passwordHash = await bcrypt.hash(item.password, 10);

    const query = `
      INSERT INTO "User" ("id", "email", "name", "firstName", "lastName", "passwordHash", "role", "isVerified", "updatedAt", "createdAt")
      VALUES (
        concat('c', md5(random()::text)),
        $1,
        $2,
        $3,
        $4,
        $5,
        $6::"Role",
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT ("email") DO UPDATE
      SET "passwordHash" = EXCLUDED."passwordHash",
          "name" = EXCLUDED."name",
          "firstName" = EXCLUDED."firstName",
          "lastName" = EXCLUDED."lastName",
          "role" = EXCLUDED."role",
          "isVerified" = true,
          "updatedAt" = NOW()
      RETURNING "id", "email", "firstName", "lastName", "name", "role", "isVerified";
    `;

    const res = await client.query(query, [item.email, item.name, item.firstName, item.lastName, passwordHash, item.role]);
    console.log(`✅ Upserted user: ${res.rows[0].email} (${res.rows[0].firstName} ${res.rows[0].lastName}, Role: ${res.rows[0].role})`);
  }

  const allUsers = await client.query('SELECT "id", "email", "firstName", "lastName", "name", "role", "isVerified" FROM "User" ORDER BY "email"');
  console.log('\nAll users in User table:');
  console.table(allUsers.rows);

  await client.end();
}

main().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});

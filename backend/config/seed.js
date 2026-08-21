const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const DEMO_PASSWORD = 'hookgrab';

function ensureDefaultProfilePicture() {
  const destDir = path.join(__dirname, '../uploads/profiles');
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, 'default.jpg');
  if (fs.existsSync(dest)) return;

  const source = path.join(__dirname, '../../frontend/src/assets/images/pfp.jpg');
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
  }
}

function seedIfEmpty(db, done = () => {}) {
  ensureDefaultProfilePicture();

  db.get('SELECT COUNT(*) AS count FROM users', (err, userRow) => {
    if (err) {
      console.error('Seed check failed:', err.message);
      return done();
    }

    if (userRow.count > 0) {
      return seedMarketplace(db, done);
    }

    const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);
    const profilePicture = '/uploads/profiles/default.jpg';
    const users = [
      ['captain', passwordHash, 'captain@hookandgrab.gr', 'Nikos', 'Pelagos', '1984-04-12', '2105550101', profilePicture],
      ['artemis', passwordHash, 'artemis@hookandgrab.gr', 'Artemis', 'Thalassa', '1992-07-03', '2105550102', profilePicture],
      ['eleni', passwordHash, 'eleni@hookandgrab.gr', 'Eleni', 'Kyma', '1990-11-21', '2105550103', profilePicture],
    ];

    const stmt = db.prepare(
      `INSERT INTO users (username, password, email, firstName, lastName, dateOfBirth, phone, profilePicture)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    users.forEach((user) => stmt.run(user));
    stmt.finalize((finalizeErr) => {
      if (finalizeErr) {
        console.error('Error seeding users:', finalizeErr.message);
        return done();
      }
      console.log('Demo users ready. Login with username "captain" and password "hookgrab".');
      seedMarketplace(db, done);
    });
  });
}

function seedMarketplace(db, done = () => {}) {
  db.get('SELECT id FROM users ORDER BY id ASC LIMIT 1', (err, firstUser) => {
    if (err || !firstUser) return done();

    db.all('SELECT id, username FROM users', (userErr, users) => {
      if (userErr || !users.length) return done();

      const byName = Object.fromEntries(users.map((user) => [user.username, user.id]));
      const captainId = byName.captain || firstUser.id;
      const artemisId = byName.artemis || firstUser.id;
      const eleniId = byName.eleni || firstUser.id;
      const now = new Date().toISOString();
      let remaining = 3;
      const finish = () => {
        remaining -= 1;
        if (remaining <= 0) done();
      };

      db.get('SELECT COUNT(*) AS count FROM products', (productErr, productRow) => {
        if (productErr || productRow.count > 0) return finish();
        const products = [
          ['Used fishing nets (50m)', 'Cleaned and repaired nylon nets, ready for a second life on a smaller boat.', 45, 0, 1, captainId],
          ['Stainless propeller', 'Lightly used 3-blade propeller. Fits small coastal boats.', 120, 0, 1, artemisId],
          ['Life jackets (set of 4)', 'CE-certified life jackets, stored indoors, no tears.', 60, 0, 0, eleniId],
          ['Bamboo fishing rods', 'Two hand-built rods. Great starter kit for kids and coastal fishing.', 0, 1, 1, artemisId],
          ['Marine battery 70Ah', 'Still holds charge. Ideal as a spare for harbor use.', 80, 0, 1, captainId],
          ['Old lobster pots', 'Wooden pots for upcycling, decoration, or spare parts.', 0, 1, 1, eleniId],
        ];
        const stmt = db.prepare(
          `INSERT INTO products (title, description, price, isFree, isOpenToTrade, images, datePosted, sellerId)
           VALUES (?, ?, ?, ?, ?, NULL, ?, ?)`
        );
        products.forEach(([title, description, price, isFree, isOpenToTrade, sellerId]) => {
          stmt.run(title, description, price, isFree, isOpenToTrade, now, sellerId);
        });
        stmt.finalize(finish);
      });

      db.get('SELECT COUNT(*) AS count FROM boats', (boatErr, boatRow) => {
        if (boatErr || boatRow.count > 0) return finish();
        const boats = [
          [captainId, 'Traditional kaiki "Asteras"', 'Wooden fishing kaiki, well maintained. Perfect for a day trip with a skipper.', 90, 'Piraeus'],
          [artemisId, 'Coastal skiff', 'Easy to handle 5m skiff. Fuel efficient and ideal for short coastal routes.', 55, 'Thessaloniki'],
          [eleniId, 'Family sailboat', 'Comfortable weekend sailboat for up to 6 people. Life jackets included.', 140, 'Heraklion'],
        ];
        const stmt = db.prepare(
          `INSERT INTO boats (ownerId, title, description, pricePerDay, location, images, datePosted)
           VALUES (?, ?, ?, ?, ?, NULL, ?)`
        );
        boats.forEach(([ownerId, title, description, pricePerDay, location]) => {
          stmt.run(ownerId, title, description, pricePerDay, location, now);
        });
        stmt.finalize(finish);
      });

      db.get('SELECT COUNT(*) AS count FROM forum_discussions', (forumErr, forumRow) => {
        if (forumErr || forumRow.count > 0) return finish();
        const topics = [
          [captainId, 'Sustainable Fishing Practices: What Works?', 'What gear and methods have actually reduced bycatch in your area?'],
          [artemisId, 'Repairing and Reusing Boat Parts: Tips and Tricks', 'Sharing a checklist for inspecting used propellers before you buy.'],
          [eleniId, 'Renting vs. Owning a Boat: Which is Better for You?', 'For weekend fishing, renting has been cheaper and less wasteful for me.'],
          [captainId, 'Upcycling Old Fishing Gear: Ideas and Projects', 'Old nets make surprisingly good garden fencing. What else have you tried?'],
          [artemisId, 'Local Fisheries and the Circular Economy', 'How can small harbors keep parts and tools circulating instead of dumping them?'],
        ];
        const stmt = db.prepare(
          `INSERT INTO forum_discussions (title, body, authorId, createdAt, views)
           VALUES (?, ?, ?, ?, ?)`
        );
        topics.forEach(([authorId, title, body], index) => {
          stmt.run(title, body, authorId, now, 4 + index * 3);
        });
        stmt.finalize((finalizeErr) => {
          if (finalizeErr) return finish();
          db.get('SELECT id FROM forum_discussions ORDER BY id ASC LIMIT 1', (firstErr, firstTopic) => {
            if (firstErr || !firstTopic) return finish();
            db.run(
              `INSERT INTO forum_replies (discussionId, authorId, body, createdAt) VALUES (?, ?, ?, ?)`,
              [firstTopic.id, eleniId, 'Circle hooks and shorter soak times made a noticeable difference for us.', now],
              finish
            );
          });
        });
      });
    });
  });
}

module.exports = { seedIfEmpty };

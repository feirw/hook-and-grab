const { getDatabaseConnection } = require('../config/database');

class Forum {
  static createDiscussion(data, callback) {
    const db = getDatabaseConnection();
    db.run(
      `
      INSERT INTO forum_discussions (title, body, authorId, createdAt, views)
      VALUES (?, ?, ?, ?, 0)
      `,
      [data.title, data.body, data.authorId, data.createdAt],
      function (err) {
        db.close();
        if (err) return callback(err);
        return callback(null, { id: this.lastID, ...data, views: 0, replies: 0 });
      }
    );
  }

  static getDiscussions(callback) {
    const db = getDatabaseConnection();
    db.all(
      `
      SELECT
        d.id,
        d.title,
        d.body,
        d.authorId,
        d.createdAt,
        d.views,
        u.username AS author,
        (SELECT COUNT(*) FROM forum_replies r WHERE r.discussionId = d.id) AS replies,
        COALESCE(
          (SELECT MAX(r.createdAt) FROM forum_replies r WHERE r.discussionId = d.id),
          d.createdAt
        ) AS lastActivity
      FROM forum_discussions d
      LEFT JOIN users u ON u.id = d.authorId
      ORDER BY lastActivity DESC
      `,
      [],
      (err, rows) => {
        db.close();
        if (err) return callback(err);
        return callback(null, rows);
      }
    );
  }

  static getDiscussionById(id, callback) {
    const db = getDatabaseConnection();
    db.get(
      `
      SELECT d.*, u.username AS author
      FROM forum_discussions d
      LEFT JOIN users u ON u.id = d.authorId
      WHERE d.id = ?
      `,
      [id],
      (err, discussion) => {
        if (err) {
          db.close();
          return callback(err);
        }
        if (!discussion) {
          db.close();
          return callback(null, null);
        }

        db.all(
          `
          SELECT r.*, u.username AS author
          FROM forum_replies r
          LEFT JOIN users u ON u.id = r.authorId
          WHERE r.discussionId = ?
          ORDER BY r.createdAt ASC
          `,
          [id],
          (replyErr, replies) => {
            db.close();
            if (replyErr) return callback(replyErr);
            return callback(null, { ...discussion, replies: replies || [] });
          }
        );
      }
    );
  }

  static incrementViews(id, callback) {
    const db = getDatabaseConnection();
    db.run('UPDATE forum_discussions SET views = views + 1 WHERE id = ?', [id], function (err) {
      db.close();
      if (err) return callback(err);
      return callback(null);
    });
  }

  static addReply(data, callback) {
    const db = getDatabaseConnection();
    db.run(
      `
      INSERT INTO forum_replies (discussionId, authorId, body, createdAt)
      VALUES (?, ?, ?, ?)
      `,
      [data.discussionId, data.authorId, data.body, data.createdAt],
      function (err) {
        db.close();
        if (err) return callback(err);
        return callback(null, { id: this.lastID, ...data });
      }
    );
  }
}

module.exports = Forum;

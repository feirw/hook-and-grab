const Forum = require('../models/Forum');

exports.getDiscussions = (req, res) => {
  Forum.getDiscussions((err, discussions) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching discussions.' });
    }
    res.json({ discussions });
  });
};

exports.getDiscussionById = (req, res) => {
  const id = req.params.id;
  Forum.incrementViews(id, () => {
    Forum.getDiscussionById(id, (err, discussion) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching discussion.' });
      }
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found.' });
      }
      res.json({ discussion });
    });
  });
};

exports.createDiscussion = (req, res) => {
  const title = (req.body.title || '').trim();
  const body = (req.body.body || '').trim();

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required.' });
  }

  Forum.createDiscussion(
    {
      title,
      body,
      authorId: req.user.id,
      createdAt: new Date().toISOString(),
    },
    (err, discussion) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating discussion.' });
      }
      res.status(201).json({
        message: 'Discussion created.',
        discussion: {
          ...discussion,
          author: req.user.username,
          lastActivity: discussion.createdAt,
          replies: 0,
        },
      });
    }
  );
};

exports.addReply = (req, res) => {
  const body = (req.body.body || '').trim();
  if (!body) {
    return res.status(400).json({ message: 'Reply body is required.' });
  }

  Forum.getDiscussionById(req.params.id, (err, discussion) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching discussion.' });
    }
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found.' });
    }

    Forum.addReply(
      {
        discussionId: discussion.id,
        authorId: req.user.id,
        body,
        createdAt: new Date().toISOString(),
      },
      (replyErr, reply) => {
        if (replyErr) {
          return res.status(500).json({ message: 'Error posting reply.' });
        }
        res.status(201).json({
          message: 'Reply posted.',
          reply: { ...reply, author: req.user.username },
        });
      }
    );
  });
};

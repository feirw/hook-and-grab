# Forum API

[Back to Home](../index.md)

## Overview

The Forum API lets users browse community discussions, open a topic, and post replies.

## Endpoints

### List discussions

**URL:** `/forum/discussions`  
**Method:** `GET`

**Successful Response:** `200 OK`

```json
{
  "discussions": [
    {
      "id": 1,
      "title": "Sustainable Fishing Practices: What Works?",
      "author": "captain",
      "replies": 1,
      "views": 8,
      "lastActivity": "2026-08-21T12:00:00.000Z"
    }
  ]
}
```

### Get a discussion

**URL:** `/forum/discussions/:id`  
**Method:** `GET`  
Increments the view count.

### Create a discussion

**URL:** `/forum/discussions`  
**Method:** `POST`  
**Authentication Required:** Yes

```json
{
  "title": "Repair day in the harbor",
  "body": "Who is bringing spare parts this Saturday?"
}
```

### Reply to a discussion

**URL:** `/forum/discussions/:id/replies`  
**Method:** `POST`  
**Authentication Required:** Yes

```json
{
  "body": "I can bring extra line and two life jackets."
}
```

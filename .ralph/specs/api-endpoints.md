# API Endpoints Specification

## Authentication

### POST /api/auth/register
Register a new user.
- **Body**: `{ username, email, password }`
- **Response**: `{ user, token }`
- **Validation**: username 3-30 chars, valid email, password min 8 chars

### POST /api/auth/login
Login and get JWT token.
- **Body**: `{ email, password }`
- **Response**: `{ user, token }`

### GET /api/auth/me
Get current user profile (authenticated).
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ user }`

### PUT /api/auth/me
Update current user profile (authenticated).
- **Body**: `{ displayName?, settings? }`
- **Response**: `{ user }`

### PUT /api/auth/password
Change password (authenticated).
- **Body**: `{ currentPassword, newPassword }`
- **Response**: `{ success: true }`

---

## Vocabulary

### GET /api/vocabulary
List vocabulary entries with pagination and search.
- **Query**: `?letter=A&search=apple&page=1&limit=50&pos=[名]`
- **Response**: `{ items: [...], total, page, totalPages }`

### GET /api/vocabulary/:word
Get a single vocabulary entry by word.
- **Response**: `{ vocabulary entry }`

### POST /api/vocabulary
Create vocabulary entry (admin only).
- **Body**: Full vocabulary object
- **Response**: `{ created entry }`

### PUT /api/vocabulary/:id
Update vocabulary entry (admin only).
- **Body**: Partial vocabulary object
- **Response**: `{ updated entry }`

### DELETE /api/vocabulary/:id
Delete vocabulary entry (admin only).
- **Response**: `{ success: true }`

### POST /api/vocabulary/import
Bulk import vocabulary from JSON (admin only).
- **Body**: `{ data: [...] }` or file upload
- **Response**: `{ imported: count, errors: [...] }`

### DELETE /api/vocabulary/all
Delete all vocabulary entries (admin only, for full replacement).
- **Response**: `{ deleted: count }`

---

## Grammar

### GET /api/grammar
List all grammar chapters in order.
- **Response**: `{ chapters: [...] }`

### GET /api/grammar/:chapterId
Get a single grammar chapter with sections.
- **Response**: `{ chapter }`

### GET /api/grammar/search
Search grammar content.
- **Query**: `?q=searchterm`
- **Response**: `{ results: [...] }`

### POST /api/grammar
Create grammar chapter (admin only).
- **Body**: Full grammar chapter object
- **Response**: `{ created chapter }`

### PUT /api/grammar/:id
Update grammar chapter (admin only).
- **Body**: Partial grammar chapter object
- **Response**: `{ updated chapter }`

### DELETE /api/grammar/:id
Delete grammar chapter (admin only).
- **Response**: `{ success: true }`

### POST /api/grammar/import
Bulk import grammar from JSON (admin only).
- **Body**: `{ data: [...] }`
- **Response**: `{ imported: count, errors: [...] }`

### DELETE /api/grammar/all
Delete all grammar chapters (admin only).
- **Response**: `{ deleted: count }`

---

## Discussions

### GET /api/discussions
List discussions with pagination.
- **Query**: `?page=1&limit=20&tag=grammar&sort=recent&author=userId`
- **Response**: `{ items: [...], total, page, totalPages }`

### GET /api/discussions/:id
Get a single discussion with author info.
- **Response**: `{ discussion, author }`

### POST /api/discussions
Create discussion (authenticated).
- **Body**: `{ title, content, tags? }`
- **Response**: `{ created discussion }`

### PUT /api/discussions/:id
Update discussion (author or admin).
- **Body**: `{ title?, content?, tags? }`
- **Response**: `{ updated discussion }`

### DELETE /api/discussions/:id
Delete discussion (author or admin).
- **Response**: `{ success: true }`

---

## Comments

### GET /api/discussions/:discussionId/comments
List comments for a discussion.
- **Query**: `?page=1&limit=50`
- **Response**: `{ items: [...], total }`

### POST /api/discussions/:discussionId/comments
Create comment (authenticated).
- **Body**: `{ content, parentId? }`
- **Response**: `{ created comment }`

### PUT /api/comments/:id
Update comment (author or admin).
- **Body**: `{ content }`
- **Response**: `{ updated comment }`

### DELETE /api/comments/:id
Delete comment (author or admin).
- **Response**: `{ success: true }`

---

## Likes

### POST /api/like
Toggle like on a discussion or comment (authenticated).
- **Body**: `{ targetType: 'discussion'|'comment', targetId }`
- **Response**: `{ liked: boolean, likeCount }`

---

## Admin

### GET /api/admin/stats
Get system statistics (admin only).
- **Response**: `{ users, vocabulary, grammar, discussions, comments }`

---

## Response Format

All API responses follow this envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## HTTP Status Codes
- `200` — Success
- `201` — Created
- `400` — Bad Request (validation error)
- `401` — Unauthorized (no/invalid token)
- `403` — Forbidden (insufficient permissions)
- `404` — Not Found
- `409` — Conflict (duplicate)
- `500` — Internal Server Error

# Data Models Specification

## MongoDB Collections

### users
```json
{
  "_id": "ObjectId",
  "username": "string (unique, required)",
  "email": "string (unique, required)",
  "passwordHash": "string (required, bcrypt)",
  "displayName": "string (optional)",
  "role": "string (enum: 'user' | 'admin')",
  "createdAt": "Date",
  "updatedAt": "Date",
  "settings": {
    "language": "string (default: 'zh')",
    "theme": "string (default: 'light')"
  }
}
```

### vocabulary
```json
{
  "_id": "ObjectId",
  "word": "string (required, the Simplingua word)",
  "partOfSpeech": "string (required, e.g., '[名]', '[动]', '[形]')",
  "verbType": "string (optional, e.g., '{他}', '{自}', '{系}')",
  "definitions": [
    {
      "number": "number (sense number)",
      "meaning": "string (Chinese definition)",
      "verbType": "string (optional, if sense-specific)",
      "examples": ["string (example sentences)"]
    }
  ],
  "relatedWords": [
    {
      "word": "string",
      "type": "string (e.g., 'derived', 'root', 'variant')",
      "partOfSpeech": "string",
      "meaning": "string (brief)"
    }
  ],
  "pronunciation": {
    "stressNote": "string (optional, e.g., '(ácie)')",
    "ipa": "string (optional)"
  },
  "compoundParts": ["string (optional, e.g., 'vi+a+age')"],
  "genderForms": {
    "feminine": "string (optional)",
    "masculine": "string (optional)",
    "epicene": "string (optional)"
  },
  "letter": "string (first letter, for grouping by alphabet)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### grammar
```json
{
  "_id": "ObjectId",
  "chapterTitle": "string (required, e.g., '名词', '动词')",
  "chapterTitleSimp": "string (same as above, Simplingua title if applicable)",
  "order": "number (required, chapter ordering)",
  "sections": [
    {
      "title": "string (section heading)",
      "content": "string (HTML or Markdown content)",
      "examples": [
        {
          "simplingua": "string",
          "chinese": "string",
          "notes": "string (optional)"
        }
      ],
      "subsections": [
        {
          "title": "string",
          "content": "string",
          "examples": ["same structure as above"]
        }
      ]
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### discussions
```json
{
  "_id": "ObjectId",
  "title": "string (required)",
  "content": "string (required, Markdown)",
  "authorId": "ObjectId (ref users)",
  "tags": ["string"],
  "viewCount": "number (default: 0)",
  "likeCount": "number (default: 0)",
  "commentCount": "number (default: 0)",
  "isPinned": "boolean (default: false)",
  "isLocked": "boolean (default: false)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### comments
```json
{
  "_id": "ObjectId",
  "discussionId": "ObjectId (ref discussions)",
  "parentId": "ObjectId (optional, ref comments - for nested replies)",
  "content": "string (required, Markdown)",
  "authorId": "ObjectId (ref users)",
  "likeCount": "number (default: 0)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### likes
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref users)",
  "targetType": "string (enum: 'discussion' | 'comment')",
  "targetId": "ObjectId (ref discussions or comments)",
  "createdAt": "Date"
}
```
Unique compound index on (userId, targetType, targetId) to prevent duplicate likes.

## Indexes

### vocabulary
- `{ "word": 1 }` — unique, for exact lookup
- `{ "letter": 1 }` — for alphabetical browsing
- `{ "definitions.meaning": "text" }` — for Chinese text search
- `{ "word": "text" }` — for Simplingua text search

### grammar
- `{ "order": 1 }` — for ordered chapter listing
- `{ "chapterTitle": "text", "sections.content": "text" }` — for content search

### discussions
- `{ "createdAt": -1 }` — for recent sorting
- `{ "authorId": 1 }` — for user's discussions
- `{ "tags": 1 }` — for tag filtering

### comments
- `{ "discussionId": 1, "createdAt": 1 }` — for discussion thread loading
- `{ "parentId": 1 }` — for nested comment loading

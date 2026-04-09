# Frontend Pages & Components Specification

## Pages

### Public Pages

#### `/` — Home
- Hero section introducing Simplingua
- Quick links to Grammar, Vocabulary, Discussions
- Statistics (word count, grammar chapters, discussion count)

#### `/vocabulary` — Vocabulary Browser
- Alphabet sidebar for letter-based browsing
- Search bar (search by Simplingua word or Chinese meaning)
- Filter by part of speech
- Paginated word list with cards
- Click word card → expandable detail view or modal

#### `/vocabulary/:word` — Word Detail
- Full word entry: word, pronunciation, definitions, examples
- Related/derived words with links
- Gender forms if applicable
- "Back to vocabulary" navigation

#### `/grammar` — Grammar Browser
- Table of contents (chapter list) in sidebar
- Chapter content display area
- In-page search within grammar
- Previous/Next chapter navigation

#### `/grammar/:chapterId` — Chapter View
- Full chapter with sections and subsections
- Example sentences highlighted
- Breadcrumb navigation

#### `/discussions` — Discussion List
- Paginated discussion list
- Sort: recent, popular, most commented
- Tag filter
- Search discussions
- "New Discussion" button (auth required)

#### `/discussions/:id` — Discussion Thread
- Discussion title, content (rendered Markdown), author, date
- Like button
- Nested comment tree
- Reply form (auth required)
- Edit/Delete buttons (owner/admin)

### Auth Pages

#### `/login` — Login
- Email + password form
- Link to register

#### `/register` — Register
- Username + email + password form
- Link to login

### Authenticated Pages

#### `/settings` — User Settings
- Display name
- Password change
- Theme preference

### Admin Pages

#### `/admin` — Admin Dashboard
- Stats overview
- Links to manage vocabulary, grammar, discussions

#### `/admin/vocabulary` — Manage Vocabulary
- List all entries with edit/delete
- Import JSON button (bulk upload)
- Delete all button (with confirmation)
- Add single entry form

#### `/admin/vocabulary/new` — Add Vocabulary Entry
- Form for creating a vocabulary entry

#### `/admin/vocabulary/:id/edit` — Edit Vocabulary Entry
- Pre-filled form for editing

#### `/admin/grammar` — Manage Grammar
- List chapters with reorder
- Import JSON button
- Delete all button
- Add chapter button

#### `/admin/grammar/new` — Add Grammar Chapter
- Rich text / Markdown editor for content

#### `/admin/grammar/:id/edit` — Edit Grammar Chapter
- Pre-filled editor

#### `/admin/discussions` — Manage Discussions
- List all discussions
- Pin/Lock/Delete actions

## Shared Components

### Layout
- `Header` — Logo, nav links (Vocabulary, Grammar, Discussions), auth state
- `Footer` — Credits, links
- `Sidebar` — Context-aware navigation (e.g., alphabet on vocab page, TOC on grammar page)

### Vocabulary
- `WordCard` — Compact word display for list view
- `WordDetail` — Full word detail for expanded/modal view
- `SearchBar` — Search input with debounce
- `AlphabetNav` — A-Z letter selector
- `PosFilter` — Part of speech filter chips

### Grammar
- `ChapterNav` — Table of contents sidebar
- `SectionContent` — Renders a grammar section with examples
- `ExampleSentence` — Highlighted Simplingua + Chinese pair

### Discussion
- `DiscussionCard` — Compact discussion preview for list
- `DiscussionContent` — Full Markdown rendered content
- `CommentTree` — Nested comment display
- `CommentForm` — Reply/new comment form with Markdown
- `LikeButton` — Toggle like with count

### Auth
- `LoginForm` — Email/password form
- `RegisterForm` — Registration form
- `UserMenu` — Dropdown with profile/settings/logout

### Admin
- `ImportButton` — Upload JSON with progress indicator
- `StatsCard` — Stat display for dashboard
- `DataTable` — Generic table with actions

### Common
- `Pagination` — Page navigation
- `Loading` — Loading spinner/skeleton
- `ErrorMessage` — Error display
- `MarkdownRenderer` — Render Markdown content safely
- `Modal` — Generic modal dialog
- `ConfirmDialog` — Confirmation before destructive actions

---
name: spec-cold-start
description: Template and components for the Cold-Start briefing action. Produces orientation briefing with status categories.
---

# Cold-Start Briefing Action

Use these components to orient someone new to a page's content.

## Components

- **Heading** (level: 1|2|3, content) — styled heading. Use level 1 for "COLD-START BRIEFING".
- **Chip** (label, color?, icon?) — inline pill for ctx:: metadata (project, mode, date).
- **StatusLine** (label, color?, content) — colored label prefix. Categories:
  - URGENT / coral — needs immediate attention
  - SHIPPED / green — completed and deployed
  - DOCTRINE / purple — established principles
  - HELD / amber — paused or blocked
- **Paragraph** (content) — body text.
- **BulletList** (items: string[]) — bulleted list.
- **BlockRef** (title, page?, blockId?) — clickable reference.

## Structure

1. Heading(1, "COLD-START BRIEFING")
2. Row of Chip for metadata (project, mode, date)
3. StatusLine for each category (URGENT, SHIPPED, DOCTRINE, HELD)
4. Chip row for key links at bottom

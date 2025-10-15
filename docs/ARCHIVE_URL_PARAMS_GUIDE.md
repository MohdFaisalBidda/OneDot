# Archive Page URL Parameters Guide

## Quick Reference

### Focus Table Parameters

| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| `focusPage` | number | 1, 2, 3... | Current page number |
| `focusSortBy` | string | `date`, `title`, `status`, `mood` | Sort column |
| `focusSortOrder` | string | `asc`, `desc` | Sort direction |
| `focusStatus` | string | `ACHIEVED`, `PARTIALLY_ACHIEVED`, `NOT_ACHIEVED`, `PENDING` | Filter by status |
| `focusSearch` | string | any text | Search in title and notes |

### Decision Table Parameters

| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| `decisionPage` | number | 1, 2, 3... | Current page number |
| `decisionSortBy` | string | `date`, `title`, `category` | Sort column |
| `decisionSortOrder` | string | `asc`, `desc` | Sort direction |
| `decisionCategory` | string | `CAREER`, `HEALTH`, `FINANCE`, `RELATIONSHIPS`, `LIFESTYLE`, `GENERAL`, `OTHER` | Filter by category |
| `decisionSearch` | string | any text | Search in title and reason |

## Example URLs

### Basic Examples

1. **Default view (page 1, sorted by date desc)**
   ```
   /dashboard/archive
   ```

2. **Focus page 2**
   ```
   /dashboard/archive?focusPage=2
   ```

3. **Decisions page 3**
   ```
   /dashboard/archive?decisionPage=3
   ```

### Sorting Examples

4. **Focus sorted by title (ascending)**
   ```
   /dashboard/archive?focusSortBy=title&focusSortOrder=asc
   ```

5. **Decisions sorted by category (descending)**
   ```
   /dashboard/archive?decisionSortBy=category&decisionSortOrder=desc
   ```

6. **Both tables sorted differently**
   ```
   /dashboard/archive?focusSortBy=mood&focusSortOrder=asc&decisionSortBy=date&decisionSortOrder=desc
   ```

### Filtering Examples

7. **Show only achieved focus entries**
   ```
   /dashboard/archive?focusStatus=ACHIEVED
   ```

8. **Show only career decisions**
   ```
   /dashboard/archive?decisionCategory=CAREER
   ```

9. **Achieved focus + health decisions**
   ```
   /dashboard/archive?focusStatus=ACHIEVED&decisionCategory=HEALTH
   ```

### Search Examples

10. **Search focus entries for "project"**
    ```
    /dashboard/archive?focusSearch=project
    ```

11. **Search decisions for "meditation"**
    ```
    /dashboard/archive?decisionSearch=meditation
    ```

12. **Search both tables**
    ```
    /dashboard/archive?focusSearch=work&decisionSearch=health
    ```

### Complex Examples

13. **Filtered + Sorted + Paginated Focus**
    ```
    /dashboard/archive?focusStatus=ACHIEVED&focusSortBy=date&focusSortOrder=asc&focusPage=2
    ```

14. **Filtered + Searched Decisions**
    ```
    /dashboard/archive?decisionCategory=FINANCE&decisionSearch=investment&decisionPage=1
    ```

15. **Everything Combined**
    ```
    /dashboard/archive?focusStatus=PENDING&focusSortBy=mood&focusSortOrder=asc&focusSearch=complete&focusPage=1&decisionCategory=CAREER&decisionSortBy=title&decisionSortOrder=desc&decisionSearch=project&decisionPage=2
    ```

## How State Management Works

### URL-Based State
- All filters, sorting, and pagination state is stored in the URL
- URLs are shareable - send a link to show exact filtered view
- Browser back/forward buttons work correctly
- Bookmarkable - save URLs for quick access to common views

### Server-Side Processing
- Page fetches only the data needed for current view
- No client-side caching - always fresh data
- Database handles filtering and sorting efficiently
- Pagination reduces memory usage

### Client-Side Updates
When user interacts with the UI:
1. Client component updates URL parameters
2. Next.js re-renders the page server-side
3. New data is fetched with updated parameters
4. Page updates with fresh data

## Default Values

If parameters are omitted, these defaults apply:

**Focus Table:**
- Page: 1
- Sort By: date
- Sort Order: desc
- Status: (all)
- Search: (empty)

**Decision Table:**
- Page: 1
- Sort By: date
- Sort Order: desc
- Category: (all)
- Search: (empty)

## Clearing Filters

To clear all filters and return to default view:
```
/dashboard/archive
```

Or click the clear (X) button next to search inputs and select "All" in filter dropdowns.

# CreateA3Dialog - Test Specification from Requirements

**Date:** 2025-10-28
**Source:** day-02b-green-completion.md
**Purpose:** Test specification derived from REQUIREMENTS only (NOT implementation)

---

## 1. Functional Requirements

### Component Purpose

CreateA3Dialog is a modal dialog component that allows authenticated users to create new A3 documents.

### User Actions Supported

- **Open dialog** via trigger button
- **Fill form** with title, description (optional), and department selection
- **Submit form** to create A3 document
- **Cancel/Close** dialog without creating A3
- **Navigate** to newly created A3 detail page on success

### Happy Path Flow

1. User clicks "New A3" trigger button
2. Dialog opens and displays form with empty fields
3. User enters title (required)
4. User optionally enters description
5. User selects department from dropdown (required)
6. User clicks "Create" button
7. API creates A3 document
8. Success toast message appears ("A3 created successfully!")
9. Dialog closes automatically
10. User navigates to A3 detail page (`/app/a3/{id}`)

---

## 2. Business Logic Rules

### Title Validation

- **Required:** Title must not be empty
- **Trimming:** Whitespace-only titles are invalid (treated as empty)
- **Max Length:** Title must be 200 characters or less
- **Error Message:** "Title is required" (empty) or "Title must be 200 characters or less" (too long)

### Description Validation

- **Optional:** Description may be empty or omitted
- **Trimming:** Empty/whitespace-only descriptions are converted to `undefined` (not sent to API)
- **No Length Limit:** Description has no specified max length in requirements

### Department Validation

- **Required:** Department must be selected (non-empty value)
- **Error Message:** "Department is required"

### Form Data Processing

- **Title:** Trimmed before submission
- **Description:** Trimmed before submission; converted to `undefined` if empty after trimming
- **DepartmentId:** Passed as-is (no trimming needed for IDs)

---

## 3. Error Scenarios

### Authentication Errors (401)

- **Trigger:** User not authenticated (unlikely in this context - user must be logged in to access dialog)
- **Expected:** API returns error, toast shows error message
- **Dialog State:** Stays open to allow retry

### Authorization Errors (403)

- **Trigger:** User does not have permission to create A3 in selected department
- **Expected:** API returns error, toast shows error message
- **Dialog State:** Stays open to allow correction (select different department)

### Validation Errors (400)

- **Client-side validation:** Runs before API call, prevents submission
- **Server-side validation:** API may return additional validation errors
- **Expected:** Toast shows error message with validation details
- **Dialog State:** Stays open, form data preserved

### API/Network Errors (500, timeout)

- **Trigger:** Backend error or network failure
- **Expected:** Toast shows error message ("Failed to create A3" or specific error from API)
- **Dialog State:** Stays open to allow retry

### Generic Error Handling

- **Error Message Fallback:** If error has no `.message`, show "Failed to create A3"
- **Toast Always Shows:** Every error displays a user-visible toast notification

---

## 4. Edge Cases

### Empty/Whitespace Inputs

- **Empty title (`""`)**: Validation error "Title is required"
- **Whitespace-only title (`"   "`)**: Validation error "Title is required"
- **Empty description (`""`)**: Valid (optional field), converted to `undefined`
- **Whitespace-only description (`"   "`)**: Valid, converted to `undefined`
- **Empty department (`""`)**: Validation error "Department is required"

### Maximum Length Boundaries

- **Title exactly 200 chars**: Valid (boundary condition)
- **Title 201 chars**: Validation error "Title must be 200 characters or less"
- **Very long title (e.g., 250 chars)**: Validation error

### Null/Undefined Values

- **Title `null` or `undefined`**: Validation error "Title is required"
- **Department `null` or `undefined`**: Validation error "Department is required"
- **Description `null` or `undefined`**: Valid (optional field)

### Special Characters

- **Title with special chars (e.g., `"Test & <A3>"`)**: Valid (no sanitization specified in requirements)
- **Description with newlines/tabs**: Valid (no restrictions specified)

---

## 5. User Flows

### Happy Path: Create A3 Successfully

1. User clicks "New A3" button
2. Dialog opens (portal renders in browser)
3. Dialog title "Create new A3" is visible
4. Form fields are visible and empty:
   - Title input (text field)
   - Description textarea (optional)
   - Department select (dropdown with options)
5. User fills title: "E2E Test A3 - Full Flow"
6. User fills description: "Created via E2E test to validate dialog portal rendering"
7. User selects department (first option from seeded data)
8. User clicks "Create" button
9. API call succeeds, returns A3 with `id`
10. Toast shows "A3 created successfully!"
11. Dialog closes
12. Navigation to `/app/a3/{id}` occurs
13. A3 detail page displays with title "E2E Test A3 - Full Flow"

### Validation Flow: Empty Submit

1. User clicks "New A3" button
2. Dialog opens
3. User clicks "Create" button WITHOUT filling any fields
4. Client-side validation runs
5. Validation errors appear (title and department required)
6. Dialog stays open
7. Form fields are still empty (no values lost)
8. User fills title: "Valid Title"
9. User selects department
10. User clicks "Create" button
11. API call succeeds, A3 created

### Cancel Flow: Close Dialog Without Creating

1. User clicks "New A3" button
2. Dialog opens
3. User fills title: "This should be cleared"
4. User fills description: "This too"
5. User presses Escape key (OR clicks close button)
6. Dialog closes
7. Form is reset (no values retained)
8. User clicks "New A3" button again
9. Dialog opens with empty form

### Error Recovery Flow: API Error

1. User clicks "New A3" button
2. Dialog opens
3. User fills valid form data
4. User clicks "Create" button
5. API returns error (e.g., network timeout, server error)
6. Toast shows error message (e.g., "Network error")
7. Dialog stays open (does NOT close)
8. Form data is preserved (user does not lose input)
9. User clicks "Create" button again (retry)
10. API call succeeds on second attempt
11. A3 created, dialog closes, navigation occurs

### Keyboard Navigation Flow: Full Keyboard Control

1. User clicks "New A3" button
2. Dialog opens
3. User presses Tab key → Focus moves to first interactive element
4. User presses Tab again → Focus moves to title field
5. User types "Keyboard Nav Test"
6. User presses Tab → Focus moves to description field
7. User types "Testing keyboard navigation"
8. User presses Tab → Focus moves to department select
9. User presses ArrowDown → Highlights first department option
10. User presses Enter → Selects department
11. User presses Escape → Dialog closes
12. Dialog is no longer visible

---

## 6. Integration Points

### Backend API Operations

- **Operation:** `createA3` (Wasp client operation)
- **Input:**
  ```typescript
  {
    title: string (trimmed, 1-200 chars),
    description?: string (trimmed, undefined if empty),
    departmentId: string (non-empty)
  }
  ```
- **Output:**
  ```typescript
  {
    id: string (UUID or cuid),
    title: string,
    description?: string,
    departmentId: string,
    // ... other A3 fields
  }
  ```
- **Errors:**
  - 401: Not authenticated
  - 403: Not authorized to create in department
  - 400: Validation error (e.g., invalid department ID)
  - 500: Server error

### User Department Query

- **Operation:** `getUserDepartments` (Wasp query)
- **Purpose:** Fetch list of departments user can create A3s in
- **Output:**
  ```typescript
  Department[] {
    id: string,
    name: string,
    organizationId: string,
    // ... other department fields
  }
  ```
- **Usage:** Populate department dropdown options

### Navigation

- **Library:** `react-router-dom` (`useNavigate` hook)
- **Target:** `/app/a3/{id}` (A3 detail page)
- **Trigger:** After successful A3 creation
- **Timing:** Occurs AFTER dialog closes

### Toast Notifications

- **Library:** `sonner` (`toast` object)
- **Success Toast:** `toast.success("A3 created successfully!")`
- **Error Toast:** `toast.error(errorMessage)` (dynamic message from API error)
- **Display Duration:** Auto-dismisses (default Sonner behavior)

### Internationalization (i18n)

- **Keys Used:** (None specified in requirements - hardcoded English strings)
- **Error Messages:** Hardcoded in validation functions
- **UI Labels:** Hardcoded in component

---

## 7. Expected Error Messages

| Scenario                  | Expected Message                       |
| ------------------------- | -------------------------------------- |
| Empty title               | "Title is required"                    |
| Whitespace-only title     | "Title is required"                    |
| Title > 200 chars         | "Title must be 200 characters or less" |
| Empty department          | "Department is required"               |
| API error with message    | `error.message` (dynamic)              |
| API error without message | "Failed to create A3"                  |
| Successful creation       | "A3 created successfully!"             |

---

## 8. Expected Navigation Targets

| Scenario            | Target URL                            | Method       |
| ------------------- | ------------------------------------- | ------------ |
| Successful creation | `/app/a3/{id}`                        | `navigate()` |
| Cancel/Close        | No navigation (stays on current page) | N/A          |
| Validation error    | No navigation (stays on current page) | N/A          |
| API error           | No navigation (stays on current page) | N/A          |

---

## 9. Dialog Behavior Specifications

### Opening

- **Trigger:** Click on trigger button (prop: `trigger`)
- **Animation:** Dialog slides/fades in (Radix Dialog default)
- **Focus:** First interactive element receives focus
- **Body Scroll:** Disabled while dialog open (Radix Dialog default)

### Closing

- **Methods:**
  - Escape key
  - Close button (X icon)
  - Click outside dialog (optional - not specified)
  - Successful form submission
- **Form Reset:** Form data cleared on close
- **Body Scroll:** Re-enabled after dialog closes

### Portal Rendering

- **Behavior:** Dialog content renders outside component tree (via React portal)
- **DOM Location:** Appended to `document.body` (Radix Dialog default)
- **Accessibility:** Proper ARIA attributes (`role="dialog"`, `aria-modal="true"`)

---

## 10. Accessibility Requirements

### Keyboard Navigation

- **Tab:** Moves focus between form fields
- **Shift+Tab:** Moves focus backward
- **Enter:** Submits form (when on submit button)
- **Escape:** Closes dialog

### Screen Reader Support

- **Dialog Title:** Announced when dialog opens
- **Form Labels:** Associated with inputs via `aria-label` or `<label>` elements
- **Error Messages:** Announced when validation fails
- **Success Messages:** Toast messages announced

### Focus Management

- **On Open:** Focus moves to first interactive element (close button or first field)
- **On Close:** Focus returns to trigger button

---

## Test Specification Summary

### Test Counts

- **15 Functional Requirements** identified (component purpose, user actions, flows)
- **9 Business Rules** specified (validation for title, description, department)
- **12 Edge Cases** documented (empty inputs, boundaries, null values, special chars)
- **5 Major User Flows** defined (happy path, validation, cancel, error recovery, keyboard nav)
- **4 Integration Points** identified (createA3, getUserDepartments, navigate, toast)

### Test Strategy

- **Unit Tests (15):** Test business logic in isolation (validation functions, submission handler, form reset)
- **Component Tests (10):** Test component wiring and dependency integration
- **E2E Tests (5):** Test full user flows in real browser (dialog portal rendering, navigation, keyboard)

### Total Test Coverage

- **30 tests** across 3 layers (unit + component + E2E)
- **100% business logic coverage** (all validation rules, error scenarios, edge cases)
- **100% user flow coverage** (all 5 major flows tested)
- **Portal rendering validation** (E2E tests in real browser)

---

✅ **Test specification ready**
**15 functional requirements**, **9 business rules**, **12 edge cases**, **5 user flows**, **4 integration points** identified.

This specification can be used to write tests BEFORE looking at implementation code (proper TDD RED phase).

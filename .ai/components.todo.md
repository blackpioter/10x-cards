# Components Directory Restructuring TODO

## Current Issues
- Many loosely organized components in the root directory
- Related components not grouped together
- Test files in a separate directory instead of alongside components
- Lack of consistent component organization pattern

## Recommended Structure
```
components/
├── common/
│   ├── ErrorNotification/
│   ├── PaginationControls/
│   └── Providers/
├── flashcards/
│   ├── FlashcardForm/
│   ├── FlashcardList/
│   ├── FlashcardStats/
│   ├── FlashcardReviewSection/
│   └── ... (other flashcard components)
├── generation/
│   ├── GenerateView/
│   ├── GenerationProgress/
│   ├── TextInputSection/
│   └── ...
├── layout/
│   └── TopNavbar/
├── ui/
│   └── ... (UI components)
└── auth/
    └── ... (auth components)
```

## Action Items

### 1. Create Domain-Specific Folders
- [ ] Create `flashcards/` directory for all flashcard-related components
- [ ] Create `generation/` directory for content generation components
- [ ] Create `common/` directory for shared components
- [ ] Create `layout/` directory for structural components

### 2. Implement Component-Based Structure
- [ ] Move each component to its own directory with index.tsx as the main file
- [ ] Co-locate test files with the components they test
- [ ] Keep component-specific utilities, types, and hooks in the component's directory

### 3. Refactor Component Organization
- [ ] Move `FlashcardList.tsx`, `FlashcardStats.tsx`, etc. to `flashcards/` directory
- [ ] Move `GenerateView.tsx`, `GenerationProgress.tsx`, etc. to `generation/` directory
- [ ] Move `TopNavbar.tsx` to `layout/` directory
- [ ] Move `ErrorNotification.tsx`, `PaginationControls.tsx` to `common/` directory

### 4. Update Imports
- [ ] Update all import statements to reflect new component locations
- [ ] Consider creating barrel exports (index.ts files) for simplified imports

### 5. Standardize Component Structure
- [ ] Each component directory should contain:
  - `index.tsx` - Main component file
  - `Component.test.tsx` - Component tests
  - `types.ts` (optional) - Component-specific types
  - `utils.ts` (optional) - Component-specific utilities
  - `styles.ts` (optional) - Component-specific styles

## Benefits
- Improved code organization and discoverability
- Easier maintenance and scalability
- Better separation of concerns
- More intuitive component structure for new developers
- Simplified testing with co-located test files

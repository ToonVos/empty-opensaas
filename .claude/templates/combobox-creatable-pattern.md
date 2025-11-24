# Creatable ComboBox Pattern

**USE THIS:** Standaard pattern voor alle comboboxen met "Create New" functionaliteit.

**PROBLEEM:** cmdk (ShadCN Command component) heeft automatic filtering die conflicteert met manual conditional rendering, waardoor "Create New" buttons intermitterend verdwijnen.

**OPLOSSING:** Disable automatic filtering + force mount create button.

---

## Quick Fix Template

**ALTIJD toepassen bij comboboxen met "Create New" functionaliteit:**

```typescript
<Command shouldFilter={false}>  {/* ✅ CRITICAL - Disable automatic filtering */}
  <CommandInput
    placeholder={t('common.search')}
    value={search}
    onValueChange={setSearch}
  />
  <CommandList>
    {/* Existing items - manually filtered */}
    {filteredItems.length > 0 && (
      <CommandGroup>
        {filteredItems.map((item) => (
          <CommandItem key={item.id} onSelect={() => handleSelect(item.id)}>
            {item.name}
          </CommandItem>
        ))}
      </CommandGroup>
    )}

    {/* Create New Button */}
    {canCreate && isSearchTermUnique && (
      <CommandGroup>
        <CommandItem
          forceMount  {/* ✅ CRITICAL - Prevent cmdk from filtering this out */}
          onSelect={handleCreate}
          disabled={isCreating}
          className="text-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? t('common.creating') : `${t('common.create')} "${search.trim()}"`}
        </CommandItem>
      </CommandGroup>
    )}
  </CommandList>
</Command>
```

---

## Waarom Deze Fix Nodig Is

### Het Probleem: Double Filtering

Bij "creatable combobox" patterns heb je:

1. **Manual filtering** - `filterItems(items, search)` voor bestaande items
2. **cmdk automatic filtering** - Ingebouwde filtering op CommandItem `value` prop

Deze twee mechanismen conflicteren:

- Manual logic zegt: "Show create button" (React conditional rendering)
- cmdk automatic filter zegt: "Hide create button" (geen match met search term)
- Resultaat: Button verschijnt/verdwijnt intermitterend (timing race condition)

### De Oplossing: Twee Props

**1. `shouldFilter={false}` op Command component**

- Disables cmdk's automatic filtering completely
- Gives full control to your manual `filterItems()` function
- Prevents cmdk from hiding items based on search term

**2. `forceMount` op Create New CommandItem**

- Forces the item to render regardless of filter scores
- Backup safety net if `shouldFilter={false}` isn't sufficient
- Prevents asynchronous filtering from hiding the button

---

## Complete Component Example

```typescript
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useAuth } from 'wasp/client/auth';

import { cn } from '../../../lib/utils';
import { Button } from '../../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';

// Business logic (testable pure functions)
function filterItems<T extends { name: string }>(items: T[], searchTerm: string): T[] {
  if (!searchTerm || !searchTerm.trim()) return items;
  const normalized = searchTerm.toLowerCase().trim();
  return items.filter((item) => item.name.toLowerCase().includes(normalized));
}

function canCreateEntity(user: { id: string; orgRole: string } | null): boolean {
  if (!user) return false;
  return user.orgRole === 'OWNER' || user.orgRole === 'ADMIN' || user.orgRole === 'MEMBER';
}

// Component
export function CreatableCombobox({ label, value, items, onChange, onCreate }) {
  const { t } = useTranslation();
  const { data: user } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const selectedItem = items.find((item) => item.id === value);
  const filteredItems = filterItems(items, search);
  const canCreate = onCreate && canCreateEntity(user ?? null);
  const isSearchTermUnique =
    search.trim() &&
    filteredItems.length === 0 &&
    !items.some((item) => item.name.toLowerCase() === search.toLowerCase().trim());

  const handleSelect = (itemId: string) => {
    onChange(itemId === value ? '' : itemId);
    setOpen(false);
    setSearch('');
  };

  const handleCreate = async () => {
    if (!onCreate || !search.trim()) return;
    try {
      setIsCreating(true);
      await onCreate(search.trim());
      setSearch('');
      setOpen(false);
    } catch (err) {
      console.error('Failed to create:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open}>
          {selectedItem ? selectedItem.name : t('common.selectOption')}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>  {/* ✅ CRITICAL FIX #1 */}
          <CommandInput
            placeholder={t('common.search')}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{t('common.noResults')}</CommandEmpty>

            {/* Existing Items */}
            {filteredItems.length > 0 && (
              <CommandGroup>
                {filteredItems.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item.id)}>
                    <Check className={cn('mr-2 h-4 w-4', value === item.id ? 'opacity-100' : 'opacity-0')} />
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Create New Button */}
            {canCreate && isSearchTermUnique && (
              <CommandGroup>
                <CommandItem
                  forceMount  {/* ✅ CRITICAL FIX #2 */}
                  onSelect={handleCreate}
                  disabled={isCreating}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? t('common.creating') : `${t('common.create')} "${search.trim()}"`}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

---

## Testing Strategy

**3-Layer Testing (Portal Component Pattern):**

1. **Unit Tests** (`*.logic.test.ts`)

   - Test `filterItems()` function
   - Test `canCreateEntity()` permission logic
   - Test `validateEntityName()` validation rules

2. **Component Tests** (`*.test.tsx`) - Simplified

   - Test props are passed correctly
   - Test basic rendering
   - Accept portal behavior as implementation detail

3. **E2E Tests** (`*.spec.ts`) - Complete UX
   - Test "Create New" button appears consistently
   - Test entity creation workflow
   - Test permission-based visibility

**→ See:** `app/src/components/a3/editor/sections/project-info/ComboboxField` for complete example

---

## When to Use This Pattern

**✅ USE when:**

- ComboBox with "Create New" functionality
- Manual filtering of existing items
- Conditional "create" button visibility
- Using cmdk/ShadCN Command component

**❌ NOT NEEDED when:**

- Simple select dropdown (no search)
- Read-only combobox (no create)
- Using native HTML `<select>` element

---

## Red Flags (Apply This Fix!)

Watch for these symptoms:

- ❌ "Create New" button appears sometimes, disappears other times
- ❌ Button visibility is inconsistent/unstable
- ❌ Button flashes briefly then vanishes
- ❌ Console warnings about cmdk filtering

**Solution:** Apply the two-prop fix above!

---

## References

- **cmdk docs:** https://cmdk.paco.me/
- **ShadCN Command:** https://ui.shadcn.com/docs/components/command
- **Issue Discussion:** cmdk GitHub - "Creatable combobox" pattern limitations
- **Live Example:** `app/src/components/a3/editor/sections/project-info/ComboboxField.tsx`

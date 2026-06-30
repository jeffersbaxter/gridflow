import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setQuery, setStatusFilter } from '../features/sheet/sheetSlice';
import { selectQuery, selectStatusFilter } from '../features/sheet/selectors';
import type { TaskStatus } from '../types';

const FILTERS: Array<{ value: TaskStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'complete', label: 'Complete' },
];

export function Toolbar() {
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectQuery);
  const statusFilter = useAppSelector(selectStatusFilter);

  return (
    <div className="toolbar">
      <div className="search">
        <span className="search__icon" aria-hidden="true">⌕</span>
        <input
          type="text"
          aria-label="Search tasks"
          placeholder="Search tasks or people…"
          value={query}
          onChange={(e) => dispatch(setQuery(e.target.value))}
        />
      </div>
      <div className="filters" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className="chip"
            aria-pressed={statusFilter === f.value}
            onClick={() => dispatch(setStatusFilter(f.value))}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

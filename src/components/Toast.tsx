import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { dismissRollback } from '../features/sheet/sheetSlice';
import { selectRollbackMessage } from '../features/sheet/selectors';

/** Transient banner shown when an optimistic write is rolled back. Auto-dismisses. */
export function Toast() {
  const dispatch = useAppDispatch();
  const message = useAppSelector(selectRollbackMessage);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => dispatch(dismissRollback()), 4000);
    return () => clearTimeout(timer);
  }, [message, dispatch]);

  if (!message) return null;

  return (
    <div className="toast" role="alert">
      <span className="toast__icon" aria-hidden="true">↺</span>
      <span className="toast__msg">{message}</span>
      <button
        type="button"
        className="toast__close"
        aria-label="Dismiss"
        onClick={() => dispatch(dismissRollback())}
      >
        ✕
      </button>
    </div>
  );
}

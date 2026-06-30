import { renderWithStore, screen } from '../test/renderWithStore';
import { StatusBadge } from './StatusBadge';

describe('<StatusBadge />', () => {
  it('shows a human label for each status', () => {
    const { rerender } = renderWithStore(<StatusBadge status="in_progress" />);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('In progress');

    rerender(<StatusBadge status="blocked" />);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Blocked');
  });

  it('applies a status-specific class for styling', () => {
    renderWithStore(<StatusBadge status="complete" />);
    expect(screen.getByTestId('status-badge')).toHaveClass('badge--complete');
  });
});

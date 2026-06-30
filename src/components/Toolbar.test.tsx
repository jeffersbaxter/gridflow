import userEvent from '@testing-library/user-event';
import { renderWithStore, screen } from '../test/renderWithStore';
import { Toolbar } from './Toolbar';

describe('<Toolbar />', () => {
  it('renders the search box and status chips', () => {
    renderWithStore(<Toolbar />);
    expect(screen.getByLabelText('Search tasks')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Blocked' })).toBeInTheDocument();
  });

  it('writes the typed query into the store', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<Toolbar />);
    await user.type(screen.getByLabelText('Search tasks'), 'renderer');
    expect(store.getState().sheet.query).toBe('renderer');
  });

  it('marks the chosen status chip as pressed', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<Toolbar />);
    await user.click(screen.getByRole('button', { name: 'Blocked' }));
    expect(store.getState().sheet.statusFilter).toBe('blocked');
    expect(screen.getByRole('button', { name: 'Blocked' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});

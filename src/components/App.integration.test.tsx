import userEvent from '@testing-library/user-event';
import { renderWithStore, screen, waitFor, within } from '../test/renderWithStore';
import { App } from '../App';

// Integration test: mounts the whole app against the mock API and exercises a
// realistic flow — load, filter, edit a status, and act on an agent insight.
describe('GridFlow integration', () => {
  it('loads tasks from the API and renders rows', async () => {
    renderWithStore(<App />);
    await waitFor(() =>
      expect(screen.getByText('Define Q3 roadmap')).toBeInTheDocument()
    );
    expect(screen.getAllByTestId('task-row').length).toBeGreaterThan(0);
  });

  it('surfaces an agent insight on a flagged task', async () => {
    renderWithStore(<App />);
    await waitFor(() =>
      expect(
        screen.getByText(/velocity suggests this slips/i)
      ).toBeInTheDocument()
    );
    expect(screen.getAllByRole('note', { name: 'Agent insight' }).length).toBeGreaterThan(0);
  });

  it('filters the grid by search text', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);
    await waitFor(() =>
      expect(screen.getByText('Define Q3 roadmap')).toBeInTheDocument()
    );
    await user.type(screen.getByLabelText('Search tasks'), 'renderer');
    await waitFor(() =>
      expect(screen.queryByText('Define Q3 roadmap')).not.toBeInTheDocument()
    );
    expect(
      screen.getByText('Migrate grid renderer to virtualized list')
    ).toBeInTheDocument();
  });

  it('updates a task status through the API and reflects it in the badge', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);
    await waitFor(() =>
      expect(
        screen.getByText('Write E2E test for sharing flow')
      ).toBeInTheDocument()
    );

    const select = screen.getByLabelText(
      'Status for Write E2E test for sharing flow'
    );
    await user.selectOptions(select, 'in_progress');

    await waitFor(() =>
      expect(
        (select as HTMLSelectElement).value
      ).toBe('in_progress')
    );
  });

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);
    await waitFor(() =>
      expect(screen.getByText('Define Q3 roadmap')).toBeInTheDocument()
    );
    await user.type(screen.getByLabelText('Search tasks'), 'zzzznomatch');
    await waitFor(() =>
      expect(
        screen.getByText('No tasks match your filters')
      ).toBeInTheDocument()
    );
  });

  it('reflects derived completion stats in the summary strip', async () => {
    renderWithStore(<App />);
    // Wait for the tasks (which carry the hasAgentInsight flag) to load.
    await waitFor(() =>
      expect(screen.getByText('Define Q3 roadmap')).toBeInTheDocument()
    );
    const summary = screen.getByRole('group', { name: 'Project summary' });
    // Three tasks are flagged in the fixture data. Scope the assertion to the
    // agent-insights stat so it doesn't collide with other numeric cells.
    const insightStat = within(summary)
      .getByText('Agent insights')
      .closest('.stat') as HTMLElement;
    await waitFor(() =>
      expect(within(insightStat).getByText('3')).toBeInTheDocument()
    );
  });
});

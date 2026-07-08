import userEvent from '@testing-library/user-event';
import { renderWithStore, screen, waitFor, within } from '../test/renderWithStore';
import { failNextPatch } from '../api/client';
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

  it('applies a status edit optimistically before the server confirms', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);
    await waitFor(() =>
      expect(
        screen.getByText('Write E2E test for sharing flow')
      ).toBeInTheDocument()
    );

    const select = screen.getByLabelText(
      'Status for Write E2E test for sharing flow'
    ) as HTMLSelectElement;

    // The change is reflected immediately (optimistically), and the row shows a
    // saving cue while the write is in flight.
    await user.selectOptions(select, 'in_progress');
    expect(select.value).toBe('in_progress');

    // Eventually the in-flight cue clears once the server confirms.
    await waitFor(() =>
      expect(screen.queryByText(/saving…/)).not.toBeInTheDocument()
    );
    expect(select.value).toBe('in_progress');
  });

  it('rolls back the optimistic edit and shows a toast when the server fails', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);
    await waitFor(() =>
      expect(
        screen.getByText('Accessibility audit of toolbar')
      ).toBeInTheDocument()
    );

    const select = screen.getByLabelText(
      'Status for Accessibility audit of toolbar'
    ) as HTMLSelectElement;
    expect(select.value).toBe('not_started');

    // Arm the next write to fail, then make the edit.
    failNextPatch(true);
    await user.selectOptions(select, 'complete');

    // Optimistically it flips immediately…
    expect(select.value).toBe('complete');

    // …then the failure rolls it back to the original value and shows a toast.
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );
    await waitFor(() => expect(select.value).toBe('not_started'));
  });
});

import { Toolbar } from './components/Toolbar';
import { StatStrip } from './components/StatStrip';
import { SheetGrid } from './components/SheetGrid';
import { Toast } from './components/Toast';
import './styles/app.css';

export function App() {
  return (
    <div className="app">
      <header className="masthead">
        <div className="brand">
          <div className="brand__mark" aria-hidden="true" />
          <div>
            <div className="brand__name">Grid<span>Flow</span></div>
          </div>
        </div>
        <p className="masthead__tag">
          A shared surface where the team’s grid and its AI agents work the same rows —
          so people keep the judgment and agents take the busywork.
        </p>
      </header>

      <StatStrip />
      <Toolbar />
      <SheetGrid />
      <Toast />

      <p className="footnote">
        GridFlow · portfolio demo · React + TypeScript + Redux Toolkit, tested with Jest &amp; React Testing Library
      </p>
    </div>
  );
}

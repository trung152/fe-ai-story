import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import ReadPage from './pages/ReadPage';
import ContinuePage from './pages/ContinuePage';

export default function App() {
    return (
        <div className="app">
            <header className="app-header">
                <a href="/" className="logo">
                    <span className="logo-icon">✦</span>
                    <span className="logo-text">AI Story</span>
                </a>
            </header>
            <main className="app-main">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/create" element={<CreatePage />} />
                    <Route path="/story/:id" element={<ReadPage />} />
                    <Route path="/story/:id/continue" element={<ContinuePage />} />
                </Routes>
            </main>
        </div>
    );
}

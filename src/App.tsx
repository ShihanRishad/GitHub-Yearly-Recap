import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/home-page';
import { RecapPage } from '@/pages/recap-page';
import { AboutPage } from '@/pages/about-page';
import { Analytics } from '@vercel/analytics/react';

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/u/:username/:year?" element={<RecapPage />} />
                <Route path="/about" element={<AboutPage />} />
            </Routes>
            <Analytics />
        </BrowserRouter>
    );
}

export default App;
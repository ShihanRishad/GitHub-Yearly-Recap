import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/home-page';
import { RecapPage } from '@/pages/recap-page';

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/u/:username/:year?" element={<RecapPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
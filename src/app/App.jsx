import ReactDOM from 'react-dom/client';
import '@/shared/index.css'
import { StrictMode } from 'react';
import AppRouter from './AppRouter';
import { ThemeProvider } from '@/lib/context/ThemeContext.jsx';

export default function App() {
    return (
        <StrictMode>
            <ThemeProvider>
                <AppRouter/>
            </ThemeProvider>
        </StrictMode>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);


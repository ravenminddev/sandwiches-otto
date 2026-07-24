import ReactDOM from 'react-dom/client';
import '@/shared/index.css'
import { StrictMode } from 'react';
import AppRouter from './AppRouter';

export default function App() {
    return (
        <StrictMode>
            <AppRouter/>
        </StrictMode>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);


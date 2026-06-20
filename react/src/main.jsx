import './index.css';
import axios from 'axios';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { setupAxios } from './auth';

setupAxios(axios);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

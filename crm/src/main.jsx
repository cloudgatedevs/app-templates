import './index.css';
import axios from 'axios';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { setupAxios } from './auth';
import { APP_NAME } from './services/config';
import './services/apiClient';

document.title = APP_NAME;

setupAxios(axios);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

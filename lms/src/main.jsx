import './index.css';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { APP_NAME } from './services/config';

document.title = APP_NAME;

// Session bootstrap (redirect tokens, refresh, bearer headers) is handled by
// @cloudgatedevs/cloudgate-client — see src/services/auth.js and AuthProvider.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

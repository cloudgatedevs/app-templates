import './index.css';
import './theme.css';
import './polish.css';
import ReactDOM from 'react-dom/client';
import { App } from './App';

// Session bootstrap (redirect tokens, refresh, bearer headers) is handled by
// @cloudgatedevs/cloudgate-client — see src/services/auth.js and AuthProvider.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

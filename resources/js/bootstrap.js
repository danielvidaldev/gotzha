import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Enable client-side API mocking for static deployments (Vercel/Netlify)
if (import.meta.env.VITE_MOCK_API === 'true') {
    import('./mocks/api').then(({ setupMockApi }) => setupMockApi());
}

# HTTP Interceptors
Owner: Vidhi (User + Authentication)
- `api.interceptor.ts`: Attaches Bearer JWT token to requests directed to `/api/*`.
- `error.interceptor.ts`: Catches HTTP errors, handles 401 token invalidation, and routes to login.

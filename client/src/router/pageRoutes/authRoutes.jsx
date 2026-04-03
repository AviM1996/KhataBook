import { lazy } from 'react';
const Login = lazy(() => import('../../pages/auth/SignIn'));
const Home = lazy(() => import('../../pages/auth/Home'));

export const authRoutes = [
    {
        path: '/',
        element: <Home />,
        meta: {
            layout: 'auth',
            public: true,
        },
    },
    {
        path: '/login',
        element: <Login />,
        meta: {
            layout: 'auth',
            public: true,
        },
    },
];
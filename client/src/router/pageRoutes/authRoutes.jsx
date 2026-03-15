import Login from '../../pages/auth/SignIn';
import Home from '../../pages/auth/Home';

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
    // {
    //     path: '/register',
    //     element: <Login />,
    //     meta: {
    //         layout: 'auth',
    //         public: true,
    //     },
    // },

];
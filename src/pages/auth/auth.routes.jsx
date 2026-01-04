import Login from './SignIn';
import Home from './Home';

export const authRoutes = [
  {
    path: '/',
    element: <Home/>,
    meta: {
      layout: 'auth',

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

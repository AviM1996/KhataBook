import Layout from '../../components/Layout';

export const applyLayouts = (routes) =>
  routes.map((route) => ({
    ...route,
    element:
      route.meta?.layout === 'auth'
        ? route.element
        : <Layout>{route.element}</Layout>,
  }));

export const defaultRouteMeta = {
    protected: true,
    guard: "auth",
};

export function applyMeta(routes){
    return routes.map((route) => ({
        ...route,
        meta: {
            ...defaultRouteMeta,
            ...route.meta,
        },
    }));    
}
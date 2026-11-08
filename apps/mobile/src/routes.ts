export const privateRoutes=['/app','/history','/record','/learn','/profile','/events','/evolution'] as const;
export type PrivateRoute=typeof privateRoutes[number];
export function safePrivateRoute(value:string):PrivateRoute|null{return (privateRoutes as readonly string[]).includes(value)?value as PrivateRoute:null;}
export function currentRoute(){return typeof window!=='undefined'&&window.location?window.location.hash.slice(1)||'/':'/';}
export function goRoute(route:string){if(typeof window!=='undefined'&&window.location)window.location.hash=route;}

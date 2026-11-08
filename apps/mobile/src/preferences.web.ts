// Only a non-clinical display preference. Never read or copy record storage keys.
export type ThemePreference='light'|'dark'|'system';
const key='pulso.theme.v1';
export function readTheme():{theme:ThemePreference;warning:string}{
 try{const value=window.localStorage.getItem(key);return {theme:value==='dark'?'dark':value==='light'?'light':'system',warning:''};}
 catch{return {theme:'system',warning:'Não foi possível ler a preferência de tema. O tema funciona nesta sessão.'};}
}
export function writeTheme(theme:ThemePreference):string{
 try{window.localStorage.setItem(key,theme);return '';}
 catch{return 'Não foi possível guardar o tema. A alteração mantém-se apenas nesta sessão.';}
}

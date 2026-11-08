export type ThemePreference='light'|'dark'|'system';
// The supported product is web on Windows. Native persistent storage is not installed.
export function readTheme():{theme:ThemePreference;warning:string}{return {theme:'system',warning:''};}
export function writeTheme(_theme:ThemePreference){return 'Nesta versão nativa, o tema mantém-se apenas durante a sessão.';}

export interface LangIcon {
  file: string;
  color: string;
  animated?: boolean;
}

// file = filename in /public/icons/languages/ (without .svg)
// animated = true means SMIL animated SVG from fyniti
export const LANG_ICONS: Record<string, LangIcon> = {
  // Animated (from fyniti)
  JavaScript: { file: 'js', color: 'f7df1e', animated: true },
  Python: { file: 'python', color: '3776ab', animated: true },
  Java: { file: 'java', color: 'ed8b00', animated: true },
  Go: { file: 'go', color: '00add8', animated: true },
  Rust: { file: 'rust', color: 'dea584', animated: true },
  Ruby: { file: 'ruby', color: 'cc342d', animated: true },
  PHP: { file: 'php', color: '777bb4', animated: true },
  '.NET': { file: 'csharp', color: '512bd4', animated: true },
  Swift: { file: 'swift', color: 'f05138', animated: true },
  'C++': { file: 'cpp', color: '00599c', animated: true },
  'Node.js': { file: 'nodejs', color: '5fa04e', animated: true },
  TypeScript: { file: 'ts', color: '3178c6', animated: true },
  // Static (downloaded from Simple Icons)
  Kotlin: { file: 'kotlin', color: '7f52ff' },
  Dart: { file: 'dart', color: '0175c2' },
  Elixir: { file: 'elixir', color: '4b275f' },
  Erlang: { file: 'erlang', color: 'a90533' },
  Haskell: { file: 'haskell', color: '5e5086' },
  Scala: { file: 'scala', color: 'dc322f' },
  Clojure: { file: 'clojure', color: '5881d8' },
  Lua: { file: 'lua', color: '2c2d72' },
  Perl: { file: 'perl', color: '39457e' },
  PostgreSQL: { file: 'postgresql', color: '4169e1' },
  Deno: { file: 'deno', color: '70ffaf' },
  Bun: { file: 'bun', color: 'f9f1e1' },
  Crystal: { file: 'crystal', color: '000000' },
  OCaml: { file: 'ocaml', color: 'ec6813' },
  Delphi: { file: 'delphi', color: 'ee1f35' },
  Groovy: { file: 'groovy', color: '4298b8' },
  Ada: { file: 'ada', color: '02f88c' },
  D: { file: 'dlang', color: 'b03931' },
  PowerShell: { file: 'powershell', color: '5391fe' },
  'Objective-C': { file: 'objectivec', color: '000000' },
  C: { file: 'c', color: 'a8b9cc' },
};

export function getIconSrc(language: string): {
  src: string;
  isAnimated: boolean;
  color: string;
} {
  const icon = LANG_ICONS[language];
  if (!icon) return { src: `/icons/languages/js.svg`, isAnimated: false, color: '888888' };
  return {
    src: `/icons/languages/${icon.file}.svg`,
    isAnimated: icon.animated === true,
    color: icon.color,
  };
}

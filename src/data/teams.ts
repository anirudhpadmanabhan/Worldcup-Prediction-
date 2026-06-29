import { Team } from "../types";

export const TEAMS: Team[] = [
  { id: "usa", name: "United States", code: "USA", flagColor: "from-blue-600 via-white to-red-600", bgColor: "bg-blue-900", emoji: "🇺🇸", ranking: 11, group: "A" },
  { id: "mex", name: "Mexico", code: "MEX", flagColor: "from-green-600 via-white to-red-600", bgColor: "bg-green-900", emoji: "🇲🇽", ranking: 15, group: "A" },
  { id: "can", name: "Canada", code: "CAN", flagColor: "from-red-600 via-white to-red-600", bgColor: "bg-red-950", emoji: "🇨🇦", ranking: 40, group: "A" },
  { id: "ecu", name: "Ecuador", code: "ECU", flagColor: "from-yellow-400 via-blue-600 to-red-600", bgColor: "bg-yellow-900", emoji: "🇪🇨", ranking: 31, group: "A" },
  
  { id: "arg", name: "Argentina", code: "ARG", flagColor: "from-sky-400 via-white to-sky-400", bgColor: "bg-sky-950", emoji: "🇦🇷", ranking: 1, group: "B" },
  { id: "bra", name: "Brazil", code: "BRA", flagColor: "from-green-500 via-yellow-400 to-blue-600", bgColor: "bg-yellow-950", emoji: "🇧🇷", ranking: 5, group: "B" },
  { id: "col", name: "Colombia", code: "COL", flagColor: "from-yellow-400 via-blue-600 to-red-600", bgColor: "bg-yellow-900", emoji: "🇨🇴", ranking: 12, group: "B" },
  
  { id: "eng", name: "England", code: "ENG", flagColor: "from-white via-red-600 to-white", bgColor: "bg-slate-900", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", ranking: 4, group: "C" },
  { id: "fra", name: "France", code: "FRA", flagColor: "from-blue-700 via-white to-red-600", bgColor: "bg-blue-950", emoji: "🇫🇷", ranking: 2, group: "C" },
  
  { id: "spa", name: "Spain", code: "ESP", flagColor: "from-red-600 via-yellow-500 to-red-600", bgColor: "bg-red-900", emoji: "🇪🇸", ranking: 8, group: "D" },
  { id: "ger", name: "Germany", code: "GER", flagColor: "from-black via-red-600 to-yellow-500", bgColor: "bg-neutral-900", emoji: "🇩🇪", ranking: 16, group: "D" },
  { id: "por", name: "Portugal", code: "POR", flagColor: "from-green-600 to-red-600", bgColor: "bg-red-950", emoji: "🇵🇹", ranking: 6, group: "D" },
  { id: "ned", name: "Netherlands", code: "NED", flagColor: "from-orange-500 via-white to-blue-600", bgColor: "bg-orange-950", emoji: "🇳🇱", ranking: 7, group: "D" },
  
  { id: "bel", name: "Belgium", code: "BEL", flagColor: "from-black via-yellow-400 to-red-600", bgColor: "bg-red-950", emoji: "🇧🇪", ranking: 3, group: "E" },
  { id: "cro", name: "Croatia", code: "CRO", flagColor: "from-red-600 via-white to-blue-600", bgColor: "bg-red-900", emoji: "🇭🇷", ranking: 10, group: "E" },
  { id: "swi", name: "Switzerland", code: "SUI", flagColor: "from-red-600 via-white to-red-600", bgColor: "bg-red-900", emoji: "🇨🇭", ranking: 19, group: "E" },
  
  { id: "mar", name: "Morocco", code: "MAR", flagColor: "from-red-600 via-green-600 to-red-600", bgColor: "bg-red-950", emoji: "🇲🇦", ranking: 13, group: "F" },
  { id: "sen", name: "Senegal", code: "SEN", flagColor: "from-green-600 via-yellow-400 to-red-600", bgColor: "bg-emerald-950", emoji: "🇸🇳", ranking: 17, group: "F" },
  
  { id: "jpn", name: "Japan", code: "JPN", flagColor: "from-white via-red-600 to-white", bgColor: "bg-slate-900", emoji: "🇯🇵", ranking: 18, group: "G" },
  { id: "aus", name: "Australia", code: "AUS", flagColor: "from-blue-800 to-red-600", bgColor: "bg-emerald-900", emoji: "🇦🇺", ranking: 23, group: "G" },
  
  { id: "rsa", name: "South Africa", code: "RSA", flagColor: "from-green-600 via-yellow-500 to-red-600", bgColor: "bg-emerald-950", emoji: "🇿🇦", ranking: 59, group: "A" },
  { id: "par", name: "Paraguay", code: "PAR", flagColor: "from-blue-600 via-white to-red-600", bgColor: "bg-red-950", emoji: "🇵🇾", ranking: 56, group: "D" },
  { id: "swe", name: "Sweden", code: "SWE", flagColor: "from-blue-600 to-yellow-400", bgColor: "bg-blue-900", emoji: "🇸🇪", ranking: 28, group: "C" },
  { id: "bos", name: "Bosnia and Herzegovina", code: "BIH", flagColor: "from-blue-800 via-yellow-400 to-blue-800", bgColor: "bg-blue-950", emoji: "🇧🇦", ranking: 74, group: "A" },
  { id: "aut", name: "Austria", code: "AUT", flagColor: "from-red-600 via-white to-red-600", bgColor: "bg-red-950", emoji: "🇦🇹", ranking: 22, group: "D" },
  { id: "civ", name: "Ivory Coast", code: "CIV", flagColor: "from-orange-500 via-white to-green-500", bgColor: "bg-amber-950", emoji: "🇨🇮", ranking: 38, group: "G" },
  { id: "nor", name: "Norway", code: "NOR", flagColor: "from-red-600 via-blue-800 to-red-600", bgColor: "bg-red-950", emoji: "🇳🇴", ranking: 47, group: "G" },
  { id: "cod", name: "DR Congo", code: "COD", flagColor: "from-blue-500 via-yellow-400 to-red-600", bgColor: "bg-sky-950", emoji: "🇨🇩", ranking: 61, group: "B" },
  { id: "alg", name: "Algeria", code: "ALG", flagColor: "from-green-600 via-white to-red-600", bgColor: "bg-emerald-950", emoji: "🇩🇿", ranking: 44, group: "F" },
  { id: "gha", name: "Ghana", code: "GHA", flagColor: "from-red-600 via-yellow-400 to-green-600", bgColor: "bg-amber-950", emoji: "🇬🇭", ranking: 64, group: "F" },
  { id: "egy", name: "Egypt", code: "EGY", flagColor: "from-red-600 via-white to-black", bgColor: "bg-red-950", emoji: "🇪🇬", ranking: 36, group: "E" },
  { id: "cpv", name: "Cabo Verde", code: "CPV", flagColor: "from-blue-600 via-white to-red-600", bgColor: "bg-blue-950", emoji: "🇨🇻", ranking: 65, group: "E" }
];

export const getTeamById = (id: string | null): Team | null => {
  if (!id) return null;
  return TEAMS.find(t => t.id === id) || null;
};

export const getFlagUrl = (teamId: string | null): string => {
  if (!teamId) return "https://flagcdn.com/w80/un.png";
  const codes: Record<string, string> = {
    usa: "us",
    mex: "mx",
    can: "ca",
    ecu: "ec",
    arg: "ar",
    bra: "br",
    col: "co",
    eng: "gb-eng",
    fra: "fr",
    spa: "es",
    ger: "de",
    por: "pt",
    ned: "nl",
    bel: "be",
    cro: "hr",
    swi: "ch",
    mar: "ma",
    sen: "sn",
    jpn: "jp",
    aus: "au",
    rsa: "za",
    par: "py",
    swe: "se",
    bos: "ba",
    aut: "at",
    civ: "ci",
    nor: "no",
    cod: "cd",
    alg: "dz",
    gha: "gh",
    egy: "eg",
    cpv: "cv"
  };
  const code = codes[teamId.toLowerCase()] || "us";
  if (code === "gb-eng") {
    return "https://flagcdn.com/w80/gb-eng.png";
  }
  return `https://flagcdn.com/w80/${code}.png`;
};

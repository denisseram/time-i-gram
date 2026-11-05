/**
 * Colors of the temporal examples: the Okabe & Ito palette (Okabe & Ito 2008, "Color Universal Design"), distinguishable
 * with the common forms of color-vision deficiency. Every categorical color and every fixed mark color of the temporal
 * examples comes from here, and the same thing has the same color in every example (an industry, a flu season or
 * year, a kind of weather). Quantitative color scales keep their gradients (`viridis`, `bupu`, `hot`, ...).
 */
export const OKABE_ITO = {
    orange: '#E69F00',
    skyBlue: '#56B4E9',
    bluishGreen: '#009E73',
    yellow: '#F0E442',
    blue: '#0072B2',
    vermillion: '#D55E00',
    reddishPurple: '#CC79A7',
    black: '#000000'
} as const;

/**
 * The palette in the order categories take it. Yellow comes late: thin lines and small points in yellow are hard to
 * read on white.
 */
export const CATEGORICAL = [
    OKABE_ITO.orange,
    OKABE_ITO.skyBlue,
    OKABE_ITO.bluishGreen,
    OKABE_ITO.blue,
    OKABE_ITO.vermillion,
    OKABE_ITO.reddishPurple,
    OKABE_ITO.yellow,
    OKABE_ITO.black
];

/** The color of a single series (one color, no legend needed beyond the track title). */
export const SINGLE = OKABE_ITO.blue;

/** Brushes: a light, transparent overlay. */
export const BRUSH = OKABE_ITO.skyBlue;

/** Reference marks (means, trends, context lines): black, usually with a lower opacity. */
export const REFERENCE = OKABE_ITO.black;

/** Industries of the U.S. unemployment data, by name. */
export const INDUSTRY_COLORS: Record<string, string> = {
    Government: OKABE_ITO.blue,
    Construction: OKABE_ITO.orange,
    Manufacturing: OKABE_ITO.vermillion,
    'Education and Health': OKABE_ITO.bluishGreen,
    Information: OKABE_ITO.reddishPurple,
    Finance: OKABE_ITO.skyBlue
};

/** The colors of a list of industries, in its order. */
export const industryColors = (industries: readonly string[]) =>
    industries.map(name => INDUSTRY_COLORS[name] ?? OKABE_ITO.black);

/** Influenza seasons (ISO week 40 to 39) and ISO years of the WHO FluNet examples. */
export const SEASON_COLORS: Record<string, string> = {
    '2009/10': OKABE_ITO.reddishPurple,
    '2010/11': OKABE_ITO.orange,
    '2011/12': OKABE_ITO.skyBlue,
    '2012/13': OKABE_ITO.bluishGreen,
    '2013/14': OKABE_ITO.blue,
    '2014/15': OKABE_ITO.vermillion
};
export const seasonColors = (seasons: readonly string[]) => seasons.map(s => SEASON_COLORS[s] ?? OKABE_ITO.black);

/** ISO years 2010 to 2014: the color of the season that starts in that year. */
export const YEAR_COLORS: Record<string, string> = {
    '2010': OKABE_ITO.orange,
    '2011': OKABE_ITO.skyBlue,
    '2012': OKABE_ITO.bluishGreen,
    '2013': OKABE_ITO.blue,
    '2014': OKABE_ITO.vermillion
};
export const yearColors = (years: readonly string[]) => years.map(y => YEAR_COLORS[y] ?? OKABE_ITO.black);

/** Kinds of weather of `seattle-weather.csv`. */
export const WEATHER_COLORS: Record<string, string> = {
    rain: OKABE_ITO.blue,
    drizzle: OKABE_ITO.skyBlue,
    snow: OKABE_ITO.reddishPurple,
    fog: OKABE_ITO.bluishGreen,
    sun: OKABE_ITO.orange
};
export const weatherColors = (kinds: readonly string[]) => kinds.map(k => WEATHER_COLORS[k] ?? OKABE_ITO.black);

/** Daily temperature extremes and precipitation (Seattle, solar-power weather). */
export const TEMPERATURE_MAX = OKABE_ITO.vermillion;
export const TEMPERATURE_MIN = OKABE_ITO.skyBlue;
export const PRECIPITATION = OKABE_ITO.blue;

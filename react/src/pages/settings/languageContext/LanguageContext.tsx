import enNav from './en/nav'
import enSettings from'./en/settings'
import enTimer from './en/timer'
import enTodo from './en/todo'
import enRecent from './en/recentSession'
import enPrev from './en/prev5'
import enStats from './en/stats'
import enWeather from './en/weather'

import svNav from './sv/nav'
import svSettings from './sv/settings';
import svTimer from './sv/timer'
import svTodo from './sv/todo'
import svRecent from './sv/recentSession'
import svPrev from './sv/prev5'
import svStats from './sv/stats'
import svWeather from './sv/weather'

export type Locale = 'sv' | 'en';
export const Languages = {
    en: {
        ...enNav,
        ...enSettings,
        ...enTimer,
        ...enTodo,
        ...enRecent,
        ...enPrev,
        ...enStats,
        ...enWeather,
    },
    sv: {
        ...svNav,
        ...svSettings,
        ...svTimer,
        ...svTodo,
        ...svRecent,
        ...svPrev,
        ...svStats,
        ...svWeather,
    }
}
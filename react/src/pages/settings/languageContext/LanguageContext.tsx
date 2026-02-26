import enNav from './en/nav'
import enSettings from'./en/settings'
import enTimer from './en/timer'

import svNav from './sv/nav'
import svSettings from './sv/settings';
import svTimer from './sv/timer'

export type Locale = 'sv' | 'en';
export const Languages = {
    en: {
        ...enNav,
        ...enSettings,
        ...enTimer,
    },
    sv: {
        ...svNav,
        ...svSettings,
        ...svTimer,
    }
}
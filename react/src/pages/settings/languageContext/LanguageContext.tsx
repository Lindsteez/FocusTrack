import enNav from './en/nav'
import svNav from './sv/nav'

export type Locale = 'sv' | 'en';
export const Languages = {
    en: {
        ...enNav,
    },
    sv: {
        ...svNav,
    }
}
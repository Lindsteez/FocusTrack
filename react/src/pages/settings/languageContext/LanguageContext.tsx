import engNav from './en/nav'
import sweNav from './sv/nav'

export type Locale = 'sv' | 'en';
export const Languanges = {
    en: {
        ...enNav,
    },
    sv: {
        ...svNav,
    }
}
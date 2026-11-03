// Produktdaten je Sprache: product.json enthält Deutsch, `en` überschreibt die sprachabhängigen Felder.
import base from '../data/product.json';
import type { Lang } from '../i18n';

const { en, ...de } = base;
export type Product = typeof de;
export const productFor = (lang: Lang): Product => (lang === 'de' ? de : { ...de, ...en } as Product);
export default de;

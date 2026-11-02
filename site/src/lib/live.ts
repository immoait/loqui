// Entwürfe erscheinen in der lokalen Entwicklung und in Vercel-Vorschauen, aber nie in der Produktion.
export const isLive = (entry: { data: { draft: boolean } }) =>
  process.env.VERCEL_ENV === 'production' ? !entry.data.draft : true;

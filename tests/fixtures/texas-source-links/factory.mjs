const TX = 'https://tcss.legis.texas.gov/resources/';
export const source = (code, chapter) => ({url:`${TX}${code}/htm/${code}.${chapter}.htm#${chapter}.002`});

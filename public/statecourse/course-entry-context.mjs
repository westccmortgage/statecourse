export const ENTRY_STATES = new Set('AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' '));
export function courseEntry(value) {
  if (!value || !['real-estate','mortgage'].includes(value.vertical) || !['practice','licensed','renew'].includes(value.goal) || !ENTRY_STATES.has(value.state)) return null;
  return {vertical:value.vertical,goal:value.goal,state:value.state};
}
export function entryPath(value) {
  const entry=courseEntry(value);
  return entry ? '/student/start/?'+new URLSearchParams(entry) : null;
}
export function entryFromReturnPath(value) {
  if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\u0000-\u001f]/.test(value))return null;
  try {
    const url=new URL(value,'https://statecourse.com');
    return url.origin==='https://statecourse.com'&&url.pathname==='/student/start/' ? courseEntry(Object.fromEntries(url.searchParams)) : null;
  } catch { return null; }
}

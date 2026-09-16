const urls = [
  'https://patanakiat.github.io/data-detective/index.html',
  'https://patanakiat.github.io/data-detective/data.js',
  'https://patanakiat.github.io/data-detective/model.js',
];
const expect = [['about 25%', 'first three tiles'], ['Math.exp(5.0'], ['pctLateAtDoor']];
const bodies = await Promise.all(urls.map(u => fetch(u).then(r => r.text())));
const bad = bodies.flatMap((b, i) => expect[i].filter(s => !b.includes(s)).map(s => `${urls[i]} missing ${s}`));
if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
console.log('deploy matches archive');

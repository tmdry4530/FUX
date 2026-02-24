const v3 = require("../apps/src/stages/stages.v3.json");
const v2 = require("../apps/src/stages/stages.v2.json");
const leg = require("../apps/src/stages/stages.mvp.json");
const all = [...v3, ...v2, ...leg];
const ids = all.map(s => s.id);

const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log("Dupes:", dupes.length ? dupes : "none");

const ws = all.filter(s => s.id !== s.id.trim());
console.log("Whitespace:", ws.length ? ws.map(s => s.id) : "none");

const unsafe = all.filter(s => s.id !== encodeURIComponent(s.id));
console.log("Need encoding:", unsafe.length ? unsafe.map(s => s.id) : "none");

console.log("Total: v3=" + v3.length + " v2=" + v2.length + " legacy=" + leg.length);

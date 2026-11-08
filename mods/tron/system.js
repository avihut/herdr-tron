// Local samples only. A route/interface is never presented as Internet proof.
export function parseNetwork(result){
 if(!result||result.code!==0)return {state:'unknown',interfaces:[]};
 const out=result.stdout||'',m=out.match(/Network interfaces:\s*([^\n]*)/i);
 if(m){const interfaces=m[1].trim().split(/\s+/).filter(s=>s&&s!=='none');return {state:interfaces.length?'available':'offline',interfaces};}
 if(/No network information|No network interfaces/i.test(out))return {state:'offline',interfaces:[]};
 return {state:'unknown',interfaces:[]};
}
export function parseBattery(result,known=null){
 if(!result||result.code!==0)return {present:known===false?false:known,state:'unknown',percent:null};
 const out=result.stdout||'',m=out.match(/(\d{1,3})%;\s*([^;\n]+)/);
 if(m&&Number(m[1])<=100)return {present:true,percent:Number(m[1]),state:/discharging/i.test(m[2])?'discharging':/not charging/i.test(m[2])?'ac':/charged|finishing charge/i.test(m[2])?'ac':/charging/i.test(m[2])?'charging':'unknown'};
 if(/Now drawing from 'AC Power'/.test(out)&&!/(InternalBattery|Battery-\d|%)/.test(out))return {present:false,percent:null,state:'absent'};
 return {present:known,state:'unknown',percent:null};
}
export const REPLACED={main:'my-herdr',terminals:'my-terminals',win98:'win98-dark'};
const TITLES={main:'Herdr',terminals:'Terminals',win98:'Windows 98',winxp:'Windows XP','herdr-t3':'Herdr T3','main-folders':'Space Folders','herdr-sim':'Herdr Sim',cockpit:'Cockpit',traveler:'Traveler',tron:'TRON'};
export function layoutChoices(all,current){return [...new Set(all)].filter(n=>!(REPLACED[n]&&all.includes(REPLACED[n]))).map(name=>{const b=Object.keys(REPLACED).find(k=>REPLACED[k]===name),base=name.replace(/^my-/,'');return {name,current:name===current,title:TITLES[b]??TITLES[name]??TITLES[base]??base.split(/[-_ ]+/).map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')};});}
export const statusText={working:'WORKING',blocked:'NEEDS INPUT',done:'FINISHED UNSEEN',idle:'IDLE'};

// Herdr's Files and Changes mods live in the layout's hidden "panel" column, in the
// "panel-body" stack. Pure helpers over layout() so the toggle rules are testable.
export function findNode(node,id){if(!node||typeof node!=='object')return null;if(node.id===id)return node;for(const c of node.children??[]){const r=findNode(c,id);if(r)return r;}return null;}
/** Panels the layout's hidden "panel" column can show, in its stack's order. */
export const PANELS=['files','changes','herdr-sim'];
/** Which panel shows: "files", "changes", "herdr-sim", or null (hidden, or a layout without one). */
export function panelShown(root){const p=findNode(root,'panel');if(!p||p.hidden)return null;return findNode(root,'panel-body')?.active??null;}
/** Commands that show `which`, or hide the panel when `which` is already showing. */
export function panelCommands(root,which){
 if(!findNode(root,'panel')||!PANELS.includes(which))return [];
 if(panelShown(root)===which)return [['layout.hide',{id:'panel'}]];
 return [['layout.select',{stack:'panel-body',child:which}],['layout.show',{id:'panel'}]];
}

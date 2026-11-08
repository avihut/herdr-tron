import {props as workspaceTreeProps} from 'herdr';
import {WorkspaceTree} from './workspace-tree.js';
import {tree as workspaceHierarchy} from './workspace-tree-model.js';
import { View, div, PathBuilder, Background } from 'gpui-kit';
import { h_flex, v_flex } from 'gpui-base';
import { agents, spaces, panes, machines, layouts, settings, props, shared, setShared, run, openOverlay, closeOverlay, setAgentOrder, exec, hostWindow } from './host.js';
import { newCycle, cycleMove, CYCLE_LEVELS, newDisc, rotateMirror, launchDisc, DISC_LEVELS, recordBest, key } from './games.js';
import { parseNetwork, parseBattery, layoutChoices, statusText } from './system.js';
import { projectDisc, faceColor } from './geometry.js';
import { gridFloor } from './circuitry.js';
import { gridPalette, consoleGeometry, discCradle, energyFlow } from './design.js';
import { renamedPane, paneRenameAvailable, openPaneRename } from './pane-rename.js';
import { DUEL, LEVELS as DUEL_LEVELS, newDuel, steer, startDuel, pauseDuel, duelTick, recordDuel } from './duel.js';

const NS='tron.v1.';
const read=(k,f)=>shared(NS+k)??f;
const save=(k,v)=>setShared(NS+k,v);
function palette(){return gridPalette(settings().dark!==false,read('classic',false));}
function txt(s,color,size=12){return div().text_size(size).text_color(color).child(String(s));}
// Fixed-width native strokes. Every point is a logical pixel, never a percentage.
function paths(lines,width,color){const path=PathBuilder.stroke(width);for(const points of lines){path.move_to(...points[0]);for(const point of points.slice(1))path.line_to(...point);}return window.paint_path(path.build(),color).absolute().inset_0();}
// Native motion lives in GPUI, with a constant illuminated trace when disabled.
function breathe(element,id){return element.id(id).when(!read('reducedMotion',false),e=>e.loop('opacity',{from:.28,to:.8,period:4800,easing:'ease-in-out'}));}
// One-direction energy. A lit copy of the path lies under an unlit copy that is split into
// two covers, anchored to the left and right edges so their art never moves. The gap between
// them slides left to right: the left cover's width comes from native frames of invisible
// digits (one shared clock, no JavaScript timer). Light exists only on path pixels, so the
// travelling glow follows every bend and never leaves the path.
const digitCache=[];const digits=n=>digitCache[n]??='0'.repeat(n);
const flowCache=new Map();
function flowFor(width,opts){const key=`${Math.floor(width)}|${JSON.stringify(opts)}`;let f=flowCache.get(key);
 if(f===undefined){if(flowCache.size>96)flowCache.clear();const e=energyFlow(width,opts);f=e&&{...e,list:e.counts.map(digits)};flowCache.set(key,f);}return f;}
function energyLayer(id,width,height,unlit,lit,opts={}){
 const f=read('reducedMotion',false)?null:flowFor(width,opts);
 if(!f)return div().absolute().inset_0().child(unlit());
 const w=Math.floor(width);
 return div().absolute().inset_0().overflow_hidden()
  .child(lit())
  .child(h_flex().absolute().top(0).left(-f.pad).w(w+2*f.pad).h(height)
   .child(div().relative().h_full().flex_none().overflow_hidden()
    .child(div().absolute().top(0).left(f.pad).w(w).h(height).child(unlit()))
    .child(div().id(id+'-sizer').flex_none().text_size(f.size).font_family('JetBrains Mono').text_color('#00000000').frames(f.list,f.ms)))
   .child(div().w(f.win).h_full().flex_none())
   .child(div().relative().flex_1().h_full().overflow_hidden()
    .child(div().absolute().top(0).right(f.pad).w(w).h(height).child(unlit()))));
}
// A solid plate: the lit copy and both covers must match pixel for pixel outside the seams.
// A gradient here is mapped to each clipped copy separately and leaves visible box edges.
function skinArt(g,c,color,lit){return div().absolute().inset_0().bg(c.bg)
 .when(g.plate.length,e=>e.child(window.paint_path(PathBuilder.fill().add_polygon(g.plate,true).build(),c.glass).absolute().inset_0()))
 .child(paths(g.outline,1,c.edge)).child(paths(g.contacts,1,color+'80'))
 .child(paths(g.seams,1.5,color+'be')).child(paths(g.cores,2,c.core))
 .when(lit,e=>e.child(paths(g.seams,7,color+'55')).child(paths(g.seams,2.5,c.core)));}
function consoleSkin(width,height,color,id,phase=0){const c=palette(),g=consoleGeometry(width,height);
 return div().absolute().inset_0().overflow_hidden()
  .child(energyLayer(id+'-flow',width,height,()=>skinArt(g,c,color,false),()=>skinArt(g,c,color,true),{phase}))
  .child(breathe(paths(g.seams,5,color+'38'),id+'-breath'));
}
function busArt(width,c,lit){const line=[[[0,7],[Math.max(0,width),7]]];return div().absolute().inset_0().bg(c.bg)
 .child(paths(line,1,c.accent+'90'))
 .when(lit,e=>e.child(paths(line,6,c.accent+'55')).child(paths(line,2,c.core)));}
function tabBus(width){const c=palette();return div().relative().w_full().h(14).flex_none().overflow_hidden()
 .child(energyLayer('route-bus-flow',width,14,()=>busArt(width,c,false),()=>busArt(width,c,true),{speed:340,maxSteps:640,window:64}))
 .child(breathe(paths([[[0,7],[Math.max(0,width),7]]],5,c.accent+'30'),'route-bus-breath'));}
function corner(){const c=palette();return div().relative().w(28).h(12).flex_none().child(paths([[[0,11],[10,11],[20,1],[28,1]]],1,c.accent));}
function btn(id,label,fn,active=false){const c=palette();return h_flex().id(id).items_center().gap(7).px(10).py(6).rounded(0).border_l(active?2:0).border_b(1).border_color(active?c.accent:c.line).cursor_pointer().accessibility_label(label).bg(active?c.raised:c.panel+'00').text_color(active?c.accent:c.text).text_size(12).hover(s=>s.bg(c.raised).border_color(c.accent)).on_mouse_down('left',(_e,cx)=>cx.stop_propagation()).on_click((e,cx)=>{cx.stop_propagation();fn(e,cx);}).child(div().min_w(0).truncate().child(label));}
const line=()=>div().h(1).w_full().bg(palette().line);
function label(s){const c=palette();return h_flex().gap(7).items_center().child(div().w(3).h(12).bg(c.accent)).child(txt(s,c.accent,10).font_semibold());}
function ring(status,size=30){const c=palette(),color=status==='blocked'?c.orange:status==='done'?c.green:status==='working'?c.accent:c.muted;return div().size(size).flex_none().rounded(size).border(1).border_color(color).p(size/3).child(div().size_full().rounded(size).bg(color)).when(status==='working'&&!read('reducedMotion',false),e=>e.loop('opacity',{from:.6,to:1,period:1800}));}
function open(role,extra={}){return openOverlay({mod:'tron',kind:role==='picker'||role==='menu'?'popup':'dialog',width:role==='picker'||role==='menu'?280:Math.min(940,window.viewport_size().width*.9),...(role==='picker'||role==='menu'?{}:{height:Math.min(760,window.viewport_size().height*.88)}),frame:'none',props:{role,...extra}});}
function close(){if(props().overlay)closeOverlay(props().overlay);}
const command=(name,args)=>()=>{close();run(name,args);};
function context(type,id,terminal){open('menu',{target:{type,id,pane:type==='pane'?id:undefined,terminal}});}
function shell(title,body,subtitle='',width=0){const c=palette();return v_flex().size_full().min_h(0).bg(c.bg).text_color(c.text).text_size(12).border(1).border_color(c.accent).rounded(0).overflow_hidden()
 .child(div().relative().h(84).w_full().flex_none().child(consoleSkin(width,84,c.accent,'room-console'))
  .child(h_flex().relative().px(20).py(12).gap(12).items_center().child(v_flex().flex_1().min_w(0).child(txt(title,c.text,20)).child(txt(subtitle,c.muted,11))).child(btn('close','Close · Esc',close))))
 .child(body);}

function section(title,content){const c=palette();return v_flex().p(16).gap(12).bg(c.panel).rounded(2).border_l(2).border_b(1).border_color(c.accent+'70').child(label(title)).children(content);}

class Tron extends View{
 init(p,cx){
  this.p={...props(),...p};this.role=this.p.role??(this.p.target?'menu':'room');this.room=this.p.room??'command';this.width=0;this.height=0;
  this.cycle=newCycle();this.disc=newDisc();this.duel=newDuel(read('duelLevel',0),Date.now()%2147483647);this.duelTask=null;this.duelRecorded=false;this.yaw=.3;this.pitch=.85;this.bit=0;this.scan=false;this.terminal='Select a read-only archive command.';
  this.handle=cx.focus_handle();this.net={state:'unknown',interfaces:[]};this.batt={present:null,state:'unknown',percent:null};this.sample=null;this.busy=false;
  if(this.role==='side'&&!this.p.fixture){this.sectorData=new WorkspaceTree();this.sectorData.init({inline:true,owner:'tron'},cx);}
  if(this.role==='footer'&&!this.p.fixture){this.refresh(cx);cx.timer.every(30000,c=>this.refresh(c));}
  // Optional pane-rename mod: checked once as a menu opens, never per render.
  if(this.role==='menu'&&!this.p.fixture)cx.spawn(async c=>{this.renameAvailable=await paneRenameAvailable();c.notify();});
  if(this.p.fixtureState)Object.assign(this,this.p.fixtureState);
 }
 refresh(cx){if(this.busy||hostWindow().platform!=='macos')return;this.busy=true;cx.spawn(async c=>{try{const safe=async(cmd,args)=>{try{return await exec(cmd,args);}catch{return null;}};const [n,b]=await Promise.all([safe('/usr/sbin/scutil',['--nwi']),safe('/usr/bin/pmset',['-g','batt'])]);this.net=parseNetwork(n);this.batt=parseBattery(b,this.batt.present);this.sample=new Date().toLocaleTimeString();}finally{this.busy=false;c.notify();}});}
 render(cx){const roles={top:()=>this.top(),side:()=>this.side(),tabs:()=>this.tabs(),pane:()=>this.pane(),footer:()=>this.footer(),picker:()=>this.picker(),menu:()=>this.menu(),room:()=>this.rooms(),cycle:()=>this.cycleGame(),disc:()=>this.discGame(),duel:()=>this.duelGame()};return (roles[this.role]??roles.room)().id(`tron-root-${this.role}`).on_size_change((size,cx)=>{const width=Math.floor(size.width),height=Math.floor(size.height);if(this.width!==width||this.height!==height){this.width=width;this.height=height;cx.notify();}});}
 top(){const c=palette();return h_flex().size_full().px(14).gap(8).items_center().bg(c.bg).border_b(1).border_color(c.line).child(div().w(hostWindow().platform==='macos'?72:0).flex_none()).child(btn('picker','TRON ▾',()=>open('picker'),true)).when(this.width>820,e=>e.child(txt('G R I D   C O M M A N D',c.muted,10).font_semibold())).child(div().flex_1()).when(this.width>900,e=>e.child(btn('command','Command',()=>open('room',{room:'command'})))).child(btn('destinations',this.width>560?'Destinations ↗':'Rooms',()=>open('room',{room:'lounge'}))).child(btn('toggle-side','≡',()=>run('layout.toggle',{id:'sidebar'}))).child(btn('settings',this.width<420?'⚙':'Settings',()=>run('app.settings')).accessibility_label('Settings')).when(hostWindow().buttons,e=>e.children([btn('min','—',()=>run('window.minimize')),btn('max',hostWindow().maximized?'❐':'□',()=>run('window.maximize')),btn('quit','×',()=>run('window.close'))]));}
 side(){const c=palette(),as=agents(),active=as.find(a=>a.focused);setAgentOrder(as.map(a=>a.address));
  const discSize=Math.max(120,Math.min(this.height&&this.height<700?120:184,this.width-32)),cradle=discCradle(discSize),color=active?.status==='blocked'?c.orange:active?.status==='done'?c.green:c.accent;
  return v_flex().size_full().min_h(0).bg(c.panel).border_r(1).border_color(c.edge).gap(12).p(14)
   .child(v_flex().flex_none().items_center().gap(4)
    .child(label('IDENTITY / '+(active?.address??'UNBOUND')))
    .when(!this.height||this.height>440,e=>e.child(div().id('identity-dock').relative().size(discSize).flex_none().cursor_pointer().accessibility_label('Open identity-disc archive').on_click(()=>open('room',{room:'armory'}))
     .child(paths(cradle.rings,1,c.accent+'70')).child(paths(cradle.ticks,1,c.line)).child(paths(cradle.supports,1,c.accent+'80'))
     .child(breathe(paths(cradle.light,5,color+'40'),'identity-breath')).child(paths(cradle.light,2,c.core))
     .children(projectDisc(.14,.35,discSize).map(f=>window.paint_path(PathBuilder.fill().add_polygon(f.points,true).build(),faceColor(f,color)).absolute().inset_0()))
     .child(div().absolute().inset_0().flex().items_center().justify_center().child(txt(active?.address??'—',c.core,18).font_family('Geist Mono')))
     .tooltip('Identity disc · open archive and select a Program')))
    .child(txt(active?.title??'Select a Program',c.text,12).w_full().truncate())
    .child(txt(active?statusText[active.status]:'NO FOCUSED AGENT',color,9)))
   .child(line()).child(h_flex().items_center().justify_between().child(label('SECTORS')).child(btn('sector-new','+',()=>run('space.new'))))
   .child(v_flex().id('sectors-scroll').max_h(Math.min(300,Math.max(90,(this.height||900)*.25))).overflow_y_scrollbar().gap(2).children(this.sectorRows()).when(!spaces().length,e=>e.child(txt('No sectors. Use + to create a space.',c.muted))))
   .child(line()).child(h_flex().justify_between().child(label('PROGRAMS')).child(txt(String(as.length).padStart(2,'0'),c.muted,11)))
   .child(v_flex().id('programs-scroll').flex_1().min_h(48).overflow_y_scrollbar().gap(4).children(as.map(a=>h_flex().id(`program-${a.address}`).gap(9).px(8).py(10).border_l(2).border_color(a.focused?c.accent:c.line).bg(a.focused?c.raised:c.panel).cursor_pointer().hover(s=>s.bg(c.raised))
    .on_click(()=>run('agent.focus',{terminal:a.address})).on_mouse_down('right',(_e,cx)=>{cx.stop_propagation();context('agent',a.address,a.address);})
    .child(v_flex().w(28).flex_none().gap(6).child(txt(a.address,a.status==='blocked'?c.orange:c.accent,10).font_family('Geist Mono')).child(div().h(2).w(18).bg(a.status==='blocked'?c.orange:a.status==='done'?c.green:a.status==='working'?c.accent:c.line)))
    .child(v_flex().flex_1().min_w(0).gap(4).child(txt(a.title||a.program.name,c.text,12).truncate()).child(txt(statusText[a.status]??'UNKNOWN',a.status==='blocked'?c.orange:c.muted,9)))
    .tooltip(`${a.title} · ${a.address}\n${a.space_name} / ${a.tab_name}\n${statusText[a.status]}`))).when(!as.length,e=>e.child(txt('No reporting Programs.',c.muted))))
   .child(btn('archive','Disc archive ↗',()=>open('room',{room:'armory'})))
   .child(txt('THE GRID / Program directory',c.muted,9).tooltip('Circuit light is atmosphere, not message or network telemetry.'));
 }

 sectorRows(){
  const c=palette(),roots=workspaceHierarchy(spaces(),shared('space-folders')??{},panes(),shared('space-hierarchy')??{}),folded=read('sectorsFolded',{}),rows=[];
  const visit=(node,depth)=>{
   if(node.kind==='tab')return;
   const children=node.children.filter(n=>n.kind!=='tab'),branch=children.length>0,collapsed=!!folded[node.key],space=node.kind==='space';
   rows.push(h_flex().id('sector-row-'+node.key).min_h(30).flex_none().gap(3).pl(Math.min(depth,8)*12).pr(4)
    .border_l(2).border_color(node.active?c.accent:c.panel).bg(node.active?c.raised:c.panel).items_center()
    .child(div().id('sector-expand-'+node.key).w(16).h(26).flex_none().flex().items_center().justify_center().text_size(10).text_color(c.accent)
     .child(branch?(collapsed?'▸':'▾'):'·').when(branch,e=>e.cursor_pointer().accessibility_label((collapsed?'Expand ':'Collapse ')+node.name).on_click((_e,cx)=>{cx.stop_propagation();save('sectorsFolded',{...read('sectorsFolded',{}),[node.key]:!collapsed});})))
    .child(txt(node.name,space?c.text:c.muted,space?12:10).id('sector-select-'+node.key).flex_1().min_w(0).truncate().when(space,e=>e.cursor_pointer().on_click(()=>run('space.select',{id:node.id}))).tooltip(node.name))
    .when(space&&!!node.status,e=>e.child(div().size(3).flex_none().bg(node.status==='blocked'?c.orange:node.status==='done'?c.green:node.status==='working'?c.accent:c.muted)))
    .when(space,e=>e.on_mouse_down('right',(_e,cx)=>{cx.stop_propagation();context('space',node.id);})));
   if(!collapsed)for(const child of children)visit(child,depth+1);
  };
  for(const root of roots){if(roots.length===1&&root.name==='This computer')for(const child of root.children)visit(child,0);else visit(root,0);}
  return rows;
 }

 tabs(){const c=palette(),s=spaces().find(s=>s.active);return v_flex().size_full().gap(0)
  .child(h_flex().h(38).w_full().gap(5).items_center().child(h_flex().id('routes').flex_1().min_w(0).overflow_x_scroll().gap(5).children((s?.tabs??[]).map(t=>btn(`route-${t.id}`,`${t.index.toString().padStart(2,'0')} / ${t.name}`,()=>run('tab.select',{id:t.id}),t.active).max_w(240).on_mouse_down('right',(_e,cx)=>{cx.stop_propagation();context('tab',t.id);}).tooltip(t.name)))).child(btn('new-route','+ Route',()=>openOverlay({mod:'new-menu',kind:'popup',width:260,props:{space:s?.id}}))))
  .child(tabBus(this.width));}

 pane(){
  const c=palette(),p=panes().find(p=>p.pane===this.p.pane);if(!p)return div();
  const peers=panes().filter(x=>x.tab===p.tab),phase=peers.length>1?peers.findIndex(x=>x.pane===p.pane)/peers.length:0;
  const title=renamedPane(p)||p.title;
  const color=p.status==='blocked'?c.orange:p.status==='done'?c.green:c.accent;
  return v_flex().relative().size_full().bg(c.bg)
   .on_mouse_down('right',(_e,cx)=>{cx.stop_propagation();context('pane',p.pane,p.terminal);})
   .child(consoleSkin(this.width,68,color,'console-'+p.pane,phase))
   .child(h_flex().relative().h(40).w_full().flex_none().px(14).gap(10).items_center()
    .child(txt(p.terminal??'MOD',p.focused?c.core:color,13).font_family('Geist Mono').font_semibold().flex_none())
    .when(this.width>=360,e=>e.child(txt(title,c.text,11).truncate().flex_1()))
    .when(this.width<360,e=>e.child(div().flex_1()))
    .when(this.width>620,e=>e.child(txt(statusText[p.status]??'CONSOLE',color,9).flex_none()))
    .when(this.width>300,e=>e.child(btn('split-r','⊞',()=>run('pane.split',{pane:p.pane,direction:'right'}))))
    .child(btn('pane-zoom',p.zoomed?'↙':'↗',()=>run('pane.zoom',{pane:p.pane})))
    .child(btn('pane-menu','···',()=>context('pane',p.pane,p.terminal))))
   .child(h_flex().relative().px(15).h(16).gap(8).child(txt(p.focused?'FOCUSED':statusText[p.status]??'CONSOLE',color,8)))
   .tooltip(`${title} · ${statusText[p.status]??'Console'}`);
 }

 footer(){const c=palette(),a=agents(),network=`LINK ${this.net.state==='available'?'UP':this.net.state==='offline'?'DOWN':'?'}`,battery=this.batt.percent===null?'?':`${this.batt.percent}%`;return h_flex().size_full().border_t(1).border_color(c.line).px(12).gap(this.width<400?6:14).items_center().bg(c.bg).text_size(10).when(this.width>460,e=>e.child(txt(`${a.filter(x=>x.status==='working').length} working · ${a.filter(x=>x.status==='blocked').length} need input`,c.muted,10))).child(div().flex_1()).child(txt(network,this.net.state==='available'?c.accent:c.muted,10).tooltip(`Local interface availability, not Internet proof.\n${this.net.interfaces.join(', ')||'No interfaces reported'}\nSample: ${this.sample??'pending / unsupported platform'}`)).when(this.batt.present!==false,e=>e.child(h_flex().gap(4).items_center().child(div().w(21).h(11).p(2).border(1).border_color(c.muted).rounded(2).child(div().h_full().w(this.batt.percent===null?0:15*this.batt.percent/100).bg(c.accent))).child(txt(`${battery} ${this.batt.state==='charging'?'↑':this.batt.state==='ac'?'AC':''}`,c.muted,10)).tooltip(`Battery: ${this.batt.state} · sample ${this.sample??'pending'}`))).child(btn('motion',this.width<350?(read('reducedMotion',false)?'Still':'Flow'):(read('reducedMotion',false)?'Energy still':'Energy flowing'),()=>save('reducedMotion',!read('reducedMotion',false))).tooltip('Toggle ambient circuit motion. This does not represent real message delivery.'));}
 picker(){const c=palette();return v_flex().bg(c.panel).border(1).border_color(c.accent).rounded(2).p(7).gap(3).child(corner()).child(label('INTERFACE TRANSFER')).children(layoutChoices(layouts(),shared('layout')).map(l=>btn(`layout-${l.name}`,`${l.current?'●':'○'}  ${l.title}`,command('layout.switch',{name:l.name}),l.current)));}
 menu(){const c=palette(),target=this.p.target??{},type=target.type??'pane',id=target.id??target.pane;let actions=[];
 if(type==='space')actions=[['Select sector','space.select',{id}],['Rename sector','space.rename',{id}],['New route','tab.new',{space:id}],['Close sector…','space.close',{id}]];
 if(type==='tab')actions=[['Select route','tab.select',{id}],['Rename route','tab.rename',{id}],['Close route…','tab.close',{id}]];
 if(type==='agent')actions=[['Focus Program','agent.focus',{terminal:target.terminal}],['Peek Program','terminal.peek',{terminal:target.terminal}]];
 if(type==='pane'&&id)actions=[['Focus pane','pane.focus',{pane:id}],['Split right','pane.split',{pane:id,direction:'right'}],['Split down','pane.split',{pane:id,direction:'down'}],['Zoom pane','pane.zoom',{pane:id}],['Close pane…','pane.close',{pane:id}],...(this.renameAvailable?[['Rename pane…',()=>{close();openPaneRename(id);}]]:[])];
 return v_flex().bg(c.panel).border(1).border_color(c.accent).rounded(2).p(7).gap(4).child(corner()).child(label(`TARGET / ${id??'Unavailable'}`)).children(actions.map(([name,cmd,args],i)=>btn(`context-${i}`,name,typeof cmd==='function'?cmd:command(cmd,args))));}
 rooms(){const c=palette(),nav=[['command','Grid command'],['lounge','End of Line'],['armory','Disc archive'],['portal','Portal map']];return shell('Destinations',v_flex().flex_1().min_h(0).child(h_flex().flex_none().p(10).gap(6).flex_wrap().children(nav.map(([id,name])=>btn(`room-${id}`,name,(_e,cx)=>{this.room=id;cx.notify();},this.room===id)))).child(v_flex().id('room-scroll').flex_1().min_h(0).overflow_y_scrollbar().p(20).gap(16).children(this.room==='command'?this.commandRoom():this.room==='armory'?this.armory():this.room==='portal'?this.portals():this.lounge())), 'A quiet place between operations.',this.width);}
 commandRoom(){const c=palette(),a=agents();return [txt('Good to see you, Program.',c.text,27),txt('Your operations keep running while you explore.',c.muted),h_flex().gap(12).flex_wrap().children([['SECTORS',spaces().length],['PROGRAMS',a.length],['NEED INPUT',a.filter(x=>x.status==='blocked').length],['FINISHED UNSEEN',a.filter(x=>x.status==='done').length]].map(([t,n])=>section(t,[txt(n,c.accent,28)]))),section('ATTENTION QUEUE',a.filter(x=>x.status==='blocked'||x.status==='done').map(x=>btn(`attention-${x.address}`,`${x.address} · ${x.title} · ${statusText[x.status]}`,command('agent.focus',{terminal:x.address}))).concat(a.some(x=>x.status==='blocked'||x.status==='done')?[]:[txt('No Programs currently need attention.',c.muted)])),section('LOCAL PREFERENCES',[h_flex().gap(8).flex_wrap().child(btn('motion-pref',read('reducedMotion',false)?'Reduced motion: on':'Reduced motion: off',()=>save('reducedMotion',!read('reducedMotion',false)))).child(btn('palette-pref',read('classic',false)?'Palette: classic grid':'Palette: Legacy',()=>save('classic',!read('classic',false)))).child(btn('reset-progress','Reset discoveries & bests',()=>open('room',{room:'reset'}))),txt('No audio is played by this layout. Cosmetic choices never change agents.',c.muted)])];}
 armory(){const c=palette(),as=agents(),selected=as.find(a=>a.address===read('discAgent',''))??as.find(a=>a.focused)??as[0],accent=read('discColor','cyan')==='orange'?c.orange:read('discColor','cyan')==='white'?c.text:c.accent;return [txt('Identity-disc archive',c.text,25),txt('Rotate a solid 3D disc. Choose a real Program, then focus its terminal.',c.muted),h_flex().gap(24).flex_wrap().child(v_flex().gap(10).child(this.discModel(accent)).child(h_flex().gap(6).children([['yaw-left','↶',-.25,0],['yaw-right','↷',.25,0],['pitch-up','Tilt +',0,.2],['pitch-down','Tilt −',0,-.2]].map(([id,t,y,p])=>btn(id,t,(_e,cx)=>{this.yaw+=y;this.pitch+=p;cx.notify();})))).child(btn('reset-disc','Reset view',(_e,cx)=>{this.yaw=.3;this.pitch=.85;cx.notify();}))).child(v_flex().min_w(220).flex_1().gap(12).child(section('BOUND PROGRAM',[txt(selected?`${selected.title} · ${selected.address}`:'No reporting Programs',c.text,16),txt(selected?statusText[selected.status]:'The disc is unbound.',c.muted),...(selected?[btn('focus-disc','Focus this Program',command('agent.focus',{terminal:selected.address}))]:[]),...as.map(a=>btn(`bind-${a.address}`,`${a.address} / ${a.title}`,()=>save('discAgent',a.address),selected?.address===a.address))])).child(section('COSMETIC CIRCUIT',[h_flex().gap(6).children(['cyan','orange','white'].map(n=>btn(`color-${n}`,n,()=>save('discColor',n),read('discColor','cyan')===n))),txt('Color is cosmetic. Status stays in words.',c.muted)]))),txt('192 depth-sorted lit faces · perspective projection · manual transforms',c.muted,10)];}
 discModel(color){const c=palette();return div().relative().size(260).bg(c.bg).rounded(2).border(1).border_color(c.accent+'70').child(paths(gridFloor(260),1,c.accent+'40')).children(projectDisc(this.yaw,this.pitch,260).map(f=>window.paint_path(PathBuilder.fill().add_polygon(f.points,true).build(),faceColor(f,color)).absolute().inset_0())).child(txt('DISC / 01',c.muted,10).absolute().left(12).bottom(10));}
 portals(){const c=palette();return [txt('Portal map',c.text,25),txt('System readiness is reported by Herdr. It is separate from the local LINK indicator.',c.muted),...machines().map((m,i)=>section(`${String(i+1).padStart(2,'0')} / ${m.name??'LOCAL SYSTEM'}`,[h_flex().gap(12).items_center().child(ring(m.layout==='ready'?'done':m.layout==='unavailable'?'blocked':'idle',42)).child(txt(m.layout.toUpperCase(),m.layout==='ready'?c.green:c.orange,18)),...spaces().filter(s=>s.machine===m.name).map(s=>btn(`portal-${s.id}`,`${s.name} · ${s.tabs.length} routes`,command('space.select',{id:s.id}))),...(m.layout==='ready'?[btn(`new-system-${i}`,'Create sector here',command('space.new',{machine:m.name??''}))]:[txt('This system cannot accept structural changes now.',c.muted)])])),...(!machines().length?[txt('No system information available.',c.muted)]:[])];}
 lounge(){const c=palette(),best=read('bests',{}),wonCycle=Object.keys(best).some(k=>k.startsWith('cycle:')),wonDisc=Object.keys(best).some(k=>k.startsWith('disc:'));
 if(this.room==='reset')return [txt('Reset local progress?',c.text,24),txt('Clears TRON bests, discoveries and classic palette only.',c.muted),btn('confirm-reset','Reset local progress',(_e,cx)=>{save('bests',{});save('discoveries',{});save('classic',false);save('duel',{});this.room='command';cx.notify();}),btn('cancel-reset','Keep progress',(_e,cx)=>{this.room='command';cx.notify();})];
 if(this.room==='archive')return [txt('ENCOM / 1982',c.accent,27),txt('Archive terminal · a local fiction, not a shell.',c.muted),section('FLYNN ARCHIVE',[txt(this.terminal,c.text,16),h_flex().gap(8).children(['help','whoami','1982',...(read('classic',false)?['flynn']:[]),'exit'].map(cmd=>btn(`archive-${cmd}`,cmd,(_e,cx)=>{this.terminal=cmd==='flynn'?'Flynn\'s back room: a light-cycle cabinet hums awake in End of Line.':cmd==='help'?(read('classic',false)?'Flynn never shut his cabinet down. Ask for him by name.':'Try the year the Grid first appeared.'):cmd==='whoami'?'USER / visitor. No credentials read.':cmd==='1982'?'Classic grid discovered. Violet circuitry enabled.':'End of line.';if(cmd==='1982'){save('classic',true);this.discover('classic');}if(cmd==='flynn')this.discover('duel');if(cmd==='exit')this.room='lounge';cx.notify();})))] )];
 return [txt('End of Line',c.text,30),txt(read('discoveries',{}).duel?'Puzzles have no clock. The duel\'s clock runs only during a live round.':'A quiet lounge. Two original games, no clock running. Flynn\'s old cabinet must be somewhere.',c.muted),h_flex().gap(14).flex_wrap().child(section('01 / LIGHT-CYCLE ROUTE',[txt('Leave a trail. Find a way through.',c.text,17),txt('Turn-based route puzzle · three circuits',c.muted),btn('play-cycle','Enter circuit →',()=>{close();open('cycle');})])).child(section('02 / DISC RICOCHET',[txt('One launch. A chain of reflections.',c.text,17),txt('Mirror puzzle · three arenas',c.muted),btn('play-disc','Enter arena →',()=>{close();open('disc');})])).when(!!read('discoveries',{}).duel,e=>e.child(section('03 / GRID DUEL',[txt('Outlast an orange Program.',c.text,17),txt(`Real-time light cycles · ${(r=>`${r.wins??0}W ${r.losses??0}L ${r.draws??0}D · best streak ${r.best??0}`)(read('duel',{}))}`,c.muted),btn('play-duel','Enter the Grid →',()=>{close();open('duel');})]))),section('BIT / ASK A BINARY QUESTION',[txt(this.bit===1?'YES':this.bit===2?'NO':'◇',this.bit===1?c.green:this.bit===2?c.orange:c.accent,28),h_flex().gap(8).flex_wrap().child(btn('bit-yes','Are games local?',(_e,cx)=>{this.bit=1;this.discover('bit');cx.notify();})).child(btn('bit-no','Does LINK prove Internet?',(_e,cx)=>{this.bit=2;this.discover('bit');cx.notify();})),txt('A playful nod to Bit. The answers above describe this layout.',c.muted)]),section('ARCHIVE / DISCOVERIES',[h_flex().gap(8).flex_wrap().child(btn('archive-year','1982',(_e,cx)=>{this.room='archive';this.discover('archive');cx.notify();})).child(btn('end-line','End of line.',(_e,cx)=>{this.scan=!this.scan;this.discover('end');cx.notify();})).child(btn('scan','Recognizer scan',(_e,cx)=>{this.scan=true;this.discover('scan');cx.notify();})),...(this.scan?[txt(`Scan complete: ${agents().length} reporting Programs, ${spaces().length} sectors. No processes changed.`,c.accent)]:[]),txt(`${wonCycle?'◆':'◇'} Circuit badge    ${wonDisc?'◆':'◇'} Reflection badge`,c.accent),...(wonCycle&&wonDisc?[btn('iso','◇ An unexpected pattern',(_e,cx)=>{this.discover('iso');this.scan=true;cx.notify();}),txt(read('discoveries',{}).iso?'ISO-inspired discovery: complexity from simple rules. Your two badges opened this archive.':'Two disciplines, one unexpected possibility.',c.muted)]:[txt('Two earned badges may reveal an unexpected pattern.',c.muted)]),txt(`${Object.keys(read('discoveries',{})).length} discoveries recorded locally.`,c.muted)])];}
 discover(name){save('discoveries',{...read('discoveries',{}),[name]:true});}
 finish(game,state){if(state.phase==='won'){save('bests',recordBest(read('bests',{}),game,state));if(game==='cycle'&&state.level===2)this.discover('duel');}}
 gameBody(title,rules,body){const c=palette();return shell(title,v_flex().id('game-scroll').flex_1().min_h(0).overflow_y_scrollbar().p(20).gap(12).child(txt(rules,c.muted)).children(body),'Original local simulation · no agent or terminal actions',this.width);}
 cycleGame(){const c=palette(),s=this.cycle,l=CYCLE_LEVELS[s.level],move=d=>{this.cycle=cycleMove(this.cycle,d);this.finish('cycle',this.cycle);};return this.gameBody('Light-cycle route','Move one cell with arrows or buttons. Visit 1 → 2 → 3 → E. Walls and your own trail are fatal; turns are limited.',[
 h_flex().gap(8).flex_wrap().children(CYCLE_LEVELS.map((v,i)=>btn(`cycle-level-${i}`,v.name,(_e,cx)=>{this.cycle=newCycle(i);cx.notify();},s.level===i))),
 div().id('cycle-keyboard').track_focus(this.handle).on_click(()=>this.handle.focus()).on_key_down((e,cx)=>{if(['up','right','down','left'].includes(e.key)&&!e.is_held){move(e.key);cx.stop_propagation();cx.notify();}}).child(v_flex().gap(3).children(Array.from({length:l.h},(_,y)=>h_flex().gap(3).children(Array.from({length:l.w},(_,x)=>{const p=[x,y],k=key(p),at=key(s.pos)===k,g=l.gates.findIndex(g=>key(g)===k),wall=l.walls.some(w=>key(w)===k),exit=key(l.exit)===k;return div().size(34).flex_none().rounded(3).bg(at?c.accent:wall?c.line:s.trail.includes(k)?c.accent+'35':c.panel).border(1).border_color(g>=0||s.trail.includes(k)?c.accent:c.line).flex().items_center().justify_center().text_color(at?c.bg:g>=0&&g<s.gate?c.green:c.text).text_size(13).child(at?'◆':wall?'▪':g>=0?String(g+1):exit?'E':s.trail.includes(k)?'·':'');}))))),
 h_flex().gap(6).flex_wrap().children(['up','left','down','right'].map(d=>btn(`move-${d}`,d,(_e,cx)=>{move(d);this.handle.focus();cx.notify();}))).child(btn('cycle-restart','Restart',(_e,cx)=>{this.cycle=newCycle(s.level);cx.notify();})),
 txt(`${s.phase.toUpperCase()} / ${s.message}`,s.phase==='lost'?c.orange:s.phase==='won'?c.green:c.text,14),txt(`${s.moves}/${l.budget} turns · Best win: ${read('bests',{})[`cycle:${s.level}`]??'—'} turns`,c.muted),btn('cycle-lounge','Return to lounge',()=>{close();open('room',{room:'lounge'});})]);}
 // Real-time duel clock: one native timer callback per tick, scheduled only while a round is
 // live; it pauses itself whenever the arena loses focus, the window is inactive or another
 // layout shows, and it stops when the round ends or the dialog closes. No idle timer.
 duelEligible(){return this.role==='duel'&&shared('layout')==='tron'&&hostWindow().active!==false&&this.handle.is_focused();}
 stopDuel(why){this.duelTask?.cancel?.();this.duelTask=null;if(why)this.duel=pauseDuel(this.duel,why);}
 duelSchedule(cx){if(this.duelTask||this.duel.phase!=='playing')return;const L=DUEL_LEVELS[this.duel.level];
  this.duelTask=cx.timer.after(L.tickMs,c=>{this.duelTask=null;
   if(!this.duelEligible()){this.stopDuel('Paused: the arena lost focus. Press Space or Resume.');c.notify();return;}
   this.duel=duelTick(this.duel);
   if(['won','lost','draw'].includes(this.duel.phase)&&!this.duelRecorded){save('duel',recordDuel(read('duel',{}),this.duel));this.duelRecorded=true;}
   c.notify();this.duelSchedule(c);});}
 duelGo(cx){if(['won','lost','draw'].includes(this.duel.phase)){this.duel=newDuel(this.duel.level,Date.now()%2147483647);this.duelRecorded=false;}
  this.handle.focus();this.duel=startDuel(this.duel);this.duelSchedule(cx);cx.notify();}
 duelLevel(i,cx){this.stopDuel();save('duelLevel',i);this.duel=newDuel(i,Date.now()%2147483647);this.duelRecorded=false;this.handle.focus();cx.notify();}
 async close(){this.stopDuel();}
 duelKey(e,cx){const k=(e.key??'').toLowerCase(),dir={up:'up',w:'up',down:'down',s:'down',left:'left',a:'left',right:'right',d:'right'}[k];
  if(dir){this.duel=steer(this.duel,dir);cx.stop_propagation();return;}
  if(e.is_held)return;
  if(k==='space'||k===' '){if(this.duel.phase==='playing'){this.stopDuel('Paused. Press Space or Resume.');}else this.duelGo(cx);cx.stop_propagation();cx.notify();}
  else if(k==='p'&&this.duel.phase==='playing'){this.stopDuel('Paused. Press Space or Resume.');cx.stop_propagation();cx.notify();}}
 duelArena(){const c=palette(),s=this.duel,cs=Math.max(8,Math.min(18,Math.floor(((this.width||800)-48)/DUEL.w))),W=DUEL.w*cs,H=DUEL.h*cs,mid=([x,y])=>[x*cs+cs/2,y*cs+cs/2];
  const grid=[];for(let x=0;x<=DUEL.w;x+=4)grid.push([[x*cs,0],[x*cs,H]]);for(let y=0;y<=DUEL.h;y+=4)grid.push([[0,y*cs],[W,y*cs]]);
  const trail=(t,color)=>t.length>1?[paths([t.map(mid)],Math.max(3,cs*.55),color+'40'),paths([t.map(mid)],Math.max(1.5,cs*.18),color)]:[];
  const head=(p,color)=>div().absolute().left(p.x*cs+cs*.2).top(p.y*cs+cs*.2).size(cs*.6).bg(color).border(1).border_color(c.core);
  return div().id('duel-arena').relative().w(W).h(H).flex_none().bg(c.bg).border(1).border_color(c.accent+'90').overflow_hidden().track_focus(this.handle)
   .on_click((_e,cx)=>{this.handle.focus();cx.notify();}).on_key_down((e,cx)=>this.duelKey(e,cx))
   .child(paths(grid,1,c.accent+'1c')).children(trail(s.trails.you,c.accent)).children(trail(s.trails.cpu,c.orange))
   .child(head(s.you,c.accent)).child(head(s.cpu,c.orange))
   .when(s.phase!=='playing',e=>e.child(v_flex().absolute().inset_0().items_center().justify_center().gap(6).bg(c.bg+'b0').child(txt(s.phase==='won'?'YOU HOLD THE GRID':s.phase==='lost'?'DEREZZED':s.phase==='draw'?'DRAW':s.phase==='paused'?'PAUSED':'READY',s.phase==='lost'?c.orange:s.phase==='won'?c.green:c.accent,22).font_semibold()).child(txt(s.phase==='ready'||s.phase==='paused'?'Space to start · arrows / WASD steer':'Space for a new round',c.muted,12))));}
 duelGame(){const c=palette(),s=this.duel,r=read('duel',{}),live=s.phase==='playing';return this.gameBody('Grid duel','Real time. Steer with arrows or WASD; your cycle never stops. Walls, the arena edge and every light trail derez. Outlast the orange Program. Hitting the same cell together is a draw. P or Space pauses.',[
  h_flex().gap(8).flex_wrap().children(DUEL_LEVELS.map((v,i)=>btn(`duel-level-${i}`,v.name,(_e,cx)=>this.duelLevel(i,cx),s.level===i))),
  div().id('duel-board').w_full().min_w(0).overflow_x_scroll().child(this.duelArena()),
  h_flex().gap(8).flex_wrap().child(btn('duel-go',live?'Pause':s.phase==='paused'?'Resume':['won','lost','draw'].includes(s.phase)?'New round':'Start',(_e,cx)=>{if(live){this.stopDuel('Paused. Press Space or Resume.');cx.notify();}else this.duelGo(cx);},!live)).child(btn('duel-lounge','Return to lounge',()=>{this.stopDuel();close();open('room',{room:'lounge'});})),
  txt(`${s.phase.toUpperCase()} / ${s.message}`,s.phase==='lost'?c.orange:s.phase==='won'?c.green:c.text,14),
  txt(`${s.ticks} ticks · ${r.wins??0} wins · ${r.losses??0} losses · ${r.draws??0} draws · best streak ${r.best??0}`,c.muted),
  txt('The clock runs only during a live round and pauses when this arena loses focus. Local fiction; no agent or terminal actions.',c.muted,10)]);}
 discGame(){const c=palette(),s=this.disc,l=DISC_LEVELS[s.level];return this.gameBody('Disc ricochet','Click / and \\ mirrors to rotate them. Launch from S to hit T. Six launches per attempt; a miss shows the flight path.',[
 h_flex().gap(8).flex_wrap().children(DISC_LEVELS.map((v,i)=>btn(`disc-level-${i}`,v.name,(_e,cx)=>{this.disc=newDisc(i);cx.notify();},s.level===i))),
 v_flex().gap(3).children(Array.from({length:l.h},(_,y)=>h_flex().gap(3).children(Array.from({length:l.w},(_,x)=>{const k=key([x,y]),i=l.mirrors.findIndex(m=>key(m)===k),trail=s.path.some(p=>key(p)===k),wall=l.walls.some(p=>key(p)===k);return div().id(`disc-cell-${x}-${y}`).size(36).flex_none().rounded(3).bg(trail?c.accent+'35':c.panel).border(1).border_color(i>=0||trail?c.accent:c.line).text_color(i>=0?c.accent:c.text).text_size(20).flex().items_center().justify_center().child(i>=0?s.mirrors[i]:key(l.start)===k?'S':key(l.target)===k?'T':wall?'▪':trail?'·':'').when(i>=0,e=>e.cursor_pointer().on_click((_e,cx)=>{this.disc=rotateMirror(this.disc,i);cx.notify();}));})))),
 h_flex().gap(8).child(btn('launch-disc','Launch disc',(_e,cx)=>{this.disc=launchDisc(this.disc);this.finish('disc',this.disc);cx.notify();},true)).child(btn('disc-restart','Restart',(_e,cx)=>{this.disc=newDisc(s.level);cx.notify();})),txt(`${s.phase.toUpperCase()} / ${s.message}`,s.phase==='lost'?c.orange:s.phase==='won'?c.green:c.text,14),txt(`${s.attempts}/6 launches · ${s.rotations} rotations · Best win: ${read('bests',{})[`disc:${s.level}`]??'—'} launches`,c.muted),btn('disc-lounge','Return to lounge',()=>{close();open('room',{room:'lounge'});})]);}
}

export default class GroupedLayout extends Tron {
 init(p,cx){const pr={...(p??{}),...(workspaceTreeProps()??{})};if(pr.role==='workspace-tree'){this.workspaceTree=new WorkspaceTree();this.workspaceTree.init(pr,cx);}else super.init?.(p,cx);}
 render(cx){return this.workspaceTree?this.workspaceTree.render(cx):super.render(cx);}
 async close(cx){if(this.workspaceTree)await this.workspaceTree.close?.(cx);else await super.close?.(cx);}
}

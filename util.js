import{BlockLocation as x,ItemStack as _,MinecraftBlockTypes as b,MinecraftItemTypes as d,world as h}from"mojang-minecraft";var v=new class{constructor(){this.seed=GTF.env.GTF_PACK_ID}get(t){return this.seed=this.seed*25214903917+11&4294967295,this.seed%t}},a=new x(15728639,0,15728639),o,s=h.getDimension("overworld");function S(r){let t=s.getBlock(r);return t.id!=="minecraft:chest"&&(s.runCommand(`fill ${r.x-1} ${r.y+1} ${r.z-1} ${r.x+1} ${r.y+1} ${r.z+1} minecraft:barrier 0 replace`),t.setType(b.chest)),s.getBlock(r)}var u=s.getBlock(a);u.id!=="minecraft:chest"&&(u=S(a));o=u.getComponent("minecraft:inventory");var N=o.container.getItem(0),i=32752;function C(r){let t=Math.floor(r.length/i);if(t>i)throw new Error("Data too large");let e=[];for(let n=0;n<t;n++)e.push(r.substr(n*i,i));return e}function T(r){let t=JSON.stringify(r),e=o.container.getItem(0)||new _(d.dirt,1,0);e.setLore(C(t)),o.container.setItem(0,e)}function E(r){return JSON.parse(r.getLore().join(""))}N||T({});var w=P(GTF.env.GTF_PACK_ID),O=new x(w.x,0,w.z),V=S(O),p=V.getComponent("minecraft:inventory"),l=p.container.getItem(0)||new _(d.dirt,1,0);p.container.setItem(0,l);function P(r){let t=o.container.getItem(0),e;if(t){if(e=E(t),r in e)return e[r]}else t=new _(d.dirt,1,0),e={};let n;return T({...e,[r]:n={x:a.x+v.get(65535),z:a.z+v.get(65535)}}),n}var c=E(l),f=!0;function I(){if(f){f=!1;let r=h.events.tick.subscribe(()=>{f=!0;let t=Date.now();l.setLore(C(JSON.stringify(c))),p.container.setItem(0,l),h.events.tick.unsubscribe(r),console.log(`[GTF] Synced data in ${Date.now()-t}ms`)})}}var k=new class{get(r){return c[r]}set(r,t){let e=c[r]=t;return I(),e}delete(r){let t=delete c[r];return I(),t}};import{BlockRaycastOptions as B,EntityRaycastOptions as F}from"mojang-minecraft";var g=class{constructor(t){this.entity=t,this.raw=this.entity.getDynamicProperty("_")}};var D;(function(r){r[r.NONE=0]="NONE",r[r.NAME=1]="NAME"})(D||(D={}));var y=class{constructor(t){this._=t}cache(t,e){if(this.c.has(t))return this.c.get(t);let n=e();return this.c.set(t,n),n}get targetPlayer(){return this._}get bodyRotation(){return this._.bodyRotation}get dimension(){return this._.dimension}get headLocation(){return this._.headLocation}get id(){return this._.id}get isSneaking(){return this._.isSneaking}set isSneaking(t){this._.isSneaking=t}get location(){return this._.location}get name(){return this._.name}get nameTag(){return this._.nameTag}set nameTag(t){this._.nameTag=t}get onScreenDisplay(){return this._.onScreenDisplay}get selectedSlot(){return this._.selectedSlot}get inventory(){return this.getComponent("minecraft:inventory")}get selectedItem(){let t=this.inventory;try{return t?t.container.getItem(this.selectedSlot):null}catch{return null}}set selectedItem(t){let e=this.inventory;e&&e.container.setItem(this.selectedSlot,t)}set selectedSlot(t){this._.selectedSlot=t}get target(){return this._.target}set target(t){this._.target=t}get velocity(){return this._.velocity}get viewVector(){return this._.viewVector}store(){return this.cache("store",()=>new g(this._))}addEffect(t,e,n,m){this._.addEffect(t,e,n,m)}addTag(t){return this._.addTag(t)}getBlockFromViewVector(t){let e;return t&&(e=new B,Object.assign(e,t)),this._.getBlockFromViewVector(e)}getComponent(t){return this.cache("Component;"+t,()=>this.getComponent(t))}getComponents(){return this._.getComponents()}getDynamicProperty(t){return this._.getDynamicProperty(t)}getEffect(t){return this._.getEffect(t)}getEntitiesFromViewVector(t){let e;return t&&(e=new F,Object.assign(e,t)),this._.getEntitiesFromViewVector(e)}getItemCooldown(t){return this._.getItemCooldown(t)}getTags(){return this._.getTags()}hasComponent(t){return this._.hasComponent(t)}hasTag(t){return this._.hasTag(t)}kill(){this._.kill()}playSound(t,e){return this._.playSound(t,e)}removeDynamicProperty(t){return this._.removeDynamicProperty(t)}removeTag(t){return this._.removeTag(t)}runCommand(t){return this._.runCommand(t)}setDynamicProperty(t,e){this._.setDynamicProperty(t,e)}setVelocity(t){this._.setVelocity(t)}startItemCooldown(t,e){this._.startItemCooldown(t,e)}teleport(t,e,n,m){this._.teleport(t,e,n,m)}teleportFacing(t,e,n){this._.teleportFacing(t,e,n)}triggerEvent(t){this._.triggerEvent(t)}};import{world as A}from"mojang-minecraft";function G(r){for(let[t,e]of Object.entries(r))A.events[t].subscribe(e)}console.log(k);export{y as PlayerProxy,k as WorldStorage,G as registerEvents};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$2=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$1=t=>t,s$1=t$1.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$2=`lit$${Math.random().toFixed(9).slice(2)}$`,n$1="?"+o$2,r$2=`<${n$1}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$2:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$2+x):s+o$2+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$2),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$2)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$2),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n$1)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$2,t+1));)d.push({type:7,index:l}),t+=o$2.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$1.litHtmlPolyfillSupport;B?.(S,k),(t$1.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=t=>(e,o)=>{ void 0!==o?o.addInitializer(()=>{customElements.define(t,e);}):customElements.define(t,e);};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t,true,r);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t,true,r);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:true,attribute:false})}

function renderConfirmDialog(confirm, busy, onCancel, onConfirm, setDeleteFiles, setBlockRelease, setSearchAgain, setRemoveFromClient) {
    if (!confirm?.kind)
        return A;
    const p = confirm.payload;
    const title = p.title;
    const year = p.year;
    const titles = {
        m09: "Delete file and redownload?",
        m10: `Remove ${title}?`,
        d04: "Remove and blocklist this download?",
        d04b: "Remove this download?",
        m06: "Grab a rejected release?",
    };
    let body = "";
    let actionLabel = "Confirm";
    let danger = true;
    let options = A;
    switch (confirm.kind) {
        case "m09":
            body =
                "This deletes the movie file from disk. Radarr then searches for a new copy. You can't watch it until the new download finishes.";
            actionLabel = "Delete file & redownload";
            if (p.showBlockCheckbox) {
                options = b `
          <label>
            <input
              type="checkbox"
              .checked=${confirm.blockRelease ?? true}
              @change=${(e) => setBlockRelease(e.target.checked)}
            />
            Block this release so it isn't downloaded again.
          </label>
        `;
            }
            break;
        case "m10":
            body =
                "Radarr stops tracking this movie. The files stay on disk unless you tick the box below.";
            actionLabel = confirm.deleteFiles
                ? "Remove movie & delete files"
                : "Remove movie";
            options = b `
        <label>
          <input
            type="checkbox"
            .checked=${confirm.deleteFiles ?? false}
            @change=${(e) => setDeleteFiles(e.target.checked)}
          />
          Also delete the movie files
        </label>
        <p class="hint-muted">Leave unticked to keep the files.</p>
      `;
            break;
        case "d04":
            body = `${title}${year ? ` (${year})` : ""} is removed from the download client and this release is blocked.`;
            actionLabel = "Remove & blocklist";
            options = b `
        <label>
          <input
            type="checkbox"
            .checked=${confirm.searchAgain ?? true}
            @change=${(e) => setSearchAgain(e.target.checked)}
          />
          Search for a different release
        </label>
        <label>
          <input
            type="checkbox"
            .checked=${confirm.removeFromClient ?? true}
            @change=${(e) => setRemoveFromClient(e.target.checked)}
          />
          Delete the partial download from the client
        </label>
      `;
            break;
        case "d04b":
            body = `${title}${year ? ` (${year})` : ""} is removed from the queue. Radarr may grab the same release again.`;
            actionLabel = "Remove download";
            options = b `
        <label>
          <input
            type="checkbox"
            .checked=${confirm.removeFromClient ?? true}
            @change=${(e) => setRemoveFromClient(e.target.checked)}
          />
          Delete the partial download from the client
        </label>
      `;
            break;
        case "m06":
            body = `Radarr rejected this release: ${p.reasons ?? ""}`;
            actionLabel = "Grab anyway";
            danger = false;
            break;
        default:
            return A;
    }
    return b `
    <dialog
      open
      role="alertdialog"
      aria-labelledby="confirm-title"
      @cancel=${(e) => {
        e.preventDefault();
        if (!busy)
            onCancel();
    }}
    >
      <h2 id="confirm-title">${titles[confirm.kind]}</h2>
      <p>${body}</p>
      ${options}
      <div class="dialog-actions">
        <button class="text" ?disabled=${busy} @click=${onCancel}>
          Cancel
        </button>
        <button
          class=${danger ? "danger" : "primary"}
          ?disabled=${busy}
          aria-busy=${busy ? "true" : "false"}
          @click=${onConfirm}
        >
          ${busy ? "Working…" : actionLabel}
        </button>
      </div>
    </dialog>
  `;
}

const cardStyles = i$3 `
  :host {
    display: block;
    --arr-accent-text: color-mix(
      in srgb,
      var(--primary-color) 70%,
      var(--primary-text-color)
    );
    --arr-accent-fill: color-mix(in srgb, var(--primary-color) 80%, black);
    --arr-danger-fill: color-mix(in srgb, var(--error-color) 80%, black);
    --arr-danger-text: color-mix(
      in srgb,
      var(--error-color) 85%,
      var(--primary-text-color)
    );
    --arr-warn-text: color-mix(
      in srgb,
      var(--warning-color) 75%,
      var(--primary-text-color)
    );
    --arr-warn-ui: color-mix(
      in srgb,
      var(--warning-color) 65%,
      var(--primary-text-color)
    );
    --arr-ok-text: color-mix(
      in srgb,
      var(--success-color) 70%,
      var(--primary-text-color)
    );
  }

  ha-card {
    padding: 16px;
    overflow: hidden;
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.25rem;
    font-weight: 500;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: auto;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 16px;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    font-size: 0.85rem;
    min-height: 32px;
    cursor: default;
  }

  .chip-button {
    cursor: pointer;
  }

  .tabs {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid var(--divider-color);
    margin-bottom: 12px;
  }

  .tab {
    padding: 12px 16px;
    border: none;
    background: transparent;
    color: var(--secondary-text-color);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    font: inherit;
    min-height: 48px;
  }

  .tab[aria-selected="true"] {
    color: var(--arr-accent-text);
    border-bottom-color: var(--primary-color);
  }

  .badge {
    margin-left: 6px;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.75rem;
    background: var(--arr-accent-fill);
    color: #fff;
  }

  .badge.warn {
    background: var(--arr-warn-ui);
  }

  .badge.error {
    background: var(--error-color);
  }

  button.primary {
    background: var(--arr-accent-fill);
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    min-height: 48px;
  }

  button.danger {
    background: var(--arr-danger-fill);
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    min-height: 48px;
  }

  button.outline-danger {
    border: 1px solid var(--arr-danger-text);
    color: var(--arr-danger-text);
    background: transparent;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    min-height: 48px;
  }

  button.text {
    border: none;
    background: transparent;
    color: var(--arr-accent-text);
    cursor: pointer;
    padding: 8px;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button:focus-visible,
  .tab:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .banner {
    padding: 12px;
    margin-bottom: 12px;
    background: color-mix(in srgb, var(--error-color) 15%, var(--card-background-color));
    border-radius: 4px;
    color: var(--primary-text-color);
  }

  .offline-dim {
    opacity: 0.55;
    filter: grayscale(0.8);
    pointer-events: none;
  }

  .hint-muted {
    color: var(--secondary-text-color);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
    gap: 12px;
  }

  .poster-btn {
    border: none;
    padding: 0;
    background: transparent;
    cursor: pointer;
    text-align: left;
  }

  .poster-btn img {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    border-radius: 4px;
    background: var(--divider-color);
  }

  .queue-row {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--divider-color);
    position: relative;
  }

  .queue-row.attention::before {
    content: "";
    position: absolute;
    left: -16px;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--error-color);
  }

  .queue-row.attention.warn::before {
    background: var(--arr-warn-ui);
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.85rem;
  }

  .pill.failed {
    color: var(--arr-danger-text);
    background: color-mix(in srgb, var(--error-color) 15%, transparent);
  }

  .search-field {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    font: inherit;
    margin-bottom: 12px;
    box-sizing: border-box;
  }

  .layout-tablet .tab {
    min-height: 60px;
    font-size: 17px;
  }

  .layout-tablet button {
    min-height: 56px;
    font-size: 17px;
  }

  .compact .chips .chip:not(.health) {
    display: none;
  }

  dialog {
    border: none;
    border-radius: 8px;
    padding: 24px;
    max-width: min(520px, 90vw);
    background: var(--card-background-color);
    color: var(--primary-text-color);
    box-shadow: var(--ha-card-box-shadow, 0 4px 24px rgba(0, 0, 0, 0.2));
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  .dialog-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    gap: 12px;
  }

  .live-region {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
`;

async function callArr(hass, entryId, command, data) {
    return hass.callWS({
        type: "arr_dashboard",
        entry_id: entryId,
        command,
        data: data ?? {},
    });
}
async function resolveEntryId(hass, instance) {
    const entries = (await hass.callWS({
        type: "config_entries/list",
    }));
    const arr = entries.filter((e) => e.domain === "arr_dashboard");
    if (!arr.length)
        return undefined;
    if (!instance)
        return arr[0].entry_id;
    const match = arr.find((e) => e.entry_id === instance || e.title === instance);
    return match?.entry_id ?? arr[0].entry_id;
}

let ArrCardEditor = class ArrCardEditor extends i {
    constructor() {
        super(...arguments);
        this._config = {};
    }
    setConfig(config) {
        this._config = { ...config };
    }
    createRenderRoot() {
        return this;
    }
    _value(key) {
        return this._config[key];
    }
    _set(key, value) {
        this._config = { ...this._config, [key]: value };
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config: this._config },
            bubbles: true,
            composed: true,
        }));
    }
    render() {
        const hide = Boolean(this._value("hide_destructive_actions"));
        return b `
      <div class="card-config">
        <h3>General</h3>
        <label>
          Title
          <input
            .value=${String(this._value("title") ?? "Movies")}
            @change=${(e) => this._set("title", e.target.value)}
          />
        </label>
        <label>
          Instance
          <input
            .value=${String(this._value("instance") ?? "")}
            @change=${(e) => this._set("instance", e.target.value)}
          />
        </label>
        <label>
          Default tab
          <select
            .value=${String(this._value("default_tab") ?? "library")}
            @change=${(e) => this._set("default_tab", e.target.value)}
          >
            <option value="library">Library</option>
            <option value="downloading">Downloading</option>
            <option value="add">Add</option>
          </select>
        </label>
        <h3>Safety</h3>
        <label>
          <input
            type="checkbox"
            .checked=${hide}
            @change=${(e) => this._set("hide_destructive_actions", e.target.checked)}
          />
          Hide fix and remove buttons on this dashboard
        </label>
        <p class="hint">
          Hides buttons only. It doesn't change who is allowed to do what.
        </p>
        <label>
          <input
            type="checkbox"
            .checked=${this._value("add_defaults") &&
            this._value("add_defaults")
                .search_on_add !== false}
            @change=${(e) => {
            const ad = this._value("add_defaults") ?? {};
            this._set("add_defaults", {
                ...ad,
                search_on_add: e.target.checked,
            });
        }}
          />
          Start searching now (default for Add movie)
        </label>
      </div>
    `;
    }
};
__decorate([
    n({ attribute: false })
], ArrCardEditor.prototype, "hass", void 0);
__decorate([
    n({ attribute: false })
], ArrCardEditor.prototype, "lovelace", void 0);
__decorate([
    r()
], ArrCardEditor.prototype, "_config", void 0);
ArrCardEditor = __decorate([
    t("arr-card-editor")
], ArrCardEditor);

function fireToast(el, message, action) {
    el.dispatchEvent(new CustomEvent("hass-notification", {
        bubbles: true,
        composed: true,
        detail: {
            message,
            action: undefined,
        },
    }));
}
function queueNeedsAttention(item) {
    const st = (item.status || "").toLowerCase();
    const tr = (item.trackedDownloadStatus || "").toLowerCase();
    return (st === "failed" ||
        tr.includes("failed") ||
        tr.includes("importpending") ||
        tr.includes("importblocked") ||
        st === "warning");
}
let ArrDashboardCard = class ArrDashboardCard extends i {
    constructor() {
        super(...arguments);
        this._tab = "library";
        this._loading = true;
        this._confirm = null;
        this._confirmBusy = false;
        this._addQuery = "";
        this._lookupResults = [];
        this._libraryFilter = "all";
        this._librarySearch = "";
        this._compact = false;
        this._failCount = 0;
    }
    setConfig(config) {
        if (!config.type) {
            throw new Error("Invalid configuration");
        }
        this.config = {
            title: "Movies",
            icon: "mdi:movie-open",
            tabs: ["add", "downloading", "library"],
            default_tab: "library",
            compact: "auto",
            layout: "auto",
            show_header_chips: ["disk", "queue", "health"],
            hide_destructive_actions: false,
            add_defaults: { search_on_add: true },
            ...config,
            type: config.type || "custom:arr-card",
        };
        this._tab = this.config.default_tab ?? "library";
        this._libraryFilter = this.config.library_filter ?? "all";
    }
    connectedCallback() {
        super.connectedCallback();
        this._ro = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect.width ?? 400;
            const compactCfg = this.config?.compact ?? "auto";
            this._compact =
                compactCfg === true || (compactCfg === "auto" && w < 340);
        });
        this._ro.observe(this);
    }
    firstUpdated() {
        void this._bootstrap();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._ro?.disconnect();
        if (this._refreshTimer)
            clearInterval(this._refreshTimer);
    }
    async _bootstrap() {
        if (!this.hass)
            return;
        const eid = await resolveEntryId(this.hass, this.config?.instance);
        if (!eid) {
            this._configError = `No Radarr instance called "${this.config.instance ?? ""}".`;
            this._loading = false;
            return;
        }
        this._entryId = eid;
        await this._refresh();
        this._schedulePoll();
    }
    _schedulePoll() {
        if (this._refreshTimer)
            clearInterval(this._refreshTimer);
        const ms = this._tab === "downloading" ? 5000 : 30000;
        this._refreshTimer = setInterval(() => void this._refresh(), ms);
    }
    async _refresh() {
        if (!this._entryId || !this.hass)
            return;
        try {
            const data = (await callArr(this.hass, this._entryId, "get_state"));
            this._state = data;
            this._failCount = 0;
            if (!data.reachable)
                this._failCount = 3;
        }
        catch {
            this._failCount += 1;
        }
        finally {
            this._loading = false;
        }
    }
    get _hideDestructive() {
        return Boolean(this.config.hide_destructive_actions);
    }
    get _offline() {
        return this._failCount >= 3 || this._state?.reachable === false;
    }
    async _ws(command, data) {
        if (!this._entryId || !this.hass)
            throw new Error("No instance");
        return callArr(this.hass, this._entryId, command, data);
    }
    _switchTab(tab) {
        this._tab = tab;
        this._schedulePoll();
    }
    _filteredMovies() {
        const movies = this._state?.movies ?? [];
        let list = [...movies];
        const q = this._librarySearch.trim().toLowerCase();
        if (q) {
            list = list.filter((m) => m.title?.toLowerCase().includes(q));
        }
        if (this._libraryFilter === "missing") {
            list = list.filter((m) => !m.hasFile);
        }
        else if (this._libraryFilter === "downloaded") {
            list = list.filter((m) => m.hasFile);
        }
        return list;
    }
    _queueRecords() {
        const rec = this._state?.queue?.records ?? [];
        return [...rec].sort((a, b) => {
            const aw = queueNeedsAttention(a) ? 0 : 1;
            const bw = queueNeedsAttention(b) ? 0 : 1;
            return aw - bw;
        });
    }
    async _doLookup() {
        if (this._addQuery.length < 2 || !this.hass)
            return;
        const res = (await this._ws("lookup", { term: this._addQuery }));
        this._lookupResults = res.results?.slice(0, 20) ?? [];
    }
    render() {
        if (this._configError) {
            return b `
        <ha-card>
          <p><strong>Movies card can't start</strong></p>
          <p>${this._configError}</p>
        </ha-card>
      `;
        }
        const cfg = this.config ?? {};
        const layoutTablet = cfg.layout === "tablet" || (cfg.layout === "auto" && !this._compact);
        const tabs = cfg.tabs ?? ["add", "downloading", "library"];
        const showTabBar = tabs.length > 1;
        const queueCount = this._state?.queue_count ?? 0;
        const failedInQueue = this._queueRecords().some((r) => (r.status || "").toLowerCase() === "failed");
        return b `
      <ha-card
        class="${this._compact ? "compact" : ""} ${layoutTablet
            ? "layout-tablet"
            : ""}"
      >
        <div class="header">
          <div class="title-row">
            <ha-icon icon="${this.config.icon ?? "mdi:movie-open"}"></ha-icon>
            <span>${this.config.title ?? "Movies"}</span>
          </div>
          <div class="chips">${this._renderChips()}</div>
        </div>

        ${showTabBar
            ? b `
              <div class="tabs" role="tablist" aria-label="Arr card tabs">
                ${tabs.map((t) => b `
                    <button
                      role="tab"
                      class="tab"
                      aria-selected=${this._tab === t ? "true" : "false"}
                      @click=${() => this._switchTab(t)}
                    >
                      ${t === "add"
                ? "Add"
                : t === "downloading"
                    ? "Downloading"
                    : "Library"}
                      ${t === "downloading" && queueCount > 0
                ? b `
                            <span
                              class="badge ${failedInQueue
                    ? "error"
                    : "warn"}"
                              >${queueCount}</span
                            >
                          `
                : A}
                    </button>
                  `)}
              </div>
            `
            : A}

        ${this._offline
            ? b `
              <div class="banner" role="alert">
                <strong>Can't reach Radarr.</strong> Actions are off until it's
                back.
                <button class="text" @click=${() => this._refresh()}>Retry</button>
              </div>
            `
            : A}

        <div class="${this._offline ? "offline-dim" : ""}">
          ${this._tab === "library" ? this._renderLibrary() : A}
          ${this._tab === "downloading" ? this._renderDownloading() : A}
          ${this._tab === "add" ? this._renderAdd() : A}
        </div>

        ${this._selectedMovie ? this._renderDetail() : A}
        ${renderConfirmDialog(this._confirm, this._confirmBusy, () => (this._confirm = null), () => void this._runConfirm(), (v) => {
            if (this._confirm)
                this._confirm = { ...this._confirm, deleteFiles: v };
        }, (v) => {
            if (this._confirm)
                this._confirm = { ...this._confirm, blockRelease: v };
        }, (v) => {
            if (this._confirm)
                this._confirm = { ...this._confirm, searchAgain: v };
        }, (v) => {
            if (this._confirm)
                this._confirm = { ...this._confirm, removeFromClient: v };
        })}
        <div class="live-region" aria-live="polite"></div>
      </ha-card>
    `;
    }
    _renderChips() {
        const chips = this.config.show_header_chips ?? ["disk", "queue", "health"];
        const disk = this._state?.disk_space?.[0];
        const freeGb = disk
            ? (disk.freeSpace / 1e9).toFixed(1)
            : "—";
        return b `
      ${chips.includes("disk")
            ? b `<span class="chip health"
            ><ha-icon icon="mdi:harddisk"></ha-icon>${freeGb} GB free</span
          >`
            : A}
      ${chips.includes("queue")
            ? b `<button
            class="chip chip-button"
            @click=${() => this._switchTab("downloading")}
          >
            <ha-icon icon="mdi:download"></ha-icon>
            ${this._state?.queue_count
                ? `${this._state.queue_count} active`
                : "Nothing downloading"}
          </button>`
            : A}
      ${chips.includes("health")
            ? b `<span class="chip health"
            ><ha-icon
              icon="${this._offline ? "mdi:lan-disconnect" : "mdi:heart-pulse"}"
            ></ha-icon
            >${this._offline ? "Offline" : "Healthy"}</span
          >`
            : A}
    `;
    }
    _renderLibrary() {
        if (this._loading) {
            return b `<p>Loading your library…</p>`;
        }
        const movies = this._filteredMovies();
        return b `
      <input
        class="search-field"
        placeholder="Search your library"
        aria-label="Search your library"
        .value=${this._librarySearch}
        @input=${(e) => (this._librarySearch = e.target.value)}
      />
      <div class="grid" role="list">
        ${movies.map((m) => b `
            <button
              class="poster-btn"
              role="listitem"
              aria-label=${m.title ?? "Movie"}
              @click=${() => (this._selectedMovie = m)}
            >
              <img src=${m.posterUrl ?? ""} alt="" loading="lazy" />
              <div>${m.title} (${m.year})</div>
            </button>
          `)}
      </div>
      ${!movies.length
            ? b `<p>No movies match your filters.</p>`
            : A}
    `;
    }
    _renderDownloading() {
        const rows = this._queueRecords();
        if (!rows.length) {
            return b `
        <p><ha-icon icon="mdi:check-circle"></ha-icon> Nothing downloading</p>
      `;
        }
        return b `
      <div role="list">
        ${rows.map((row) => this._renderQueueRow(row))}
      </div>
    `;
    }
    _renderQueueRow(row) {
        const title = row.movie?.title ?? row.title ?? "Download";
        const failed = (row.status || "").toLowerCase() === "failed";
        const importAttn = (row.trackedDownloadStatus || "")
            .toLowerCase()
            .includes("import");
        const hide = this._hideDestructive;
        return b `
      <div
        class="queue-row ${failed ? "attention" : importAttn ? "attention warn" : ""}"
        role="listitem"
      >
        <div style="flex:1">
          <strong>${title}</strong>
          <span class="pill ${failed ? "failed" : ""}"
            >${row.status ?? "Queued"}</span
          >
          <div
            role="progressbar"
            aria-label="${title} progress"
            aria-valuenow="0"
          ></div>
          <div>
            ${!hide
            ? b `
                  ${failed || row.trackedDownloadStatus === "warning"
                ? b `<button
                        class="outline-danger"
                        data-action="remove-search-again"
                        data-qid=${row.id}
                        ?disabled=${this._offline}
                        @click=${() => void this._removeSearchAgain(row.id)}
                      >
                        Remove & search again
                      </button>`
                : A}
                  ${failed
                ? b `<button
                        class="outline-danger"
                        data-action="queue-remove"
                        data-qid=${row.id}
                        ?disabled=${this._offline}
                        @click=${() => this._openConfirm("d04b", {
                    title,
                    queue_id: row.id,
                })}
                      >
                        Remove
                      </button>`
                : A}
                `
            : b `
                  ${queueNeedsAttention(row)
                ? b `<p class="hint-muted">
                        <ha-icon icon="mdi:information-outline"></ha-icon>
                        Removing is turned off on this dashboard.
                      </p>`
                : A}
                `}
            ${importAttn && row.outputPath
            ? b `<button
                  class="primary"
                  data-action="retry-import"
                  data-qid=${row.id}
                  ?disabled=${this._offline}
                  @click=${() => void this._retryImport(row)}
                >
                  Retry import
                </button>`
            : A}
          </div>
        </div>
        ${!hide
            ? b `<button
              aria-label="More actions for ${title}"
              class="text"
              @click=${() => this._openConfirm("d04", {
                title,
                year: row.movie?.year,
                queue_id: row.id,
            })}
            >
              ⋮
            </button>`
            : A}
      </div>
    `;
    }
    _renderAdd() {
        return b `
      <input
        class="search-field"
        placeholder="Search for a movie to add"
        aria-label="Search for a movie to add"
        ?disabled=${this._offline}
        .value=${this._addQuery}
        @input=${(e) => {
            this._addQuery = e.target.value;
            void this._doLookup();
        }}
      />
      <div role="list">
        ${this._lookupResults.map((r) => b `
            <div role="listitem">
              <strong>${r.title} (${r.year})</strong>
              <button
                class="primary"
                data-action="add-movie"
                ?disabled=${this._offline}
                @click=${() => void this._addFromLookup(r)}
              >
                Add movie
              </button>
            </div>
          `)}
      </div>
    `;
    }
    _renderDetail() {
        const m = this._selectedMovie;
        if (!m)
            return A;
        const hide = this._hideDestructive;
        return b `
      <dialog open>
        <button class="text" @click=${() => (this._selectedMovie = undefined)}>
          ← Back
        </button>
        <h2>${m.title} (${m.year})</h2>
        <label>
          <input
            type="checkbox"
            role="switch"
            .checked=${m.monitored ?? true}
            @change=${(e) => void this._setMonitored(m.id, e.target.checked)}
          />
          Monitored
        </label>
        <button
          class="primary"
          ?disabled=${this._offline}
          @click=${() => void this._movieSearch(m.id)}
        >
          Search again
        </button>
        <button
          class="primary"
          ?disabled=${this._offline}
          @click=${() => void this._manualSearch(m.id)}
        >
          Manual search
        </button>
        ${!hide && m.hasFile
            ? b `
              <section>
                <h3>Fix or remove</h3>
                <button
                  class="outline-danger"
                  data-action="delete-redownload"
                  ?disabled=${this._offline}
                  @click=${() => this._openConfirm("m09", {
                title: m.title,
                movie_id: m.id,
                showBlockCheckbox: true,
            })}
                >
                  Delete file & redownload
                </button>
                <button
                  class="outline-danger"
                  data-action="remove-movie"
                  ?disabled=${this._offline}
                  @click=${() => this._openConfirm("m10", {
                title: m.title,
                movie_id: m.id,
            })}
                >
                  Remove movie
                </button>
              </section>
            `
            : A}
      </dialog>
    `;
    }
    _openConfirm(kind, payload) {
        this._confirm = {
            kind,
            payload,
            deleteFiles: false,
            blockRelease: true,
            searchAgain: true,
            removeFromClient: true,
        };
    }
    async _runConfirm() {
        if (!this._confirm)
            return;
        this._confirmBusy = true;
        const { kind, payload } = this._confirm;
        try {
            switch (kind) {
                case "m10":
                    await this._ws("remove_movie", {
                        movie_id: payload.movie_id,
                        delete_files: this._confirm.deleteFiles ?? false,
                    });
                    fireToast(this, `Removed ${payload.title}.`);
                    this._selectedMovie = undefined;
                    break;
                case "m09":
                    await this._ws("delete_file_redownload", {
                        movie_id: payload.movie_id,
                        block_release: this._confirm.blockRelease ?? false,
                    });
                    fireToast(this, `Deleted the file. Searching for a new copy of ${payload.title}…`);
                    break;
                case "d04":
                    await this._ws("queue_remove_blocklist", {
                        queue_id: payload.queue_id,
                        search_again: this._confirm.searchAgain ?? true,
                        remove_from_client: this._confirm.removeFromClient ?? true,
                    });
                    fireToast(this, `Removed ${payload.title} and blocked the release.`);
                    break;
                case "d04b":
                    await this._ws("queue_remove", {
                        queue_id: payload.queue_id,
                        remove_from_client: this._confirm.removeFromClient ?? true,
                    });
                    fireToast(this, `Removed ${payload.title} from downloads.`);
                    break;
                default:
                    break;
            }
            await this._refresh();
        }
        catch (err) {
            fireToast(this, `Couldn't complete action. Radarr said: ${err}`);
        }
        finally {
            this._confirmBusy = false;
            this._confirm = null;
        }
    }
    async _removeSearchAgain(queueId) {
        await this._ws("queue_remove_search_again", { queue_id: queueId });
        fireToast(this, "Removed and blocked the release. Searching for another…");
        await this._refresh();
    }
    async _retryImport(row) {
        await this._ws("retry_import", {
            output_path: row.outputPath,
            download_client_id: row.downloadId,
        });
        fireToast(this, `Retrying import for ${row.movie?.title ?? "movie"}…`);
        await this._refresh();
    }
    async _setMonitored(movieId, monitored) {
        await this._ws("set_monitored", { movie_id: movieId, monitored });
        fireToast(this, monitored
            ? "Monitoring on."
            : "Monitoring off. Radarr won't download or upgrade it.");
        await this._refresh();
    }
    async _movieSearch(movieId) {
        await this._ws("movie_search", { movie_id: movieId });
        fireToast(this, "Searching…");
    }
    async _manualSearch(movieId) {
        await this._ws("release_search", { movie_id: movieId });
        fireToast(this, "Searching indexers…");
    }
    async _addFromLookup(r) {
        const profiles = this._state?.quality_profiles ?? [];
        const roots = this._state?.root_folders ?? [];
        const defaults = this.config.add_defaults ?? {};
        const profile = profiles.find((p) => p.name === defaults.quality_profile) ??
            profiles[0];
        const root = roots.find((f) => f.path === defaults.root_folder) ?? roots[0];
        await this._ws("add_movie", {
            title: r.title,
            year: r.year,
            tmdbId: r.tmdbId,
            imdbId: r.imdbId,
            quality_profile_id: profile?.id,
            root_folder_path: root?.path,
            search_on_add: defaults.search_on_add !== false,
            monitored: true,
            minimum_availability: defaults.minimum_availability ?? "released",
        });
        fireToast(this, `Added ${r.title}. Searching for a download…`);
        await this._refresh();
    }
    getCardSize() {
        return this._compact ? 4 : 8;
    }
};
ArrDashboardCard.styles = cardStyles;
__decorate([
    n({ attribute: false })
], ArrDashboardCard.prototype, "hass", void 0);
__decorate([
    n({ attribute: false })
], ArrDashboardCard.prototype, "config", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_entryId", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_state", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_tab", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_configError", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_loading", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_confirm", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_confirmBusy", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_addQuery", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_lookupResults", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_selectedMovie", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_libraryFilter", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_librarySearch", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_compact", void 0);
ArrDashboardCard = __decorate([
    t("arr-card")
], ArrDashboardCard);
customElements.define("arr-dashboard-card", class extends ArrDashboardCard {
});
window.customCards =
    window.customCards ?? [];
window.customCards.push({
    type: "custom:arr-card",
    name: "Arr Dashboard",
    description: "Radarr library, queue, and add card",
    preview: true,
    documentationURL: "https://github.com/SCWPretorius/ha-arr-dashboard",
});
customElements.whenDefined("arr-dashboard-card").then(() => {
    const el = customElements.get("arr-dashboard-card");
    if (el && !customElements.get("ha-panel-arr-card")) ;
});
function getConfigElement() {
    return document.createElement("arr-card-editor");
}
function getStubConfig(hass) {
    return { type: "custom:arr-card", instance: "" };
}

export { ArrDashboardCard, getConfigElement, getStubConfig };

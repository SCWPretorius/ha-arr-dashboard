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
const t$1=globalThis,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$5=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$5.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$5.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$1.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$4,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$4(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i$1=t=>t,s$1=t.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$3=`lit$${Math.random().toFixed(9).slice(2)}$`,n$1="?"+o$3,r$2=`<${n$1}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$2:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$3+x):s+o$3+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$3),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$3)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$3),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n$1)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$3,t+1));)d.push({type:7,index:l}),t+=o$3.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t.litHtmlPolyfillSupport;B?.(S,k),(t.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$2=s.litElementPolyfillSupport;o$2?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o$1=o=>o??A;

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

const RADARR_PROFILE = {
    app: "radarr",
    noun: "movie",
    nounTitle: "Movie",
    plural: "movies",
    product: "Radarr",
    defaultTitle: "Movies",
    defaultIcon: "mdi:movie-open",
    cardType: "custom:arr-movies-card",
    idField: "movie_id",
    commands: {
        add: "add_movie",
        get: "get_movie",
        search: "movie_search",
        seasonSearch: "season_search",
        remove: "remove_movie",
        setMonitored: "set_monitored",
        setSeasonMonitored: "set_season_monitored",
        setQuality: "set_quality_profile",
    },
};
const SONARR_PROFILE = {
    app: "sonarr",
    noun: "series",
    nounTitle: "Series",
    plural: "series",
    product: "Sonarr",
    defaultTitle: "Series",
    defaultIcon: "mdi:television",
    cardType: "custom:arr-series-card",
    idField: "series_id",
    commands: {
        add: "add_series",
        get: "get_series",
        search: "series_search",
        seasonSearch: "season_search",
        remove: "remove_series",
        setMonitored: "set_series_monitored",
        setSeasonMonitored: "set_season_monitored",
        setQuality: "set_series_quality_profile",
    },
};
function profileFor(app) {
    switch (app) {
        case "radarr":
            return RADARR_PROFILE;
        case "sonarr":
            return SONARR_PROFILE;
        default: {
            const _never = app;
            return _never;
        }
    }
}
function isSeriesCardType(type) {
    return (type ?? "").includes("arr-series-card");
}
const MONITOR_MODES = [
    "all",
    "future",
    "missing",
    "existing",
    "firstSeason",
    "latestSeason",
    "none",
];
function isMonitorMode(value) {
    return (value === "all" ||
        value === "future" ||
        value === "missing" ||
        value === "existing" ||
        value === "firstSeason" ||
        value === "latestSeason" ||
        value === "none");
}
function monitorLabel(mode) {
    switch (mode) {
        case "all":
            return "All episodes";
        case "future":
            return "Future episodes";
        case "missing":
            return "Missing episodes";
        case "existing":
            return "Existing episodes";
        case "firstSeason":
            return "First season";
        case "latestSeason":
            return "Latest season";
        case "none":
            return "None";
        default: {
            const _never = mode;
            return _never;
        }
    }
}
function seriesRunLabel(status) {
    const value = String(status ?? "").toLowerCase();
    if (value === "continuing")
        return "Continuing";
    if (value === "ended")
        return "Ended";
    return "";
}
function episodeCode(seasonNumber, episodeNumber) {
    if (seasonNumber == null || episodeNumber == null)
        return "";
    const season = String(seasonNumber).padStart(2, "0");
    const episode = String(episodeNumber).padStart(2, "0");
    return `S${season}E${episode}`;
}

/** Register a custom element once. Lovelace may import this module more than once. */
function defineElement(name, ctor) {
    const attempt = () => {
        if (customElements.get(name))
            return;
        try {
            customElements.define(name, ctor);
        }
        catch (err) {
            if (customElements.get(name))
                return;
            if (err instanceof DOMException &&
                (err.name === "NotSupportedError" || err.name === "NotAllowedError")) {
                return;
            }
            throw err;
        }
    };
    attempt();
    // Lovelace can create the card before this module finishes defining it.
    // A failed or skipped define during that import still leaves the name free,
    // and a second attempt once the import microtask runs succeeds.
    queueMicrotask(() => {
        if (!customElements.get(name))
            attempt();
    });
}

function formatSize(bytes) {
    if (!bytes)
        return "";
    const gb = bytes / 1e9;
    return `${gb.toFixed(1)} GB`;
}
function confirmScreenId(kind, layoutTablet) {
    switch (kind) {
        case "m06":
            return "M06";
        case "m09":
            return layoutTablet ? "M09T" : "M09";
        case "m10":
            return "M10";
        case "d04":
            return "D04";
        case "d04b":
            return "D04b";
        default: {
            const _exhaustive = kind;
            return _exhaustive;
        }
    }
}
function renderConfirmDialog(confirm, busy, layoutTablet, onCancel, onConfirm, setDeleteFiles, setBlockRelease, setSearchAgain, setRemoveFromClient, setAddImportExclusion, copy = { product: "Radarr", noun: "movie" }) {
    if (!confirm?.kind)
        return A;
    const p = confirm.payload;
    const title = p.title;
    const year = p.year;
    const quality = p.quality;
    const size = p.size;
    let heading = "";
    let body = "";
    let actionLabel = "Confirm";
    let danger = true;
    let options = A;
    switch (confirm.kind) {
        case "m09":
            heading = "Delete file and redownload?";
            body = b `
        <p>
          This deletes <strong>${title}${year ? ` (${year})` : ""}</strong>
          ${quality ? ` · ${quality}` : ""}
          ${size ? ` · ${formatSize(size)}` : ""} from disk. ${copy.product} then
          searches for a new copy.
        </p>
        <p>You can’t watch it until the new download finishes.</p>
      `;
            actionLabel = "Delete file & redownload";
            if (p.showBlockCheckbox) {
                options = b `
          <label>
            <input
              type="checkbox"
              .checked=${confirm.blockRelease ?? true}
              @change=${(e) => setBlockRelease(e.target.checked)}
            />
            Block this release so it isn’t downloaded again.
          </label>
          <p class="hint-muted">Recommended if the file was bad.</p>
        `;
            }
            break;
        case "m10":
            heading = `Remove ${title}?`;
            body = b `
        <p>
          ${copy.product} stops tracking this ${copy.noun}.
          <strong>The files stay on disk</strong> unless you tick the box below.
        </p>
      `;
            actionLabel = confirm.deleteFiles
                ? `Remove ${copy.noun} & delete files`
                : `Remove ${copy.noun}`;
            options = b `
        <label>
          <input
            type="checkbox"
            .checked=${confirm.deleteFiles ?? false}
            @change=${(e) => setDeleteFiles(e.target.checked)}
          />
          Also delete the ${copy.noun} files
          ${size ? `(${formatSize(size)})` : ""}
        </label>
        <p class="hint-muted">Leave unticked to keep the files.</p>
        <label>
          <input
            type="checkbox"
            .checked=${confirm.addImportExclusion ?? false}
            @change=${(e) => setAddImportExclusion(e.target.checked)}
          />
          Don’t add it again from lists
        </label>
      `;
            break;
        case "d04":
            heading = "Remove and blocklist this download?";
            body = b `
        <p>
          <strong>${title}${year ? ` (${year})` : ""}</strong> is removed from
          the download client and this release is blocked so it isn’t grabbed
          again.
        </p>
      `;
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
            heading = "Remove this download?";
            body = b `
        <p>
          <strong>${title}${year ? ` (${year})` : ""}</strong> is removed from
          the queue. ${copy.product} may grab the same release again.
        </p>
      `;
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
            heading = "Grab a rejected release?";
            body = b `
        <p>${copy.product} rejected this release: <strong>${p.reasons ?? ""}</strong>.</p>
        <p class="mono">${p.releaseName ?? ""} · ${formatSize(p.size)}</p>
      `;
            actionLabel = "Grab anyway";
            danger = false;
            break;
        default:
            return A;
    }
    const screen = confirmScreenId(confirm.kind, layoutTablet);
    return b `
    <dialog
      open
      role="alertdialog"
      data-screen=${screen}
      aria-labelledby="confirm-title"
      @cancel=${(e) => {
        e.preventDefault();
        if (!busy)
            onCancel();
    }}
    >
      <ha-icon
        icon="mdi:alert-outline"
        class="danger-icon"
        style="color: var(--error-color)"
      ></ha-icon>
      <h2 id="confirm-title">${heading}</h2>
      ${typeof body === "string" ? b `<p>${body}</p>` : body}
      ${options}
      <div class="dialog-actions">
        <button
          class="text"
          ?disabled=${busy}
          @click=${onCancel}
          autofocus
        >
          Cancel
        </button>
        <button
          class=${danger ? "danger" : "primary"}
          ?disabled=${busy}
          aria-busy=${busy ? "true" : "false"}
          @click=${onConfirm}
        >
          <ha-icon icon=${danger ? "mdi:delete-forever" : "mdi:download"}></ha-icon>
          ${busy
        ? kindBusyLabel(confirm.kind)
        : actionLabel}
        </button>
      </div>
    </dialog>
  `;
}
function kindBusyLabel(kind) {
    switch (kind) {
        case "m09":
            return "Deleting…";
        case "m10":
            return "Removing…";
        case "d04":
        case "d04b":
            return "Removing…";
        case "m06":
            return "Sending…";
        default:
            return "Working…";
    }
}

function formatBytes(bytes) {
    if (!bytes)
        return "";
    if (bytes >= 1e9)
        return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6)
        return `${(bytes / 1e6).toFixed(0)} MB`;
    return `${bytes} B`;
}
function formatAirDate(iso) {
    if (!iso)
        return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function formatRelative(iso) {
    if (!iso)
        return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2)
        return "just now";
    if (mins < 60)
        return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 48)
        return `${hrs} hr ago`;
    return d.toLocaleDateString();
}
function queueProgress(row) {
    const size = row.size ?? 0;
    const left = row.sizeleft ?? size;
    if (!size)
        return 0;
    return Math.min(100, Math.max(0, Math.round(((size - left) / size) * 100)));
}
function queueStatusLabel(row) {
    const st = row.status ?? "Queued";
    const tr = row.trackedDownloadStatus;
    if (tr && tr !== st)
        return `${st} · ${tr}`;
    return st;
}

/** Matches `.library-scroll .poster-grid` padding and gap in styles.ts. */
const LIBRARY_GRID_PAD_X = 24;
const LIBRARY_GRID_GAP_X = 8;
const LIBRARY_GRID_ROW_PAD_Y = 12;
const LIBRARY_TILE_MIN = 160;
/**
 * How many posters fit across the library grid at this card width.
 * Wider cards add columns; posters stay near the minimum tile width.
 */
function libraryPosterColumns(width) {
    const available = Math.max(0, width - LIBRARY_GRID_PAD_X);
    const cols = Math.floor((available + LIBRARY_GRID_GAP_X) / (LIBRARY_TILE_MIN + LIBRARY_GRID_GAP_X));
    return Math.max(2, cols);
}
/** Virtual-row height for a 2:3 poster plus the row's vertical padding. */
function libraryPosterRowHeight(width, columns) {
    const cols = Math.max(1, columns);
    const available = Math.max(0, width - LIBRARY_GRID_PAD_X);
    const tileW = (available - LIBRARY_GRID_GAP_X * Math.max(0, cols - 1)) / cols;
    return Math.ceil(Math.max(0, tileW) * (3 / 2) + LIBRARY_GRID_ROW_PAD_Y);
}

/** TMDb tile size for library grid/list thumbnails (see image.tmdb.org size docs). */
const TMDB_TILE_SIZE = "w185";
const TMDB_PREFIX = "https://image.tmdb.org/t/p/";
/** Prefer a smaller TMDb profile when the URL is a TMDb image; otherwise unchanged. */
function posterUrlForTile(url) {
    if (!url?.startsWith(TMDB_PREFIX)) {
        return url ?? "";
    }
    const rest = url.slice(TMDB_PREFIX.length);
    const slash = rest.indexOf("/");
    if (slash < 0) {
        return url;
    }
    const path = rest.slice(slash + 1);
    return `${TMDB_PREFIX}${TMDB_TILE_SIZE}/${path}`;
}

const EXIT_MS = 200;
function prefersReducedMotion() {
    return (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}
async function animateQueueRowExit(onExitStart) {
    onExitStart();
    if (prefersReducedMotion())
        return;
    await new Promise((resolve) => window.setTimeout(resolve, EXIT_MS));
}

function sortReleases(rows, sort) {
    const copy = [...rows];
    switch (sort) {
        case "size":
            copy.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
            break;
        case "age":
            copy.sort((a, b) => (a.age ?? 0) - (b.age ?? 0));
            break;
        case "seeders":
            copy.sort((a, b) => (b.seeders ?? 0) - (a.seeders ?? 0));
            break;
    }
    return copy;
}
function releaseQualityName(release) {
    return release.quality?.quality?.name ?? "—";
}

function qualityNames(profile) {
    const items = profile.items ?? [];
    const names = [];
    for (const item of items) {
        const q = item.quality?.name ?? item.name;
        if (q)
            names.push(q);
    }
    return names;
}
function profileSummaryLine(profile) {
    const names = qualityNames(profile);
    if (!names.length)
        return "";
    if (names.length === 1)
        return `${names[0]} only`;
    const lowest = names[0];
    const highest = names[names.length - 1];
    const cutoff = profile.cutoff?.name;
    if (cutoff) {
        return `${lowest}–${highest} · upgrades until ${cutoff}`;
    }
    return `${lowest}–${highest}`;
}

function renderIssuesPanel(health, disks, config, offline, product = "Radarr") {
    const issueCount = health.filter((h) => h.type === "warning" || h.type === "error").length;
    const intro = offline
        ? `Can't reach ${product} right now.`
        : issueCount > 0
            ? `${product} reports ${issueCount} issue(s). Fix them in ${product}'s settings.`
            : "Everything looks good.";
    const link = config.external_link;
    return b `
    <div class="issues-pane" data-screen="I01">
      <p class="hint-muted">${intro}</p>
      <section>
        <h3>Health</h3>
        ${health.length
        ? health.map((h) => b `
                <p class="status-line">
                  <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                  ${h.source ?? ""} · from ${product} — ${h.message}
                </p>
              `)
        : b `<p class="hint-muted">No health warnings.</p>`}
      </section>
      <section>
        <h3>Disk space</h3>
        ${disks.length
        ? disks.map((d) => b `
                <p class="status-line mono">
                  ${d.path}: ${formatBytes(d.freeSpace)} free of
                  ${formatBytes(d.totalSpace)}
                </p>
              `)
        : b `<p class="hint-muted">No disk info.</p>`}
      </section>
      ${link
        ? b `
            <a
              class="primary link-button"
              href=${String(link)}
              target="_blank"
              rel="noopener"
            >
              Open ${product}
            </a>
          `
        : A}
    </div>
  `;
}
function renderStatusSheet(open, health, disks, config, onClose, product = "Radarr") {
    if (!open)
        return A;
    const link = config.external_link;
    const issueCount = health.filter((h) => h.type === "warning" || h.type === "error").length;
    const intro = issueCount > 0
        ? `${product} reports ${issueCount} issue(s). Fix them in ${product}'s settings.`
        : "Everything looks good.";
    return b `
    <div
      class="sheet-backdrop"
      data-screen="G02"
      @click=${(e) => {
        if (e.target === e.currentTarget)
            onClose();
    }}
    >
      <div class="sheet-panel" role="dialog" aria-label="${product} status">
        <div class="sheet-header">
          <h2>${product} status</h2>
          <button class="text" @click=${onClose}>Done</button>
        </div>
        <p class="hint-muted">${intro}</p>
        <section>
          <h3>Health</h3>
          ${health.length
        ? health.map((h) => b `
                  <p class="status-line">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                    ${h.source ?? ""} · from ${product} — ${h.message}
                  </p>
                `)
        : b `<p class="hint-muted">No health warnings.</p>`}
        </section>
        <section>
          <h3>Disk space</h3>
          ${disks.map((d) => b `
              <p class="status-line mono">
                ${d.path}: ${formatBytes(d.freeSpace)} free of
                ${formatBytes(d.totalSpace)}
              </p>
            `)}
        </section>
        ${link
        ? b `
              <a
                class="primary link-button"
                href=${String(link)}
                target="_blank"
                rel="noopener"
              >
                Open ${product}
              </a>
            `
        : A}
      </div>
    </div>
  `;
}
function renderFailureSheet(title, detail, onClose) {
    if (!detail)
        return A;
    return b `
    <div
      class="sheet-backdrop"
      data-screen="G05"
      @click=${(e) => {
        if (e.target === e.currentTarget)
            onClose();
    }}
    >
      <div class="sheet-panel" role="dialog" aria-label="Failure details">
        <h2>${title}</h2>
        <p class="mono">${detail}</p>
        <button class="primary" @click=${onClose}>Close</button>
      </div>
    </div>
  `;
}
function renderAddSheet(open, layoutTablet, pick, profiles, roots, profileId, rootPath, searchOnAdd, monitored, minAvailability, busy, offline, setProfile, setRoot, setSearchOnAdd, setMonitored, setMinAvail, onCancel, onConfirm, app = "radarr", monitor = "all", setMonitor = () => undefined) {
    if (!open || !pick)
        return A;
    const series = app === "sonarr";
    const screen = layoutTablet ? "A04T" : "A04";
    const searchLabel = series
        ? "Search for missing episodes"
        : "Start searching now";
    const searchHint = series
        ? "Sonarr looks for missing episodes straight away."
        : "Radarr looks for a download straight away.";
    return b `
    <div
      class="sheet-backdrop"
      data-screen=${screen}
      @click=${(e) => {
        if (e.target === e.currentTarget)
            onCancel();
    }}
    >
      <div
        class="sheet-panel"
        role="dialog"
        aria-label=${series ? "Add series" : "Add movie"}
      >
        <h2>Add ${pick.title}${pick.year ? ` (${pick.year})` : ""}</h2>
        <label>
          Quality profile
          <select
            .value=${String(profileId ?? "")}
            @change=${(e) => setProfile(Number(e.target.value))}
          >
            ${profiles.map((p) => b `
                <option value=${p.id} ?selected=${p.id === profileId}>
                  ${p.name}
                </option>
              `)}
          </select>
        </label>
        <label>
          Save to
          <select
            .value=${rootPath ?? ""}
            @change=${(e) => setRoot(e.target.value)}
          >
            ${roots.map((f) => b `
                <option value=${f.path} ?selected=${f.path === rootPath}>
                  ${f.path}
                </option>
              `)}
          </select>
        </label>
        ${series
        ? b `
              <label>
                Monitor
                <select
                  data-field="monitor"
                  aria-label="Monitor"
                  .value=${monitor}
                  @change=${(e) => {
            const next = e.target.value;
            if (isMonitorMode(next))
                setMonitor(next);
        }}
                >
                  ${MONITOR_MODES.map((mode) => b `
                      <option value=${mode} ?selected=${mode === monitor}>
                        ${monitorLabel(mode)}
                      </option>
                    `)}
                </select>
              </label>
            `
        : b `
              <details>
                <summary>More options</summary>
                <label>
                  Minimum availability
                  <select
                    .value=${minAvailability}
                    @change=${(e) => setMinAvail(e.target.value)}
                  >
                    <option value="announced">Announced</option>
                    <option value="inCinemas">In cinemas</option>
                    <option value="released">Released</option>
                  </select>
                </label>
              </details>
            `}
        <label>
          <input
            type="checkbox"
            role="switch"
            .checked=${searchOnAdd}
            @change=${(e) => setSearchOnAdd(e.target.checked)}
          />
          ${searchLabel}
        </label>
        <p class="hint-muted">${searchHint}</p>
        ${series
        ? A
        : b `
              <label>
                <input
                  type="checkbox"
                  role="switch"
                  .checked=${monitored}
                  @change=${(e) => setMonitored(e.target.checked)}
                />
                Monitor this movie
              </label>
              <p class="hint-muted">
                Radarr grabs it when it's released and upgrades it later.
              </p>
            `}
        <div class="dialog-actions">
          <button class="text" @click=${onCancel}>Cancel</button>
          <button
            class="primary"
            data-action=${series ? "add-series" : "add-movie"}
            ?disabled=${offline || busy}
            @click=${onConfirm}
          >
            ${busy ? "Adding…" : series ? "Add series" : "Add movie"}
          </button>
        </div>
      </div>
    </div>
  `;
}
function renderQualitySheet(open, movieTitle, movieYear, profiles, currentId, pendingId, searchAfter, busy, setSearch, onSelect, onSave, onClose) {
    if (!open)
        return A;
    const current = profiles.find((p) => p.id === currentId);
    const changed = pendingId !== undefined && pendingId !== currentId;
    return b `
    <div
      class="sheet-backdrop"
      data-screen="M08"
      @click=${(e) => {
        if (e.target === e.currentTarget)
            onClose();
    }}
    >
      <div class="sheet-panel quality-sheet" role="dialog">
        <h2>Change quality profile</h2>
        <p class="hint-muted">
          ${movieTitle ?? "Movie"}${movieYear ? ` (${movieYear})` : ""} · now
          ${current?.name ?? "—"}
        </p>
        <label>
          <input
            type="checkbox"
            .checked=${searchAfter}
            @change=${(e) => setSearch(e.target.checked)}
          />
          Search for a matching release now
        </label>
        <p class="hint-muted">
          Your current file stays until a better one is imported.
        </p>
        <div class="profile-radio-list" role="radiogroup">
          ${profiles.map((p) => b `
              <label class="profile-radio ${p.id === pendingId ? "selected" : ""}">
                <input
                  type="radio"
                  name="quality-profile"
                  .checked=${p.id === pendingId}
                  @change=${() => onSelect(p.id)}
                />
                <span class="profile-radio-body">
                  <span class="profile-name"
                    >${p.name}
                    ${p.id === currentId ? b ` · current` : A}</span
                  >
                  <span class="profile-summary">${profileSummaryLine(p)}</span>
                </span>
              </label>
            `)}
        </div>
        <div class="dialog-actions">
          <button class="text" @click=${onClose}>Cancel</button>
          <button
            class="primary"
            ?disabled=${!changed || busy}
            @click=${onSave}
          >
            ${busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </div>
    </div>
  `;
}
function renderQueueOverflowSheet(open, title, year, hideDestructive, offline, onClose, onRemove, onBlocklist) {
    return b `
    <div
      class="sheet-backdrop"
      data-screen="D03"
      @click=${(e) => {
        if (e.target === e.currentTarget)
            onClose();
    }}
    >
      <div
        class="sheet-panel queue-menu"
        role="dialog"
        aria-label="Download actions"
      >
        <h2>${title}${year ? ` (${year})` : ""}</h2>
        <div class="queue-menu-actions">
          ${hideDestructive
        ? b `<p class="hint-muted">
                Removing is turned off on this dashboard.
              </p>`
        : b `
                <button
                  class="queue-menu-btn"
                  data-action="queue-remove"
                  aria-label="Remove download"
                  ?disabled=${offline}
                  @click=${onRemove}
                >
                  Remove
                </button>
                <button
                  class="queue-menu-btn"
                  aria-label="Remove and blocklist"
                  ?disabled=${offline}
                  @click=${onBlocklist}
                >
                  Blocklist
                </button>
              `}
          <button class="text" @click=${onClose}>Close</button>
        </div>
      </div>
    </div>
  `;
}

/** Spec §10 confirm and §11 toast copy (exact labels). */
function toastAdded(title, searchOn) {
    return searchOn
        ? `Added ${title}. Searching for a download…`
        : `Added ${title}. It won't download until you search.`;
}
function toastSearchAgain(title) {
    return `Searching for ${title}…`;
}
function toastGrab() {
    return "Sent to download client. Watch it in Downloading.";
}
function toastRemoveQueue(title) {
    return `Removed ${title} from downloads.`;
}
function toastRemoveBlocklist(title, search) {
    return search
        ? `Removed ${title} and blocked the release. Searching for another…`
        : `Removed ${title} and blocked the release.`;
}
function toastRetryImport(title) {
    return `Retrying import for ${title}…`;
}
function toastProfile(name, searching) {
    return searching
        ? `Quality profile set to ${name}. Searching…`
        : `Quality profile set to ${name}.`;
}
function toastMonitorOn(title) {
    return `Monitoring on for ${title}.`;
}
function toastMonitorOff(title, product = "Radarr") {
    return `Monitoring off for ${title}. ${product} won't download or upgrade it.`;
}
function toastDeleteRedownload(title) {
    return `Deleted the file. Searching for a new copy of ${title}…`;
}
function toastRemoveMovie(title, deleted) {
    return deleted
        ? `Removed ${title} and deleted its files.`
        : `Removed ${title}.`;
}
function toastGone(noun = "movie") {
    return `That ${noun} was already removed.`;
}
function toastRadarrBack(product = "Radarr") {
    return `${product} is back.`;
}
const FAILURE_VERBS = {
    add_movie: "add the movie",
    movie_search: "start the search",
    grab_release: "send the release",
    queue_remove: "remove the download",
    retry_import: "retry the import",
    set_quality_profile: "change the profile",
    set_monitored: "update monitoring",
    delete_file_redownload: "delete the file",
    remove_movie: "remove the movie",
    add_series: "add the series",
    series_search: "start the search",
    season_search: "search the season",
    release_search: "search for releases",
    get_episodes: "load episodes",
    remove_series: "remove the series",
    set_series_quality_profile: "change the profile",
    set_series_monitored: "update monitoring",
    set_season_monitored: "update monitoring",
};

const cardStyles = i$3 `
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
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
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 8px 4px 16px;
    overflow: hidden;
    background: #141414;
    color: #e5e5e5;
    border: none;
    box-shadow: none;
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    padding: 0 12px;
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
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: #e5e5e5;
    font-size: 0.78rem;
    min-height: 28px;
    cursor: default;
  }

  .chip-button {
    cursor: pointer;
  }

  .tabs {
    display: flex;
    gap: 4px;
    margin: 0 12px 8px;
    border-bottom: none;
  }

  .tab {
    padding: 8px 14px;
    border: none;
    background: transparent;
    color: #b3b3b3;
    cursor: pointer;
    border-radius: 4px;
    font: inherit;
    font-weight: 600;
    min-height: 36px;
  }

  .tab[aria-selected="true"] {
    color: #fff;
    background: rgba(255, 255, 255, 0.12);
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

  .arr-virtual-host {
    display: block;
    overflow: auto;
    width: 100%;
    max-height: var(--arr-virtual-height, 70vh);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px 8px;
    width: 100%;
    min-width: 0;
  }

  .poster-btn {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    min-width: 0;
    border: none;
    padding: 0;
    background: transparent;
    color: var(--primary-text-color);
    cursor: pointer;
    text-align: left;
    font: inherit;
  }

  .poster-btn img {
    display: block;
    width: 100%;
    max-width: 100%;
    height: auto;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    border-radius: 4px;
    background: #2a2a2a;
    transition: transform 160ms ease, filter 160ms ease;
  }

  .poster-btn:hover img,
  .poster-btn:focus-visible img {
    transform: scale(1.04);
    filter: brightness(1.08);
  }

  .poster-caption {
    display: block;
    overflow: hidden;
    margin-top: 6px;
    font-size: 0.78rem;
    font-weight: 500;
    line-height: 1.2;
    color: #d2d2d2;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .download-pane {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .download-scroll {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    width: 100%;
    overflow: auto;
    padding: 4px 12px 24px;
  }

  .download-grid {
    display: grid;
    width: 100%;
    box-sizing: border-box;
    grid-template-columns: repeat(var(--arr-cols, 3), minmax(0, 1fr));
    gap: 16px 10px;
  }

  .download-empty {
    padding: 12px 16px;
  }

  .queue-tile {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    position: relative;
  }

  .queue-tile.exiting {
    animation: queue-tile-exit 200ms ease forwards;
  }

  @keyframes queue-tile-exit {
    to {
      opacity: 0;
      transform: scale(0.96);
      max-height: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .queue-tile.exiting {
      animation: none;
      opacity: 0;
    }
  }

  .queue-tile-poster {
    position: relative;
    width: 100%;
    border-radius: 4px;
    overflow: hidden;
    background: #1a1a1a;
    aspect-ratio: 2 / 3;
  }

  .queue-tile-poster img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .queue-tile-poster::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.85) 0%,
      rgba(0, 0, 0, 0.15) 45%,
      transparent 70%
    );
    pointer-events: none;
  }

  .queue-tile-progress {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 4px;
    background: rgba(255, 255, 255, 0.15);
    z-index: 1;
  }

  .queue-tile-progress .progress-fill {
    background: #e50914;
  }

  .queue-tile-status {
    position: absolute;
    left: 8px;
    bottom: 10px;
    z-index: 2;
    font-size: 0.72rem;
    background: rgba(0, 0, 0, 0.65);
    color: #fff;
    border: none;
  }

  .queue-tile-overflow {
    position: absolute;
    top: 6px;
    right: 6px;
    z-index: 3;
    border: none;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    line-height: 1;
    font-size: 1.1rem;
    cursor: pointer;
  }

  .queue-tile-label {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 2;
    padding: 8px 42px 22px 8px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.78), transparent);
    pointer-events: none;
  }

  .queue-tile-title {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 600;
    color: #fff;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .queue-tile-meta {
    margin: 2px 0 0;
    font-size: 0.68rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.86);
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .queue-tile-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .tile-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 5px 8px;
    min-height: 0;
    border-radius: 6px;
    font: inherit;
    font-size: 0.68rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease;
  }

  .tile-action--danger {
    border: 1px solid
      color-mix(in srgb, var(--error-color) 45%, transparent);
    color: var(--arr-danger-text);
    background: color-mix(in srgb, var(--error-color) 10%, transparent);
  }

  .tile-action--danger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--error-color) 18%, transparent);
    border-color: color-mix(in srgb, var(--error-color) 65%, transparent);
  }

  .tile-action--muted {
    color: color-mix(in srgb, var(--arr-danger-text) 75%, #9a9a9a);
    background: transparent;
    border-color: color-mix(in srgb, var(--error-color) 28%, transparent);
  }

  .tile-action--muted:hover:not(:disabled) {
    background: color-mix(in srgb, var(--error-color) 8%, transparent);
  }

  .layout-tablet .queue-tile-actions .tile-action {
    min-height: 0;
    font-size: 0.68rem;
    padding: 5px 8px;
  }

  .queue-tile.attention .queue-tile-poster {
    box-shadow: inset 0 0 0 2px var(--error-color);
  }

  .queue-tile.attention.warn .queue-tile-poster {
    box-shadow: inset 0 0 0 2px var(--arr-warn-ui);
  }

  .profile-radio-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 12px 0;
  }

  .profile-radio {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-height: 56px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
  }

  .profile-radio.selected {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  }

  .profile-radio-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .profile-summary {
    font-size: 0.85rem;
    color: var(--secondary-text-color);
  }

  .release-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .release-chip {
    font-size: 0.8rem;
    padding: 2px 6px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--primary-color) 20%, transparent);
  }

  .best-match-pill {
    font-size: 0.75rem;
    color: var(--arr-accent-text);
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
    width: calc(100% - 24px);
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    font: inherit;
    font-size: 0.9rem;
    margin: 4px 12px 8px;
    box-sizing: border-box;
  }

  .search-field::placeholder {
    color: #8c8c8c;
  }

  .layout-tablet button.primary,
  .layout-tablet button.danger,
  .layout-tablet button.outline-danger {
    min-height: 48px;
    font-size: 1rem;
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

  .layout-body {
    display: flex;
    flex: 1;
    gap: 16px;
    align-items: stretch;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }

  .main-pane {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    height: 100%;
  }

  .library-pane {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .library-scroll {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    align-self: stretch;
    min-width: 0;
    min-height: 0;
    width: 100%;
    overflow: hidden;
  }

  .library-load-sentinel {
    width: 100%;
    height: 1px;
    flex: 0 0 auto;
    pointer-events: none;
  }

  .library-scroll arr-virtual-list.library-virtual {
    display: block;
    width: 100%;
    min-width: 0;
    flex: 1 1 auto;
    min-height: 0;
    max-height: none;
    height: 100%;
    overflow: auto;
  }

  .library-scroll arr-virtual-list .viewport,
  .library-scroll arr-virtual-list .window,
  .library-scroll arr-virtual-list .spacer {
    width: 100%;
    box-sizing: border-box;
  }

  .library-scroll arr-virtual-list .window {
    display: block;
    position: absolute;
  }

  .library-scroll arr-virtual-list .poster-grid {
    display: grid;
    width: 100%;
    box-sizing: border-box;
    grid-template-columns: repeat(var(--arr-cols, 3), minmax(0, 1fr));
    gap: 12px 8px;
    padding: 4px 12px 8px;
  }

  .poster-grid {
    display: grid;
    width: 100%;
    box-sizing: border-box;
    grid-template-columns: repeat(var(--arr-cols, 3), minmax(0, 1fr));
    gap: 16px 10px;
    padding: 4px 12px 32px;
  }

  .poster-grid .poster-btn {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  .library-toolbar {
    justify-content: flex-end;
    gap: 8px;
  }

  .poster-grid .poster-caption {
    display: none;
  }

  .library-scroll .poster-grid .poster-caption {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1;
    display: block;
    margin: 0;
    padding: 8px 8px 20px;
    overflow: hidden;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    text-overflow: ellipsis;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.78), transparent);
    border-radius: 4px 4px 0 0;
    pointer-events: none;
  }

  .issues-pane {
    padding: 8px 12px 24px;
    overflow: auto;
    flex: 1;
    min-height: 0;
  }

  .issues-pane section {
    margin-top: 16px;
  }

  .issues-pane h3 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
  }

  .with-side-panel .main-pane {
    flex: 1 1 55%;
  }

  .side-panel {
    flex: 0 0 40%;
    max-width: 420px;
    border-left: 1px solid var(--divider-color);
    padding-left: 16px;
    max-height: 70vh;
    overflow: auto;
  }

  .compact ha-card {
    padding: 10px;
  }

  .mono {
    font-family: var(--code-font-family, monospace);
    font-size: 0.85rem;
  }

  .progress-bar {
    height: 8px;
    background: var(--divider-color);
    border-radius: 4px;
    overflow: hidden;
    margin: 8px 0;
  }

  .progress-fill {
    height: 100%;
    background: var(--primary-color);
    transition: width 0.3s ease;
  }

  .queue-main {
    flex: 1;
    min-width: 0;
  }

  .queue-meta {
    color: var(--secondary-text-color);
    font-size: 0.85rem;
  }

  .queue-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .overflow-btn {
    align-self: flex-start;
    font-size: 1.25rem;
  }

  .pill.ok {
    color: var(--arr-ok-text);
    background: color-mix(in srgb, var(--success-color) 12%, transparent);
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0 12px 4px;
    align-items: center;
  }

  .filter-chip {
    border: none;
    background: transparent;
    color: #b3b3b3;
    border-radius: 999px;
    padding: 4px 12px;
    cursor: pointer;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    min-height: 32px;
  }

  .filter-chip.active {
    background: #fff;
    color: #141414;
  }

  .sort-select {
    margin-left: auto;
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.08);
    color: #e5e5e5;
    color-scheme: dark;
    font: inherit;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .sort-select option {
    background: #1f1f1f;
    color: #e5e5e5;
  }

  .list-view {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .list-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    border: none;
    background: transparent;
    padding: 8px;
    cursor: pointer;
    text-align: left;
    font: inherit;
    border-bottom: 1px solid var(--divider-color);
  }

  .list-row.selected {
    background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  }

  .list-row .thumb {
    width: 40px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }

  .poster-btn.small {
    flex: 0 0 148px;
    width: 148px;
    scroll-snap-align: start;
  }

  .add-pane {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
  }

  .coming-grid {
    display: grid;
    width: 100%;
    box-sizing: border-box;
    grid-template-columns: repeat(var(--arr-cols, 3), minmax(0, 1fr));
    gap: 12px 8px;
    padding: 4px 12px 16px;
  }

  .coming-grid .poster-btn.small {
    position: relative;
    flex: none;
    width: 100%;
  }

  .coming-grid .poster-caption {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    display: block;
    margin: 0;
    padding: 8px 8px 20px;
    overflow: hidden;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    text-overflow: ellipsis;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.78), transparent);
    border-radius: 4px 4px 0 0;
    pointer-events: none;
  }

  .h-scroll {
    display: flex;
    gap: 8px;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 4px 48px 12px 12px;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
    mask-image: linear-gradient(to right, #000 0, #000 calc(100% - 56px), transparent);
  }

  .h-scroll::-webkit-scrollbar {
    display: none;
  }

  .row-section {
    min-width: 0;
    margin-bottom: 6px;
  }

  .episode-list {
    margin: 0 12px 12px;
  }

  .episode-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid var(--divider-color);
  }

  .episode-when {
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  .season-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid var(--divider-color);
  }

  .season-row .season-copy {
    flex: 1 1 auto;
    min-width: 0;
  }

  .poster-status,
  .lookup-status {
    font-size: 0.75rem;
    font-weight: 500;
    opacity: 0.85;
  }

  .row-section h3,
  .library-heading {
    margin: 14px 12px 8px;
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #fff;
  }

  .library-with-rail {
    display: flex;
    gap: 8px;
    min-width: 0;
    width: 100%;
  }

  .library-with-rail > .grid,
  .library-with-rail > .list-view,
  .library-with-rail > arr-virtual-list {
    flex: 1 1 auto;
    min-width: 0;
    width: 100%;
  }

  arr-virtual-list.grid {
    display: block;
  }

  .vrow {
    display: grid;
    grid-template-columns: repeat(var(--arr-cols, 6), minmax(0, 1fr));
    column-gap: 8px;
    width: 100%;
    height: var(--arr-row-h, 240px);
    box-sizing: border-box;
    padding: 0 12px 10px;
    align-items: start;
  }

  .vrow .poster-caption {
    display: none;
  }

  .az-rail {
    display: none;
  }

  .skeleton-block,
  .skeleton-list {
    min-height: 120px;
    background: linear-gradient(
      90deg,
      var(--divider-color) 25%,
      transparent 50%,
      var(--divider-color) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.2s infinite;
    border-radius: 4px;
    margin: 12px 0;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .lookup-grid {
    display: grid;
    width: 100%;
    box-sizing: border-box;
    grid-template-columns: repeat(var(--arr-cols, 3), minmax(0, 1fr));
    gap: 12px 8px;
    padding: 4px 12px 16px;
  }

  .lookup-card {
    position: relative;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    border-radius: 4px;
    background: #2a2a2a;
  }

  .lookup-poster {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #2a2a2a;
  }

  .lookup-title {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin: 0;
    padding: 8px 8px 28px;
    color: #fff;
    font-size: 0.78rem;
    font-weight: 600;
    line-height: 1.25;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.78), transparent);
    pointer-events: none;
  }

  .lookup-title > span:first-child {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .lookup-soon {
    padding: 1px 6px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.4;
    text-transform: uppercase;
  }

  .lookup-actions {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    padding: 28px 8px 8px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.82), transparent);
  }

  .lookup-actions button.primary {
    flex: 1 1 auto;
    min-height: 32px;
    padding: 4px 8px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .layout-tablet .lookup-actions button.primary {
    min-height: 32px;
    font-size: 0.75rem;
  }

  .lookup-actions .pill {
    font-size: 0.7rem;
  }

  .lookup-skeleton .skeleton-poster {
    background: linear-gradient(
      90deg,
      var(--divider-color) 25%,
      transparent 50%,
      var(--divider-color) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.2s infinite;
  }

  .sheet-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 10;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .layout-tablet .sheet-backdrop {
    align-items: center;
  }

  .sheet-panel {
    width: min(520px, 100%);
    max-height: 85vh;
    overflow: auto;
    background: var(--card-background-color);
    padding: 20px;
    border-radius: 12px 12px 0 0;
    box-shadow: var(--ha-card-box-shadow, 0 -4px 24px rgba(0, 0, 0, 0.2));
  }

  .layout-tablet .sheet-panel {
    border-radius: 12px;
  }

  .detail-popup-backdrop.sheet-backdrop {
    align-items: center;
    padding: 16px;
  }

  .detail-popup.sheet-panel {
    width: min(440px, 100%);
    max-height: min(88vh, 760px);
    overflow: auto;
    padding: 16px 16px 20px;
    border-radius: 12px;
  }

  .detail-popup h2 {
    margin: 4px 0 12px;
    font-size: 1.2rem;
    line-height: 1.25;
  }

  .detail-popup .detail-poster {
    float: none;
    display: block;
    width: 140px;
    max-width: 46%;
    height: auto;
    margin: 0 0 12px;
  }

  .detail-popup .detail-actions {
    flex-direction: column;
  }

  .detail-popup .detail-actions button,
  .layout-tablet .detail-popup .detail-actions button.primary {
    width: 100%;
    min-height: 40px;
  }

  .queue-menu.sheet-panel {
    width: max-content;
    max-width: min(360px, calc(100vw - 32px));
    padding: 14px 14px 12px;
  }

  .queue-menu h2 {
    margin: 0 0 10px;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .queue-menu-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .queue-menu-actions button.queue-menu-btn,
  .layout-tablet .queue-menu-actions button.queue-menu-btn {
    min-height: 32px;
    padding: 4px 12px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.06);
    color: #e5e5e5;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
  }

  .queue-menu-actions button.queue-menu-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
  }

  .queue-menu-actions button.text {
    min-height: 32px;
    padding: 4px 8px;
    font-size: 0.82rem;
  }

  .sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status-line {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    margin: 8px 0;
  }

  .link-button {
    display: inline-block;
    text-decoration: none;
    text-align: center;
    margin-top: 12px;
  }

  .detail-dialog,
  .release-dialog {
    border: none;
    border-radius: 8px;
    padding: 16px;
    max-width: min(640px, 95vw);
    background: var(--card-background-color);
    color: var(--primary-text-color);
    box-shadow: var(--ha-card-box-shadow, 0 4px 24px rgba(0, 0, 0, 0.2));
    margin-top: 12px;
  }

  .detail-poster {
    max-width: 160px;
    border-radius: 4px;
    float: left;
    margin: 0 12px 12px 0;
  }

  .detail-dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 12px;
    font-size: 0.9rem;
  }

  .detail-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 12px 0;
  }

  .overview {
    clear: both;
    color: var(--secondary-text-color);
    font-size: 0.9rem;
  }

  .release-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--divider-color);
  }

  .release-row.rejected {
    opacity: 0.85;
  }

  .error-text {
    color: var(--error-color);
  }

  .danger-icon {
    margin-bottom: 8px;
  }
`;

function showToast(el, message, actionText, onAction) {
    el.dispatchEvent(new CustomEvent("hass-notification", {
        bubbles: true,
        composed: true,
        detail: {
            message,
            duration: actionText ? 8000 : 4000,
            action: actionText
                ? {
                    text: actionText,
                    action: () => {
                    },
                }
                : undefined,
        },
    }));
}
function showActionFailure(el, command, err, product = "Radarr") {
    const verb = FAILURE_VERBS[command] ?? "complete the action";
    const message = err instanceof Error ? err.message : String(err);
    showToast(el, `Couldn't ${verb}. ${product} said: ${message}`, "Details");
}

/**
 * Virtual scroller that renders into light DOM so parent card styles apply.
 */
class ArrVirtualList extends i {
    constructor() {
        super(...arguments);
        this.itemHeight = 72;
        this.itemCount = 0;
        this.columns = 1;
        this.rowClass = "";
        /** New value when row contents change but itemCount stays the same. */
        this.contentKey = 0;
        this._scrollTop = 0;
        this._height = 400;
    }
    createRenderRoot() {
        return this;
    }
    _rowCount() {
        if (this.columns <= 1)
            return this.itemCount;
        return Math.ceil(this.itemCount / this.columns);
    }
    connectedCallback() {
        super.connectedCallback();
        this.classList.add("arr-virtual-host");
        this._onScrollBound = this._onScroll.bind(this);
        this.addEventListener("scroll", this._onScrollBound);
        this._ro = new ResizeObserver(() => {
            this._height = this.clientHeight;
        });
        this._ro.observe(this);
    }
    disconnectedCallback() {
        if (this._onScrollBound) {
            this.removeEventListener("scroll", this._onScrollBound);
        }
        this._ro?.disconnect();
        super.disconnectedCallback();
    }
    _onScroll() {
        this._scrollTop = this.scrollTop;
    }
    render() {
        void this.contentKey;
        const rows = this._rowCount();
        const buffer = this.itemHeight * 4;
        const total = rows * this.itemHeight;
        const startRow = Math.max(0, Math.floor((this._scrollTop - buffer) / this.itemHeight));
        const visibleRows = Math.ceil((this._height + buffer * 2) / this.itemHeight);
        const endRow = Math.min(rows, startRow + visibleRows);
        const rowNodes = [];
        for (let row = startRow; row < endRow; row++) {
            const startIndex = row * this.columns;
            if (this.columns <= 1) {
                rowNodes.push(this.renderItem(startIndex));
            }
            else if (this.renderRow) {
                const count = Math.min(this.columns, this.itemCount - startIndex);
                rowNodes.push(b `<div class=${this.rowClass} role="presentation">
            ${this.renderRow(startIndex, count)}
          </div>`);
            }
        }
        return b `
      <div class="viewport" style="position:relative;width:100%">
        <div class="spacer" style="height:${total}px;width:100%"></div>
        <div
          class="window"
          style="position:absolute;left:0;right:0;top:0;transform:translateY(${startRow * this.itemHeight}px)"
        >
          ${rowNodes}
        </div>
      </div>
    `;
    }
}
__decorate([
    n({ type: Number })
], ArrVirtualList.prototype, "itemHeight", void 0);
__decorate([
    n({ type: Number })
], ArrVirtualList.prototype, "itemCount", void 0);
__decorate([
    n({ type: Number })
], ArrVirtualList.prototype, "columns", void 0);
__decorate([
    n({ type: String })
], ArrVirtualList.prototype, "rowClass", void 0);
__decorate([
    n({ attribute: false })
], ArrVirtualList.prototype, "renderItem", void 0);
__decorate([
    n({ attribute: false })
], ArrVirtualList.prototype, "renderRow", void 0);
__decorate([
    n({ attribute: false })
], ArrVirtualList.prototype, "contentKey", void 0);
__decorate([
    r()
], ArrVirtualList.prototype, "_scrollTop", void 0);
__decorate([
    r()
], ArrVirtualList.prototype, "_height", void 0);
defineElement("arr-virtual-list", ArrVirtualList);

const posterSignCache = new Map();
async function signPosterPath(hass, path) {
    if (!path.startsWith("/api/arr_dashboard")) {
        return path;
    }
    const cached = posterSignCache.get(path);
    if (cached)
        return cached;
    const res = (await hass.callWS({
        type: "auth/sign_path",
        path,
        expires: 60 * 60,
    }));
    posterSignCache.set(path, res.path);
    return res.path;
}
async function callArr(hass, entryId, command, data) {
    return hass.callWS({
        type: "arr_dashboard",
        entry_id: entryId,
        command,
        data: data ?? {},
    });
}
function asApp(value) {
    return value === "sonarr" ? "sonarr" : "radarr";
}
async function fetchInstances(hass, entryId) {
    try {
        const res = (await hass.callWS({
            type: "arr_dashboard",
            entry_id: entryId,
            command: "list_instances",
            data: {},
        }));
        if (!Array.isArray(res?.instances))
            return undefined;
        return res.instances.map((row) => ({
            entry_id: row.entry_id,
            title: row.title,
            app: asApp(row.app),
        }));
    }
    catch {
        return undefined;
    }
}
/**
 * Bind a card to one config entry.
 * With no instance name, only an entry of `app` is chosen.
 * A named entry of the other app is returned with mismatch set.
 * Entries missing from list_instances count as Radarr.
 */
async function resolveArrEntry(hass, instance, app) {
    const entries = (await hass.callWS({
        type: "config_entries/get",
        domain: "arr_dashboard",
    }));
    const arr = entries.filter((e) => e.domain === "arr_dashboard");
    if (!arr.length)
        return undefined;
    const listed = await fetchInstances(hass, arr[0].entry_id);
    const known = new Map();
    if (listed) {
        for (const row of listed)
            known.set(row.entry_id, asApp(row.app));
    }
    const appOf = (entryId) => listed ? (known.get(entryId) ?? "radarr") : undefined;
    if (!instance) {
        const match = arr.find((entry) => (appOf(entry.entry_id) ?? "radarr") === app);
        if (!match)
            return undefined;
        return { entryId: match.entry_id, app: appOf(match.entry_id) ?? app, mismatch: false };
    }
    const match = arr.find((entry) => entry.entry_id === instance || entry.title === instance);
    if (!match)
        return undefined;
    const listedApp = appOf(match.entry_id);
    if (listedApp && listedApp !== app) {
        return { entryId: match.entry_id, app: listedApp, mismatch: true };
    }
    return { entryId: match.entry_id, app: listedApp, mismatch: false };
}

class ArrCardEditor extends i {
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
    _toggleTab(tab, on) {
        const cur = [
            ...(this._value("tabs") ?? ["add", "downloading", "library", "issues"]),
        ];
        const next = on
            ? [...new Set([...cur, tab])]
            : cur.filter((t) => t !== tab);
        if (next.length)
            this._set("tabs", next);
    }
    get _series() {
        return isSeriesCardType(this._config.type);
    }
    get _product() {
        return this._series ? "Sonarr" : "Radarr";
    }
    _toggleChip(chip, on) {
        const cur = [...(this._value("show_header_chips") ?? [])];
        const next = on
            ? [...new Set([...cur, chip])]
            : cur.filter((c) => c !== chip);
        this._set("show_header_chips", next);
    }
    render() {
        const tabs = this._value("tabs") ?? ["add", "downloading", "library", "issues"];
        const ad = this._value("add_defaults") ?? {};
        const hide = Boolean(this._value("hide_destructive_actions"));
        return b `
      <div class="card-config">
          <h3>General</h3>
          <label>
            Instance
            <input
              .value=${String(this._value("instance") ?? "")}
              @change=${(e) => this._set("instance", e.target.value)}
            />
          </label>
          <label>
            Compact
            <select
              .value=${this._value("compact") === true
            ? "true"
            : this._value("compact") === false
                ? "false"
                : "auto"}
              @change=${(e) => {
            const v = e.target.value;
            this._set("compact", v === "auto" ? "auto" : v === "true");
        }}
            >
              <option value="auto">Auto</option>
              <option value="true">Always</option>
              <option value="false">Never</option>
            </select>
          </label>
          <label>
            Layout
            <select
              .value=${String(this._value("layout") ?? "auto")}
              @change=${(e) => this._set("layout", e.target.value)}
            >
              <option value="auto">Auto</option>
              <option value="phone">Phone</option>
              <option value="tablet">Tablet</option>
            </select>
          </label>
          <label>
            Open ${this._product} URL (status sheet)
            <input
              .value=${String(this._value("external_link") === false
            ? ""
            : this._value("external_link") ?? "")}
              @change=${(e) => {
            const v = e.target.value.trim();
            this._set("external_link", v ? v : false);
        }}
            />
          </label>

          <h3>Tabs</h3>
          <label>
            Default tab
            <select
              .value=${String(this._value("default_tab") ?? "library")}
              @change=${(e) => this._set("default_tab", e.target.value)}
            >
              <option value="library">Library</option>
              <option value="downloading">Downloading</option>
              <option value="add">Add</option>
              <option value="issues">Issues</option>
            </select>
          </label>
          <p>Show tabs:</p>
          ${["add", "downloading", "library", "issues"].map((t) => b `
              <label>
                <input
                  type="checkbox"
                  .checked=${tabs.includes(t)}
                  @change=${(e) => this._toggleTab(t, e.target.checked)}
                />
                ${t}
              </label>
            `)}
          <p>Header chips:</p>
          ${["disk", "queue", "health"].map((c) => b `
              <label>
                <input
                  type="checkbox"
                  .checked=${(this._value("show_header_chips") ?? []).includes(c)}
                  @change=${(e) => this._toggleChip(c, e.target.checked)}
                />
                ${c}
              </label>
            `)}

          <h3>Library</h3>
          <label>
            Upcoming window (days, Add tab)
            <input
              type="number"
              min="1"
              .value=${String(this._value("upcoming_days") ?? 14)}
              @change=${(e) => this._set("upcoming_days", Number(e.target.value))}
            />
          </label>
          <label>
            Recent window (days)
            <input
              type="number"
              min="1"
              .value=${String(this._value("recent_days") ?? 7)}
              @change=${(e) => this._set("recent_days", Number(e.target.value))}
            />
          </label>
          <p class="hint-muted">
            Library is always a poster grid of on-disk ${this._series ? "series" : "movies"}.
          </p>
          <label>
            Default sort
            <select
              .value=${String(this._value("library_sort") ?? "title")}
              @change=${(e) => this._set("library_sort", e.target.value)}
            >
              <option value="title">Title</option>
              <option value="added">Added</option>
              <option value="year">Year</option>
            </select>
          </label>

          <h3>Add defaults</h3>
          <label>
            Quality profile name
            <input
              .value=${String(ad.quality_profile ?? "")}
              @change=${(e) => this._set("add_defaults", {
            ...ad,
            quality_profile: e.target.value,
        })}
            />
          </label>
          <label>
            Root folder path
            <input
              .value=${String(ad.root_folder ?? "")}
              @change=${(e) => this._set("add_defaults", {
            ...ad,
            root_folder: e.target.value,
        })}
            />
          </label>
          ${this._series
            ? b `
                <label>
                  Monitor
                  <select
                    data-field="monitor"
                    .value=${String(ad.monitor ?? "all")}
                    @change=${(e) => {
                const next = e.target.value;
                this._set("add_defaults", {
                    ...ad,
                    monitor: isMonitorMode(next) ? next : "all",
                });
            }}
                  >
                    ${MONITOR_MODES.map((mode) => b `
                        <option value=${mode}>${monitorLabel(mode)}</option>
                      `)}
                  </select>
                </label>
              `
            : b `
                <label>
                  Minimum availability
                  <select
                    .value=${String(ad.minimum_availability ?? "released")}
                    @change=${(e) => this._set("add_defaults", {
                ...ad,
                minimum_availability: e.target
                    .value,
            })}
                  >
                    <option value="announced">Announced</option>
                    <option value="inCinemas">In cinemas</option>
                    <option value="released">Released</option>
                  </select>
                </label>
              `}
          <label>
            <input
              type="checkbox"
              .checked=${ad.search_on_add !== false}
              @change=${(e) => this._set("add_defaults", {
            ...ad,
            search_on_add: e.target.checked,
        })}
            />
            ${this._series
            ? "Search for missing episodes (default for Add series)"
            : "Start searching now (default for Add movie)"}
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
            Hides buttons only. It doesn't change who is allowed to do what in
            ${this._product}.
          </p>
      </div>
    `;
    }
}
__decorate([
    n({ attribute: false })
], ArrCardEditor.prototype, "lovelace", void 0);
__decorate([
    r()
], ArrCardEditor.prototype, "_config", void 0);
defineElement("arr-card-editor", ArrCardEditor);

const LOOKUP_DEBOUNCE_MS = 400;
const LIBRARY_SEARCH_DEBOUNCE_MS = 300;
const RELEASE_CACHE_MS = 5 * 60 * 1000;
function lookupPosterUrl(hit) {
    const images = hit.images;
    if (!Array.isArray(images))
        return "";
    for (const img of images) {
        if (!img || typeof img !== "object")
            continue;
        const rec = img;
        if (rec.coverType === "poster" && typeof rec.remoteUrl === "string") {
            return posterUrlForTile(rec.remoteUrl);
        }
    }
    return "";
}
function lookupComingSoon(hit) {
    const st = String(hit.status ?? hit.statusType ?? "").toLowerCase();
    return st.includes("cinemas") || st.includes("announced");
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
class ArrDashboardCard extends i {
    constructor() {
        super(...arguments);
        this.app = "radarr";
        this._mismatch = false;
        this._tab = "library";
        this._loading = true;
        this._confirm = null;
        this._confirmBusy = false;
        this._addQuery = "";
        this._addPhase = "start";
        this._lookupResults = [];
        this._addError = "";
        this._addSheetOpen = false;
        this._addSearchOn = true;
        this._addMonitored = true;
        this._addMinAvail = "released";
        this._addBusy = false;
        this._librarySearch = "";
        this._librarySort = "title";
        this._libraryItems = [];
        this._libraryTotal = 0;
        this._libraryLoading = false;
        this._libraryLoadingMore = false;
        this._addUpcoming = [];
        this._upcomingEpisodes = [];
        this._addRecent = [];
        this._addMonitor = "all";
        this._lookupLib = {};
        this._queuePosters = {};
        this._compact = false;
        this._hostWidth = 0;
        this._statusOpen = false;
        this._failureDetail = "";
        this._qualityOpen = false;
        this._qualitySearch = true;
        this._episodes = [];
        this._episodesLoading = false;
        this._releases = [];
        this._showRejected = false;
        this._releaseBusy = false;
        this._releaseSort = "match";
        this._exitingQueueIds = [];
        this._qualityBusy = false;
        this._searchAgainBusy = false;
        this._grabOkScreen = false;
        this._libraryLoadGen = 0;
        this._failCount = 0;
        this._releaseCache = new Map();
        this._lastFullRefresh = 0;
        this._pageVisible = true;
        this._fullRefreshMs = 5 * 60 * 1000;
        this._libraryRowRender = (startIndex, count) => {
            const nodes = [];
            for (let i = 0; i < count; i++) {
                const m = this._libraryItems[startIndex + i];
                if (m)
                    nodes.push(this._libraryItem(m));
            }
            return nodes;
        };
    }
    get _profile() {
        return profileFor(this.app);
    }
    setConfig(config) {
        if (!config.type) {
            throw new Error("Invalid configuration");
        }
        const prevInstance = this.config?.instance;
        const profile = this._profile;
        this.config = {
            title: profile.defaultTitle,
            icon: profile.defaultIcon,
            tabs: ["add", "downloading", "library", "issues"],
            default_tab: "library",
            compact: "auto",
            layout: "auto",
            show_header_chips: [],
            hide_destructive_actions: false,
            add_defaults: { search_on_add: true },
            upcoming_days: 14,
            recent_days: 7,
            library_sort: "title",
            library_filter: "downloaded",
            external_link: false,
            ...config,
            type: config.type || profile.cardType,
        };
        this._tab = this.config.default_tab ?? "library";
        this._librarySort = this.config.library_sort ?? "title";
        const ad = this.config.add_defaults ?? {};
        this._addSearchOn = ad.search_on_add !== false;
        this._addMinAvail = ad.minimum_availability ?? "released";
        this._addMonitor = isMonitorMode(ad.monitor) ? ad.monitor : "all";
        if (this.hass && this.isConnected && prevInstance !== this.config.instance) {
            this._mismatch = false;
            this._configError = undefined;
            void this._bootstrap();
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this._ro = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect.width ?? 400;
            const compactCfg = this.config?.compact ?? "auto";
            this._compact =
                compactCfg === true || (compactCfg === "auto" && w < 340);
            const next = Math.round(w);
            if (next !== this._hostWidth)
                this._hostWidth = next;
        });
        this._ro.observe(this);
    }
    firstUpdated() {
        void this._bootstrap();
        this._onVisibility = () => {
            this._pageVisible = document.visibilityState !== "hidden";
            if (this._pageVisible)
                void this._refresh();
        };
        document.addEventListener("visibilitychange", this._onVisibility);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._ro?.disconnect();
        if (this._refreshTimer)
            clearInterval(this._refreshTimer);
        if (this._lookupTimer)
            clearTimeout(this._lookupTimer);
        if (this._librarySearchTimer)
            clearTimeout(this._librarySearchTimer);
        this._teardownLibrarySentinel();
        if (this._onVisibility) {
            document.removeEventListener("visibilitychange", this._onVisibility);
        }
    }
    updated(changed) {
        if (changed.has("_tab") &&
            this._tab !== "library" &&
            (this._selectedMovie || this._manualMovieId)) {
            this._closeMovieDetail();
        }
        if (this._tab === "library" &&
            (changed.has("_libraryItems") ||
                changed.has("_libraryTotal") ||
                changed.has("_tab"))) {
            void this.updateComplete.then(() => this._setupLibrarySentinel());
        }
        else if (changed.has("_tab") && this._tab !== "library") {
            this._teardownLibrarySentinel();
        }
    }
    /** Explicit app on get_state wins. Otherwise list_instances, then missing means Radarr. */
    _stateAppMismatch(data) {
        if (data.app === "sonarr" || data.app === "radarr") {
            return data.app !== this.app;
        }
        if (this._listedApp)
            return this._listedApp !== this.app;
        return this.app !== "radarr";
    }
    async _bootstrap() {
        if (!this.hass)
            return;
        try {
            const resolved = await resolveArrEntry(this.hass, this.config?.instance, this.app);
            if (!resolved) {
                this._configError = `No ${this._profile.product} instance called "${this.config.instance ?? ""}".`;
                this._loading = false;
                return;
            }
            this._entryId = resolved.entryId;
            this._listedApp = resolved.app;
            if (resolved.mismatch) {
                this._mismatch = true;
                this._state = undefined;
                this._libraryItems = [];
                this._loading = false;
                return;
            }
            this._mismatch = false;
            await this._refresh();
            this._schedulePoll();
        }
        catch {
            this._configError = `${this._profile.defaultTitle} card can't start. Check the Arr integration in Settings.`;
            this._loading = false;
        }
    }
    _schedulePoll() {
        if (this._refreshTimer)
            clearInterval(this._refreshTimer);
        const ms = this._tab === "downloading" ? 5000 : 30000;
        this._refreshTimer = setInterval(() => {
            if (!this._pageVisible)
                return;
            void this._refresh();
        }, ms);
    }
    async _refresh() {
        if (!this._entryId || !this.hass || !this._pageVisible)
            return;
        const queueOnly = this._tab === "downloading" &&
            Date.now() - this._lastFullRefresh < this._fullRefreshMs;
        try {
            const scope = queueOnly ? "queue" : "core";
            const data = (await callArr(this.hass, this._entryId, "get_state", {
                scope,
            }));
            if (this._stateAppMismatch(data)) {
                this._mismatch = true;
                this._state = undefined;
                this._libraryItems = [];
                return;
            }
            this._mismatch = false;
            const wasOff = this._offline;
            if (queueOnly && this._state) {
                this._state = {
                    ...this._state,
                    reachable: data.reachable,
                    queue: data.queue,
                    queue_count: data.queue_count,
                    health: data.health,
                    disk_space: data.disk_space,
                    last_success: data.last_success,
                };
            }
            else {
                const prevRev = this._state?.library_revision;
                this._state = { ...data };
                this._lastFullRefresh = Date.now();
                if (data.library_revision &&
                    data.library_revision !== prevRev &&
                    this._tab === "library") {
                    void this._resetLibrary();
                }
                if (this._tab === "add") {
                    void this._loadAddUpcoming();
                }
            }
            this._failCount = 0;
            if (!data.reachable)
                this._failCount = 3;
            if (wasOff && !this._offline) {
                showToast(this, toastRadarrBack());
            }
        }
        catch {
            this._failCount += 1;
        }
        finally {
            this._loading = false;
            if (this._tab === "library" &&
                !this._libraryItems.length &&
                !this._libraryLoading) {
                void this._resetLibrary();
            }
            void this._hydrateQueuePosters();
        }
    }
    async _signMoviePosters(movies) {
        if (!this.hass)
            return;
        await Promise.all(movies.map(async (m) => {
            const url = m.posterUrl;
            if (url?.startsWith("/api/arr_dashboard")) {
                m.posterUrl = await signPosterPath(this.hass, url);
            }
        }));
    }
    _queueMediaId(row) {
        switch (this.app) {
            case "sonarr":
                return row.series?.id;
            case "radarr":
                return row.movie?.id;
            default: {
                const _never = this.app;
                return _never;
            }
        }
    }
    _queueTitle(row) {
        switch (this.app) {
            case "sonarr": {
                const series = row.series?.title ?? row.title ?? "Download";
                const episodeNumber = row.episode?.episodeNumber ?? row.episodeNumber;
                const code = episodeCode(row.seasonNumber, episodeNumber);
                const episodeTitle = row.episode?.title;
                return [series, code, episodeTitle].filter((part) => part).join(" · ");
            }
            case "radarr":
                return row.movie?.title ?? row.title ?? "Download";
            default: {
                const _never = this.app;
                return _never;
            }
        }
    }
    _queuePosterPath(row) {
        const mediaId = this._queueMediaId(row);
        if (!mediaId || !this._entryId)
            return "";
        return `/api/arr_dashboard/${this._entryId}/poster/${mediaId}`;
    }
    async _hydrateQueuePosters() {
        if (!this.hass || !this._entryId)
            return;
        const rows = this._queueRecords();
        const next = { ...this._queuePosters };
        let changed = false;
        await Promise.all(rows.map(async (row) => {
            const movieId = this._queueMediaId(row);
            if (!movieId || next[movieId])
                return;
            const path = this._queuePosterPath(row);
            if (!path)
                return;
            next[movieId] = path.startsWith("/api/arr_dashboard")
                ? await signPosterPath(this.hass, path)
                : path;
            changed = true;
        }));
        if (changed)
            this._queuePosters = next;
    }
    /** UI-only; the integration still accepts every websocket command (§2.2). */
    get _hideDestructive() {
        return Boolean(this.config.hide_destructive_actions);
    }
    get _offline() {
        return this._failCount >= 3 || this._state?.reachable === false;
    }
    get _posterColumns() {
        const width = this._hostWidth || 900;
        return Math.max(2, Math.min(6, Math.floor(width / 170)));
    }
    get _layoutTablet() {
        const cfg = this.config ?? {};
        return cfg.layout === "tablet" || (cfg.layout === "auto" && !this._compact);
    }
    /** Side-by-side details only fit once the card is wider than a phone. */
    get _mobileDetail() {
        return (this._hostWidth || 900) < 680;
    }
    async _ws(command, data) {
        if (!this._entryId || !this.hass)
            throw new Error("No instance");
        return callArr(this.hass, this._entryId, command, data);
    }
    _closeMovieDetail() {
        this._selectedMovie = undefined;
        this._detailExtra = undefined;
        this._qualityOpen = false;
        this._manualMovieId = undefined;
    }
    _switchTab(tab) {
        const prev = this._tab;
        this._tab = tab;
        if (tab !== prev) {
            this._closeMovieDetail();
        }
        if (tab === "library") {
            void this._resetLibrary();
        }
        if (tab === "add") {
            void this._loadAddUpcoming();
        }
        this._schedulePoll();
    }
    get _libraryColumns() {
        return libraryPosterColumns(this._hostWidth || 900);
    }
    _libraryPageLimit() {
        return Math.max(24, this._libraryColumns * 8);
    }
    get _posterRowHeight() {
        const width = this._hostWidth || 900;
        return libraryPosterRowHeight(width, this._libraryColumns);
    }
    async _resetLibrary() {
        if (!this._entryId || !this.hass)
            return;
        const gen = ++this._libraryLoadGen;
        this._libraryLoading = true;
        try {
            const page = (await this._ws("library_page", {
                offset: 0,
                limit: this._libraryPageLimit(),
                sort: this._librarySort,
                search: this._librarySearch,
            }));
            if (gen !== this._libraryLoadGen)
                return;
            await this._signMoviePosters(page.items);
            if (gen !== this._libraryLoadGen)
                return;
            this._libraryItems = page.items;
            this._libraryTotal = page.total;
        }
        finally {
            if (gen === this._libraryLoadGen)
                this._libraryLoading = false;
        }
    }
    async _loadMoreLibrary() {
        if (!this._entryId ||
            this._libraryLoadingMore ||
            this._libraryLoading ||
            this._libraryItems.length >= this._libraryTotal) {
            return;
        }
        this._libraryLoadingMore = true;
        const offset = this._libraryItems.length;
        try {
            const page = (await this._ws("library_page", {
                offset,
                limit: this._libraryPageLimit(),
                sort: this._librarySort,
                search: this._librarySearch,
            }));
            await this._signMoviePosters(page.items);
            this._libraryItems = [...this._libraryItems, ...page.items];
            this._libraryTotal = page.total;
        }
        finally {
            this._libraryLoadingMore = false;
        }
    }
    _onLibraryScroll(e) {
        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 240) {
            void this._loadMoreLibrary();
        }
    }
    _teardownLibrarySentinel() {
        this._librarySentinelIo?.disconnect();
        this._librarySentinelIo = undefined;
    }
    /** Load more when the list grows with the card (masonry / sections views). */
    _setupLibrarySentinel() {
        this._teardownLibrarySentinel();
        if (this._tab !== "library" || this._libraryItems.length >= this._libraryTotal) {
            return;
        }
        const sentinel = this.renderRoot.querySelector("[data-library-sentinel]");
        if (!sentinel || typeof IntersectionObserver === "undefined") {
            return;
        }
        this._librarySentinelIo = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                void this._loadMoreLibrary();
            }
        }, { root: null, rootMargin: "320px" });
        this._librarySentinelIo.observe(sentinel);
    }
    async _loadAddUpcoming() {
        if (!this._entryId)
            return;
        try {
            const res = (await this._ws("library_upcoming", {
                days: this.config.upcoming_days ?? 30,
            }));
            if (this.app === "sonarr") {
                this._upcomingEpisodes = (res.items ?? []);
                this._addUpcoming = [];
                await this._loadRecentSeries();
            }
            else {
                const movies = (res.items ?? []);
                await this._signMoviePosters(movies);
                this._addUpcoming = movies;
                this._upcomingEpisodes = [];
                this._addRecent = [];
            }
        }
        catch {
            this._addUpcoming = [];
            this._upcomingEpisodes = [];
            this._addRecent = [];
        }
    }
    async _loadRecentSeries() {
        const full = (await this._ws("get_state", { scope: "full" }));
        const items = full.series ?? [];
        const days = this.config.recent_days ?? 7;
        const since = Date.now() - days * 86400000;
        const recent = items
            .filter((item) => {
            if (!item.added)
                return false;
            return new Date(item.added).getTime() >= since;
        })
            .sort((a, b) => (b.added ?? "").localeCompare(a.added ?? ""))
            .slice(0, 12);
        await this._signMoviePosters(recent);
        this._addRecent = recent;
    }
    async _refreshLookupLibraryFlags() {
        if (!this._entryId || !this._lookupResults.length) {
            this._lookupLib = {};
            return;
        }
        const next = {};
        await Promise.all(this._lookupResults.map(async (r) => {
            const key = this._lookupLibKey(r);
            if (this.app === "sonarr") {
                const res = (await this._ws("library_match", {
                    tvdbId: r.tvdbId,
                    title: r.title,
                    year: r.year,
                }));
                if (res.series)
                    next[key] = res.series;
            }
            else {
                const res = (await this._ws("library_match", {
                    tmdbId: r.tmdbId,
                    title: r.title,
                    year: r.year,
                }));
                if (res.movie)
                    next[key] = res.movie;
            }
        }));
        this._lookupLib = next;
    }
    _lookupLibKey(r) {
        if (this.app === "sonarr") {
            return String(r.tvdbId ?? `${String(r.title)}-${String(r.year ?? "")}`);
        }
        return String(r.tmdbId ?? `${String(r.title)}-${String(r.year ?? "")}`);
    }
    _queueRecords() {
        const rec = this._state?.queue?.records ?? [];
        return [...rec].sort((a, b) => {
            const aw = queueNeedsAttention(a) ? 0 : 1;
            const bw = queueNeedsAttention(b) ? 0 : 1;
            return aw - bw;
        });
    }
    _scheduleLookup(_force = false) {
        if (this._lookupTimer)
            clearTimeout(this._lookupTimer);
        const q = this._addQuery.trim();
        if (q.length < 2) {
            this._addPhase = "start";
            this._lookupResults = [];
            this._lookupLib = {};
            this._addError = "";
            return;
        }
        this._addPhase = "searching";
        this._lookupTimer = setTimeout(() => void this._doLookup(), LOOKUP_DEBOUNCE_MS);
    }
    async _doLookup() {
        const q = this._addQuery.trim();
        if (q.length < 2)
            return;
        try {
            const res = (await this._ws("lookup", { term: q }));
            this._lookupResults = res.results?.slice(0, 25) ?? [];
            this._addPhase = this._lookupResults.length ? "results" : "no_results";
            this._addError = "";
            await this._refreshLookupLibraryFlags();
        }
        catch (err) {
            this._addPhase = "error";
            this._addError = err instanceof Error ? err.message : String(err);
        }
    }
    _openAddSheet(hit) {
        const profiles = this._state?.quality_profiles ?? [];
        const roots = this._state?.root_folders ?? [];
        const defaults = this.config.add_defaults ?? {};
        const profile = profiles.find((p) => p.name === defaults.quality_profile) ??
            profiles[0];
        const root = roots.find((f) => f.path === defaults.root_folder) ?? roots[0];
        this._addPick = hit;
        this._addProfileId = profile?.id;
        this._addRootPath = root?.path;
        this._addSearchOn = defaults.search_on_add !== false;
        this._addMonitored = true;
        this._addMinAvail = defaults.minimum_availability ?? "released";
        this._addMonitor = isMonitorMode(defaults.monitor) ? defaults.monitor : "all";
        this._addSheetOpen = true;
        this._addPhase = "sheet";
    }
    async _confirmAddMovie() {
        if (!this._addPick)
            return;
        this._addBusy = true;
        try {
            const r = this._addPick;
            if (this.app === "sonarr") {
                await this._ws(this._profile.commands.add, {
                    title: r.title,
                    year: r.year,
                    tvdbId: r.tvdbId,
                    imdbId: r.imdbId,
                    quality_profile_id: this._addProfileId,
                    root_folder_path: this._addRootPath,
                    search_on_add: this._addSearchOn,
                    monitor: this._addMonitor,
                });
            }
            else {
                await this._ws(this._profile.commands.add, {
                    title: r.title,
                    year: r.year,
                    tmdbId: r.tmdbId,
                    imdbId: r.imdbId,
                    quality_profile_id: this._addProfileId,
                    root_folder_path: this._addRootPath,
                    search_on_add: this._addSearchOn,
                    monitored: this._addMonitored,
                    minimum_availability: this._addMinAvail,
                });
            }
            showToast(this, toastAdded(String(r.title), this._addSearchOn));
            this._addSheetOpen = false;
            this._addPick = undefined;
            this._addPhase = "added";
            this._addQuery = "";
            this._lookupResults = [];
            await this._refresh();
        }
        catch (err) {
            this._fail(this._profile.commands.add, err);
        }
        finally {
            this._addBusy = false;
        }
    }
    async _openMovieDetail(m) {
        this._selectedMovie = m;
        try {
            if (this.app === "sonarr") {
                const res = (await this._ws(this._profile.commands.get, {
                    series_id: m.id,
                }));
                this._detailExtra = {
                    ...(res.series ?? {}),
                    seasons: res.seasons ?? res.series?.seasons ?? [],
                    grabbed_history: res.grabbed_history ?? [],
                };
                return;
            }
            const res = (await this._ws(this._profile.commands.get, {
                movie_id: m.id,
            }));
            this._detailExtra = {
                ...res.movie,
                grabbed_history: res.grabbed_history ?? [],
            };
        }
        catch {
            this._detailExtra = undefined;
        }
    }
    async _loadReleases(movieId, force = false) {
        const cached = this._releaseCache.get(movieId);
        const now = Date.now();
        if (!force && cached && now - cached.at < RELEASE_CACHE_MS) {
            this._releases = cached.releases;
            return;
        }
        this._manualMovieId = movieId;
        this._releaseBusy = true;
        try {
            const res = (await this._ws("release_search", {
                [this._profile.idField]: movieId,
            }));
            const releases = res.releases ?? [];
            this._releaseCache.set(movieId, { at: now, releases });
            this._releases = releases;
        }
        catch (err) {
            this._fail("release_search", err);
            this._releases = [];
        }
        finally {
            this._releaseBusy = false;
        }
    }
    async _loadEpisodeReleases(episodeId) {
        this._releaseBusy = true;
        try {
            const res = (await this._ws("release_search", {
                episode_id: episodeId,
            }));
            const releases = res.releases ?? [];
            this._releaseCache.set(episodeId, { at: Date.now(), releases });
            this._releases = releases;
        }
        catch (err) {
            this._fail("release_search", err);
            this._releases = [];
        }
        finally {
            this._releaseBusy = false;
        }
    }
    render() {
        if (this._configError) {
            return b `
        <ha-card data-screen="G03">
          <p><strong>${this._profile.defaultTitle} card can't start</strong></p>
          <p>${this._configError}</p>
        </ha-card>
      `;
        }
        if (this._mismatch) {
            const other = this.app === "sonarr" ? "Radarr" : "Sonarr";
            return b `
        <ha-card data-screen="G03" data-mismatch="true">
          <p><strong>Wrong instance</strong></p>
          <p>
            This ${this._profile.nounTitle} card is pointed at ${other}. Choose a
            ${this._profile.product} instance.
          </p>
        </ha-card>
      `;
        }
        const cfg = this.config ?? {};
        const tabs = cfg.tabs ?? ["add", "downloading", "library"];
        const showTabBar = tabs.length > 1;
        const queueCount = this._state?.queue_count ?? 0;
        const failedInQueue = this._queueRecords().some((r) => (r.status || "").toLowerCase() === "failed");
        const healthCount = this._state?.health?.length ?? 0;
        const sideDetail = this._layoutTablet &&
            !this._mobileDetail &&
            Boolean(this._selectedMovie) &&
            this._tab === "library";
        return b `
      <ha-card
        data-screen=${o$1(this._compact ? "G04" : undefined)}
        class="${this._compact ? "compact" : ""} ${this._layoutTablet
            ? "layout-tablet"
            : ""} ${sideDetail ? "with-side-panel" : ""}"
      >
        ${this._headerChips().length
            ? b `<div class="header">
              <div class="chips">${this._renderChips()}</div>
            </div>`
            : A}

        ${showTabBar
            ? this._renderTabs(tabs, queueCount, failedInQueue, healthCount)
            : A}

        ${this._offline ? this._renderOfflineBanner() : A}

        <div class="${this._offline ? "offline-dim" : ""} layout-body">
          <div class="main-pane">
            ${this._tab === "library" ? this._renderLibrary() : A}
            ${this._tab === "downloading" ? this._renderDownloading() : A}
            ${this._tab === "add" ? this._renderAdd() : A}
            ${this._tab === "issues" ? this._renderIssues() : A}
          </div>
          ${sideDetail ? this._renderDetailPanel() : A}
        </div>

        ${!sideDetail && this._tab === "library" && this._selectedMovie
            ? this._renderDetailDialog()
            : A}
        ${this._manualMovieId ? this._renderManualSearch() : A}
        ${this._grabOkScreen
            ? b `<span hidden data-screen="M07" aria-hidden="true"></span>`
            : A}

        ${renderStatusSheet(this._statusOpen, this._state?.health ?? [], this._state?.disk_space ?? [], cfg, () => (this._statusOpen = false), this._profile.product)}
        ${renderFailureSheet("Failure details", this._failureDetail, () => (this._failureDetail = ""))}
        ${renderAddSheet(this._addSheetOpen, this._layoutTablet, this._addPick, this._state?.quality_profiles ?? [], this._state?.root_folders ?? [], this._addProfileId, this._addRootPath, this._addSearchOn, this._addMonitored, this._addMinAvail, this._addBusy, this._offline, (id) => (this._addProfileId = id), (path) => (this._addRootPath = path), (v) => (this._addSearchOn = v), (v) => (this._addMonitored = v), (v) => (this._addMinAvail = v), () => {
            this._addSheetOpen = false;
            this._addPhase = "results";
        }, () => void this._confirmAddMovie(), this.app, this._addMonitor, (mode) => (this._addMonitor = mode))}
        ${renderQualitySheet(this._qualityOpen, this._selectedMovie?.title, this._selectedMovie?.year, this._state?.quality_profiles ?? [], this._selectedMovie?.qualityProfileId, this._qualityPendingId, this._qualitySearch, this._qualityBusy, (v) => (this._qualitySearch = v), (id) => (this._qualityPendingId = id), () => void this._saveQualityProfile(), () => (this._qualityOpen = false))}
        ${this._queueOverflow
            ? renderQueueOverflowSheet(true, this._queueTitle(this._queueOverflow), this.app === "sonarr" ? undefined : this._queueOverflow.movie?.year, this._hideDestructive, this._offline, () => (this._queueOverflow = undefined), () => {
                const row = this._queueOverflow;
                this._queueOverflow = undefined;
                if (row) {
                    this._openConfirm("d04b", {
                        title: this._queueTitle(row),
                        queue_id: row.id,
                    });
                }
            }, () => {
                const row = this._queueOverflow;
                this._queueOverflow = undefined;
                if (row) {
                    this._openConfirm("d04", {
                        title: this._queueTitle(row),
                        year: this.app === "sonarr" ? undefined : row.movie?.year,
                        queue_id: row.id,
                    });
                }
            })
            : A}
        ${renderConfirmDialog(this._confirm, this._confirmBusy, this._layoutTablet, () => (this._confirm = null), () => void this._runConfirm(), (v) => {
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
        }, (v) => {
            if (this._confirm)
                this._confirm = { ...this._confirm, addImportExclusion: v };
        }, { product: this._profile.product, noun: this._profile.noun })}
        <div class="live-region" aria-live="polite"></div>
      </ha-card>
    `;
    }
    _renderTabs(tabs, queueCount, failedInQueue, healthCount) {
        return b `
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
                : t === "issues"
                    ? "Issues"
                    : "Library"}
              ${t === "downloading" && queueCount > 0
            ? b `
                    <span class="badge ${failedInQueue ? "error" : "warn"}"
                      >${queueCount}</span
                    >
                  `
            : A}
              ${t === "issues" && (healthCount > 0 || this._offline)
            ? b `
                    <span class="badge ${this._offline ? "error" : "warn"}"
                      >${this._offline ? "!" : healthCount}</span
                    >
                  `
            : A}
            </button>
          `)}
      </div>
    `;
    }
    _headerChips() {
        return this.config.show_header_chips ?? [];
    }
    _renderOfflineBanner() {
        const last = this._state?.last_success;
        const screen = this._layoutTablet ? "G01T" : "G01";
        return b `
      <div class="banner" role="alert" data-screen=${screen}>
        <strong>Can't reach ${this._profile.product}.</strong> Showing data from ${last ? formatRelative(last) : "cache"}.
        Actions are off until it's back. Retrying every 30 s.
        <button class="text" @click=${() => void this._refresh()}>Retry</button>
        <button class="text" @click=${() => this._switchTab("issues")}>
          Issues
        </button>
      </div>
    `;
    }
    _renderChips() {
        const chips = this._headerChips();
        const disk = this._state?.disk_space?.[0];
        const freeGb = disk ? (disk.freeSpace / 1e9).toFixed(1) : "—";
        const healthBad = (this._state?.health?.length ?? 0) > 0;
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
            ? b `<button
            class="chip chip-button"
            @click=${() => (this._statusOpen = true)}
          >
            <ha-icon
              icon="${this._offline
                ? "mdi:lan-disconnect"
                : healthBad
                    ? "mdi:heart-broken"
                    : "mdi:heart-pulse"}"
            ></ha-icon>
            ${this._offline ? "Offline" : healthBad ? "Issues" : "Healthy"}
          </button>`
            : A}
    `;
    }
    _renderLibrary() {
        if (this._loading || (this._libraryLoading && !this._libraryItems.length)) {
            return b `<div data-screen="L04" class="skeleton-block"></div>`;
        }
        return b `
      <div data-screen="L01" class="library-pane">
        <input
          class="search-field"
          placeholder="Search your library"
          aria-label="Search your library"
          .value=${this._librarySearch}
          @input=${(e) => {
            this._librarySearch = e.target.value;
            if (this._librarySearchTimer) {
                clearTimeout(this._librarySearchTimer);
            }
            this._librarySearchTimer = setTimeout(() => void this._resetLibrary(), LIBRARY_SEARCH_DEBOUNCE_MS);
        }}
        />
        <div class="chip-row library-toolbar" role="toolbar" aria-label="Library sort">
          <select
            class="sort-select"
            aria-label="Sort"
            .value=${this._librarySort}
            @change=${(e) => {
            this._librarySort = e.target
                .value;
            void this._resetLibrary();
        }}
          >
            <option value="title">Title</option>
            <option value="added">Added</option>
            <option value="year">Year</option>
          </select>
        </div>

        <div class="library-scroll">
          ${this._libraryItems.length
            ? b `
                <arr-virtual-list
                  data-screen="L05"
                  class="library-virtual"
                  style="--arr-cols: ${this._libraryColumns}; --arr-virtual-height: 100%"
                  .itemCount=${this._libraryItems.length}
                  .columns=${this._libraryColumns}
                  .itemHeight=${this._posterRowHeight}
                  rowClass="poster-grid"
                  .contentKey=${this._libraryItems}
                  .renderRow=${this._libraryRowRender}
                  @scroll=${this._onLibraryScroll}
                ></arr-virtual-list>
              `
            : b `<p>No ${this._profile.plural} match your filters.</p>`}
          ${this._libraryItems.length < this._libraryTotal
            ? b `<div data-library-sentinel class="library-load-sentinel"></div>`
            : A}
          ${this._libraryLoadingMore
            ? b `<p class="hint-muted">Loading more…</p>`
            : A}
        </div>
      </div>
    `;
    }
    _libraryTile(m) {
        return b `
      <button
        class="poster-btn small"
        @click=${() => void this._openMovieDetail(m)}
      >
        <img
          src=${posterUrlForTile(m.posterUrl)}
          alt=""
          loading="lazy"
        />
        <span class="poster-caption">
          ${m.title}
          ${this.app === "sonarr"
            ? b `<span class="poster-status"
                >${this._seriesCaption(m)}</span
              >`
            : A}
        </span>
      </button>
    `;
    }
    _seriesCaption(series) {
        const run = seriesRunLabel(series.status);
        return [series.year, run].filter((part) => part).join(" · ");
    }
    _libraryItem(m) {
        return b `
      <button
        class="poster-btn"
        role="listitem"
        aria-label=${m.title ?? this._profile.nounTitle}
        @click=${() => void this._openMovieDetail(m)}
      >
        <img
          src=${posterUrlForTile(m.posterUrl)}
          alt=""
          loading="lazy"
        />
        <span class="poster-caption">
          ${m.title}
          ${this.app === "sonarr"
            ? b `<span class="poster-status"
                >${this._seriesCaption(m)}</span
              >`
            : A}
        </span>
      </button>
    `;
    }
    _renderIssues() {
        if (this._loading) {
            return b `<div data-screen="I02" class="skeleton-block"></div>`;
        }
        return renderIssuesPanel(this._state?.health ?? [], this._state?.disk_space ?? [], this.config, this._offline, this._profile.product);
    }
    _renderDownloading() {
        if (this._loading && !this._state?.queue) {
            return b `<div data-screen="D05" class="skeleton-block"></div>`;
        }
        const rows = this._queueRecords();
        if (!rows.length) {
            return b `
        <div data-screen="D02" class="download-empty">
          <p>
            <ha-icon icon="mdi:check-circle"></ha-icon> Nothing downloading
          </p>
          <p class="hint-muted">
            Active downloads will appear here as poster tiles.
          </p>
        </div>
      `;
        }
        const listScreen = this._layoutTablet ? "D01T" : "D01";
        return b `
      <div data-screen=${listScreen} class="download-pane">
        <div class="download-scroll">
          <div
            class="download-grid"
            style="--arr-cols: ${this._posterColumns}"
            role="list"
          >
            ${rows.map((row) => this._renderQueueTile(row))}
          </div>
        </div>
      </div>
    `;
    }
    _renderQueueTile(row) {
        const title = this._queueTitle(row);
        const failed = (row.status || "").toLowerCase() === "failed";
        const importAttn = (row.trackedDownloadStatus || "")
            .toLowerCase()
            .includes("import");
        const hide = this._hideDestructive;
        const pct = queueProgress(row);
        const exiting = this._exitingQueueIds.includes(row.id);
        const movieId = this._queueMediaId(row);
        const poster = movieId ? this._queuePosters[movieId] ?? "" : "";
        const metaLine = [
            row.quality?.quality?.name,
            row.size ? formatBytes(row.size) : "",
            row.timeleft,
        ]
            .filter(Boolean)
            .join(" · ");
        return b `
      <article
        class="queue-tile ${failed ? "attention" : importAttn ? "attention warn" : ""} ${exiting ? "exiting" : ""}"
        role="listitem"
        data-screen=${exiting ? "D06" : A}
        aria-label=${`${title}, ${queueStatusLabel(row)}`}
      >
        <div class="queue-tile-poster">
          <img src=${poster} alt="" loading="lazy" />
          <div
            class="queue-tile-progress"
            role="progressbar"
            aria-valuenow=${pct}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="${title} progress"
          >
            <div class="progress-fill" style="width: ${pct}%"></div>
          </div>
          <span class="queue-tile-status pill ${failed ? "failed" : ""}"
            >${queueStatusLabel(row)}</span
          >
          <div class="queue-tile-label">
            <p class="queue-tile-title">${title}</p>
            ${metaLine
            ? b `<p class="queue-tile-meta">${metaLine}</p>`
            : A}
          </div>
          ${!hide
            ? b `<button
                class="queue-tile-overflow"
                aria-label="More actions for ${title}"
                data-screen="D03"
                @click=${() => (this._queueOverflow = row)}
              >
                ⋮
              </button>`
            : A}
        </div>
        ${(!hide && failed) ||
            (hide && queueNeedsAttention(row)) ||
            (importAttn && row.outputPath)
            ? b `<div class="queue-tile-actions">
              ${!hide && failed
                ? b `<button
                    class="tile-action tile-action--danger tile-action--muted"
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
              ${hide && queueNeedsAttention(row)
                ? b `<p class="hint-muted" data-screen="D07T">
                    <ha-icon icon="mdi:information-outline"></ha-icon>
                    Removing is turned off on this dashboard.
                  </p>`
                : A}
              ${importAttn && row.outputPath
                ? b `<button
                    class="primary compact"
                    data-action="retry-import"
                    ?disabled=${this._offline}
                    @click=${() => void this._retryImport(row)}
                  >
                    Retry import
                  </button>`
                : A}
            </div>`
            : A}
      </article>
    `;
    }
    _renderAdd() {
        const screen = this._addPhase === "added"
            ? "A05"
            : this._addPhase === "searching"
                ? "A02"
                : this._addPhase === "results"
                    ? this._layoutTablet
                        ? "A03T"
                        : "A03"
                    : this._addPhase === "no_results"
                        ? "A06"
                        : this._addPhase === "error"
                            ? "A07"
                            : "A01";
        const libraryUpcoming = this._addPhase === "start" && !this._addQuery.trim()
            ? this._addUpcoming
            : [];
        return b `
      <svg width="0" height="0" aria-hidden="true"></svg>
      <div data-screen=${screen} class="add-pane">
        <input
          class="search-field"
          placeholder="Search for a ${this._profile.noun} to add"
          aria-label="Search for a ${this._profile.noun} to add"
          ?disabled=${this._offline}
          .value=${this._addQuery}
          @input=${(e) => {
            this._addQuery = e.target.value;
            this._scheduleLookup();
        }}
        />
        ${this.app === "sonarr" &&
            this._addPhase === "start" &&
            !this._addQuery.trim() &&
            this._upcomingEpisodes.length
            ? b `
              <section data-screen="A01" class="row-section">
                <h3>Upcoming</h3>
                <div class="episode-list">
                  ${this._upcomingEpisodes.map((ep) => {
                const code = episodeCode(ep.seasonNumber, ep.episodeNumber);
                const label = [ep.seriesTitle, code, ep.title]
                    .filter((part) => part)
                    .join(" · ");
                return b `
                      <div class="episode-row">
                        <span>${label}</span>
                        <span class="episode-when"
                          >${formatAirDate(ep.airDateUtc)}</span
                        >
                      </div>
                    `;
            })}
                </div>
              </section>
            `
            : A}
        ${this.app === "sonarr" &&
            this._addPhase === "start" &&
            !this._addQuery.trim() &&
            this._addRecent.length
            ? b `
              <section class="row-section" data-row="recent">
                <h3>Recently added</h3>
                <div
                  class="coming-grid"
                  style="--arr-cols: ${this._libraryColumns}"
                >
                  ${this._addRecent.map((series) => this._libraryTile(series))}
                </div>
              </section>
            `
            : A}
        ${this.app !== "sonarr" && libraryUpcoming.length
            ? b `
              <section data-screen="A01" class="row-section">
                <h3>Coming soon in your library</h3>
                <div
                  class="coming-grid"
                  style="--arr-cols: ${this._libraryColumns}"
                >
                  ${libraryUpcoming.map((m) => this._libraryTile(m))}
                </div>
              </section>
            `
            : A}
        ${this._addPhase === "searching"
            ? b `<div
              class="lookup-grid lookup-skeleton"
              style="--arr-cols: ${this._libraryColumns}"
              aria-busy="true"
            >
              ${[0, 1, 2, 3, 4, 5].map(() => b `<div class="lookup-card skeleton-poster"></div>`)}
            </div>`
            : A}
        ${this._addPhase === "no_results"
            ? b `
              <p>No ${this._profile.plural} found for “${this._addQuery}”</p>
              <p class="hint-muted">
                Check the spelling, or try the original title or the year.
              </p>
            `
            : A}
        ${this._addPhase === "error"
            ? b `
              <p><strong>Search didn't work</strong></p>
              <p class="error-text">${this._addError}</p>
              <button class="primary" @click=${() => this._scheduleLookup(true)}>
                Try again
              </button>
            `
            : A}
        ${this._lookupResults.length && this._addPhase !== "searching"
            ? b `
              <div
                class="lookup-grid"
                role="list"
                style="--arr-cols: ${this._libraryColumns}"
              >
                ${this._lookupResults.map((r) => {
                const lib = this._lookupLib[this._lookupLibKey(r)];
                const poster = lookupPosterUrl(r);
                const title = String(r.title ?? this._profile.nounTitle);
                const year = r.year;
                const label = year != null && year !== ""
                    ? `${title} (${String(year)})`
                    : title;
                const run = this.app === "sonarr" ? seriesRunLabel(r.status) : "";
                return b `
                    <article class="lookup-card" role="listitem">
                      ${poster
                    ? b `<img
                            class="lookup-poster"
                            src=${poster}
                            alt=""
                            loading="lazy"
                          />`
                    : b `<div
                            class="lookup-poster lookup-poster--empty"
                          ></div>`}
                      <div class="lookup-title">
                        <span>${label}</span>
                        ${run
                    ? b `<span class="lookup-status">${run}</span>`
                    : A}
                        ${this.app !== "sonarr" && lookupComingSoon(r)
                    ? b `<span class="lookup-soon">Soon</span>`
                    : A}
                      </div>
                      <div class="lookup-actions">
                        ${lib
                    ? b `
                              <button
                                class="primary"
                                @click=${() => void this._openMovieDetail(lib)}
                              >
                                Open
                              </button>
                              <span class="pill ok">In library</span>
                            `
                    : b `
                              <button
                                class="primary"
                                data-action=${this.app === "sonarr"
                        ? "add-series"
                        : "add-movie"}
                                ?disabled=${this._offline}
                                @click=${() => this._openAddSheet(r)}
                              >
                                Add ${this._profile.noun}
                              </button>
                            `}
                      </div>
                    </article>
                  `;
            })}
              </div>
            `
            : A}
      </div>
    `;
    }
    _detailBody(item, sidePanel = false) {
        if (this.app === "sonarr") {
            return this._seriesDetailBody(item, sidePanel);
        }
        const m = item;
        const extra = this._detailExtra;
        const hide = this._hideDestructive;
        const size = m.sizeOnDisk;
        const screen = hide && this._layoutTablet
            ? "M12T"
            : sidePanel
                ? "M01T"
                : m.hasFile
                    ? "M01"
                    : "M02";
        return b `
      <div data-screen=${screen}>
      <button
        class="text"
        @click=${() => this._closeMovieDetail()}
      >
        ← Back
      </button>
      <h2>${m.title} (${m.year})</h2>
      <img
        class="detail-poster"
        src=${m.posterUrl ?? ""}
        alt=""
        loading="lazy"
      />
      <dl class="detail-dl">
        <dt>Quality</dt>
        <dd>${m.quality ?? "—"}</dd>
        <dt>Size</dt>
        <dd class="mono">${size ? formatBytes(size) : "—"}</dd>
        <dt>Status</dt>
        <dd>${m.status ?? "—"}</dd>
        <dt>Runtime</dt>
        <dd>${m.runtime ?? extra?.runtime ?? "—"} min</dd>
        <dt>Certification</dt>
        <dd>${m.certification ?? extra?.certification ?? "—"}</dd>
      </dl>
      <p class="overview">${m.overview ?? extra?.overview ?? ""}</p>
      <label>
        <input
          type="checkbox"
          role="switch"
          .checked=${m.monitored ?? true}
          ?disabled=${this._offline}
          @change=${(e) => void this._setMonitored(m.id, e.target.checked, m.title)}
        />
        Monitored
      </label>
      <div class="detail-actions">
        <button
          class="primary"
          ?disabled=${this._offline}
          @click=${() => void this._movieSearch(m)}
        >
          Search again
        </button>
        <button
          class="primary"
          data-screen="M04"
          ?disabled=${this._offline}
          @click=${() => void this._openManualSearch(m)}
        >
          Manual search
        </button>
        <button
          class="text"
          data-screen="M08"
          ?disabled=${this._offline}
          @click=${() => {
            this._qualityPendingId =
                this._selectedMovie?.qualityProfileId ??
                    this._state?.quality_profiles?.[0]?.id;
            this._qualityOpen = true;
        }}
        >
          Change quality profile
        </button>
      </div>
      ${!hide
            ? b `
            <section>
              <h3>Fix or remove</h3>
              ${m.hasFile
                ? b `<button
                    class="outline-danger"
                    data-action="delete-redownload"
                    ?disabled=${this._offline}
                    @click=${() => this._openConfirm("m09", {
                    title: m.title,
                    year: m.year,
                    quality: m.quality,
                    size: m.sizeOnDisk,
                    movie_id: m.id,
                    showBlockCheckbox: Boolean(this._detailExtra?.grabbed_history?.length),
                })}
                  >
                    Delete file & redownload
                  </button>`
                : A}
              <button
                class="outline-danger"
                data-action="remove-movie"
                ?disabled=${this._offline}
                @click=${() => this._openConfirm("m10", {
                title: m.title,
                movie_id: m.id,
                size: m.sizeOnDisk,
            })}
              >
                Remove ${this._profile.noun}
              </button>
            </section>
          `
            : A}
      </div>
    `;
    }
    _seriesDetailBody(series, sidePanel = false) {
        const extra = this._detailExtra;
        const hide = this._hideDestructive;
        const seasons = (extra?.seasons ??
            series.seasons ??
            [])
            .slice()
            .sort((a, b) => a.seasonNumber - b.seasonNumber);
        const run = seriesRunLabel(series.status ?? extra?.status);
        const episodes = `${series.episodeFileCount ?? 0}/${series.episodeCount ?? 0}`;
        const screen = sidePanel ? "M01T" : series.hasFile ? "M01" : "M02";
        return b `
      <div data-screen=${screen}>
        <button class="text" @click=${() => this._closeMovieDetail()}>
          ← Back
        </button>
        <h2>${series.title}${series.year ? ` (${series.year})` : ""}</h2>
        <img
          class="detail-poster"
          src=${series.posterUrl ?? ""}
          alt=""
          loading="lazy"
        />
        <dl class="detail-dl">
          <dt>Network</dt>
          <dd>${series.network ?? extra?.network ?? "—"}</dd>
          <dt>Status</dt>
          <dd>${run || series.status || "—"}</dd>
          <dt>Seasons</dt>
            <dd>${series.seasonCount ?? (seasons.length || "—")}</dd>
          <dt>Episodes</dt>
          <dd>${episodes}</dd>
        </dl>
        <p class="overview">
          ${series.overview ?? extra?.overview ?? ""}
        </p>
        <label>
          <input
            type="checkbox"
            role="switch"
            .checked=${series.monitored ?? true}
            ?disabled=${this._offline}
            @change=${(e) => void this._setMonitored(series.id, e.target.checked, series.title)}
          />
          Monitored
        </label>
        ${seasons.length
            ? b `
              <section>
                <h3>Seasons</h3>
                ${seasons.map((season) => this._seasonRow(series, season))}
              </section>
            `
            : A}
        <div class="detail-actions">
          <button
            class="primary"
            ?disabled=${this._offline}
            @click=${() => void this._movieSearch(series)}
          >
            Search series
          </button>
          <button
            class="primary"
            data-screen="M04"
            ?disabled=${this._offline}
            @click=${() => void this._openManualSearch(series)}
          >
            Manual search
          </button>
          <button
            class="text"
            data-screen="M08"
            ?disabled=${this._offline}
            @click=${() => {
            this._qualityPendingId =
                this._selectedMovie?.qualityProfileId ??
                    this._state?.quality_profiles?.[0]?.id;
            this._qualityOpen = true;
        }}
          >
            Change quality profile
          </button>
        </div>
        ${hide
            ? A
            : b `
              <section>
                <h3>Fix or remove</h3>
                <button
                  class="outline-danger"
                  data-action="remove-series"
                  ?disabled=${this._offline}
                  @click=${() => this._openConfirm("m10", {
                title: series.title,
                series_id: series.id,
            })}
                >
                  Remove series
                </button>
              </section>
            `}
      </div>
    `;
    }
    _seasonRow(series, season) {
        const name = season.seasonNumber === 0
            ? "Specials"
            : `Season ${season.seasonNumber}`;
        const files = season.episodeFileCount ?? 0;
        const total = season.episodeCount ?? 0;
        return b `
      <div class="season-row">
        <div class="season-copy">
          <strong>${name}</strong>
          <div class="hint-muted">${files}/${total} episodes</div>
        </div>
        <label>
          <input
            type="checkbox"
            role="switch"
            aria-label=${`Monitor ${name}`}
            .checked=${season.monitored ?? false}
            ?disabled=${this._offline}
            @change=${(e) => void this._setSeasonMonitored(series.id, season.seasonNumber, e.target.checked)}
          />
          Monitor
        </label>
        <button
          class="text"
          ?disabled=${this._offline}
          @click=${() => void this._seasonSearch(series.id, season.seasonNumber)}
        >
          Search
        </button>
      </div>
    `;
    }
    _renderDetailPanel() {
        const m = this._selectedMovie;
        if (!m)
            return A;
        return b `
      <aside class="side-panel">${this._detailBody(m, true)}</aside>
    `;
    }
    _renderDetailDialog() {
        const m = this._selectedMovie;
        if (!m)
            return A;
        const dialogScreen = this._searchAgainBusy
            ? "M03"
            : m.hasFile
                ? "M01"
                : "M02";
        return b `
      <div
        class="sheet-backdrop detail-popup-backdrop"
        @click=${(e) => {
            if (e.target === e.currentTarget)
                this._closeMovieDetail();
        }}
      >
        <div
          class="sheet-panel detail-popup"
          role="dialog"
          aria-modal="true"
          aria-label=${`${m.title ?? this._profile.nounTitle} details`}
          data-screen=${dialogScreen}
        >
          ${this._detailBody(m, false)}
        </div>
      </div>
    `;
    }
    _renderManualSearch() {
        const all = this._releases;
        const rejectedCount = all.filter((r) => r.approved === false).length;
        const approvedCount = all.filter((r) => r.approved !== false).length;
        const filtered = all.filter((r) => this._showRejected ? true : r.approved !== false);
        const sorted = sortReleases(filtered, this._releaseSort);
        const bestGuid = sorted.find((r) => r.approved !== false)?.guid;
        const screen = this._releaseBusy
            ? "M04"
            : !sorted.length
                ? "M11"
                : this._layoutTablet
                    ? "M05T"
                    : "M05";
        return b `
      <dialog open class="release-dialog" data-screen=${screen}>
        <button class="text" @click=${() => (this._manualMovieId = undefined)}>
          ← Back
        </button>
        <h2>Manual search</h2>
        ${this.app === "sonarr"
            ? this._episodes.length
                ? b `
                <label>
                  Episode
                  <select
                    aria-label="Episode"
                    data-field="episode"
                    .value=${String(this._episodeId ?? "")}
                    @change=${(e) => {
                    const id = Number(e.target.value);
                    this._episodeId = id;
                    void this._loadEpisodeReleases(id);
                }}
                  >
                    ${this._episodes.map((episode) => {
                    const code = episodeCode(episode.seasonNumber, episode.episodeNumber);
                    const label = [code, episode.title]
                        .filter((part) => part)
                        .join(" ");
                    return b `<option value=${String(episode.id)}>
                        ${label || "Episode"}
                      </option>`;
                })}
                  </select>
                </label>
              `
                : this._episodesLoading
                    ? b `<p>Loading episodes…</p>`
                    : b `<p>No episodes on this series yet.</p>`
            : A}
        ${this.app === "sonarr" && !this._episodes.length
            ? A
            : b `
        <label>
          <input
            type="checkbox"
            role="switch"
            .checked=${this._showRejected}
            @change=${(e) => (this._showRejected = e.target.checked)}
          />
          Show rejected releases
        </label>
        ${this._releaseBusy
                ? b `
              <p>Searching indexers…</p>
              <p class="hint-muted">
                This can take up to a minute. You can close this and come back.
              </p>
              <div class="skeleton-list" aria-busy="true"></div>
            `
                : !sorted.length
                    ? b `
                <p>No releases found</p>
                <p class="hint-muted">
                  None of your indexers have this ${this.app === "sonarr" ? "episode" : this._profile.noun} right now.
                  ${this._profile.product} keeps checking while it's monitored.
                </p>
              `
                    : b `
                <div class="release-header">
                  <span
                    >${approvedCount} releases · ${rejectedCount} rejected</span
                  >
                  <select
                    aria-label="Sort releases"
                    .value=${this._releaseSort}
                    @change=${(e) => (this._releaseSort = e.target
                        .value)}
                  >
                    <option value="match">Best match</option>
                    <option value="size">Size</option>
                    <option value="age">Age</option>
                    <option value="seeders">Seeders</option>
                  </select>
                </div>
                <div role="list">
                  ${sorted.map((r) => this._releaseRow(r, r.guid === bestGuid))}
                </div>
              `}
        `}
      </dialog>
    `;
    }
    _releaseRow(r, bestMatch) {
        const rejected = r.approved === false;
        const reasons = (r.rejections ?? []).join(" · ");
        const peers = r.protocol === "usenet" || r.seeders == null
            ? "Usenet"
            : `${r.seeders} seeders`;
        return b `
      <div class="release-row ${rejected ? "rejected" : ""}" role="listitem">
        <div>
          <strong class="mono">${r.title ?? r.indexer ?? "Release"}</strong>
          <div class="release-header">
            <span class="release-chip">${releaseQualityName(r)}</span>
            <span class="mono"
              >${formatBytes(r.size)} · ${r.age ?? "?"}d · ${peers}</span
            >
            <span>${r.indexer ?? "—"}</span>
            <span class="release-chip"
              >Score ${r.customFormatScore ?? 0}</span
            >
            ${bestMatch && !rejected
            ? b `<span class="best-match-pill">Best match</span>`
            : A}
          </div>
          ${rejected
            ? b `<p class="hint-muted">
                <ha-icon icon="mdi:alert-outline"></ha-icon> Rejected:
                ${reasons}
              </p>`
            : A}
        </div>
        ${rejected && this._hideDestructive
            ? A
            : b `<button
              class="${rejected ? "text" : "primary"}"
              ?disabled=${this._offline || this._releaseBusy}
              @click=${() => this._grabRelease(r, rejected, reasons)}
            >
              ${rejected ? "Grab anyway" : "Grab"}
            </button>`}
      </div>
    `;
    }
    _grabRelease(release, rejected, reasons) {
        if (rejected) {
            this._openConfirm("m06", {
                title: release.title,
                releaseName: release.title,
                reasons,
                size: release.size,
                release,
            });
            return;
        }
        void this._doGrab(release);
    }
    async _doGrab(release) {
        this._releaseBusy = true;
        try {
            await this._ws("grab_release", { release });
            showToast(this, toastGrab());
            this._grabOkScreen = true;
            window.setTimeout(() => (this._grabOkScreen = false), 4000);
            this._manualMovieId = undefined;
            await this._refresh();
        }
        catch (err) {
            this._fail("grab_release", err);
        }
        finally {
            this._releaseBusy = false;
        }
    }
    _fail(command, err) {
        this._failureDetail =
            err instanceof Error ? err.message : String(err);
        showActionFailure(this, command, err, this._profile.product);
    }
    _openConfirm(kind, payload) {
        this._confirm = {
            kind,
            payload,
            deleteFiles: false,
            blockRelease: true,
            searchAgain: true,
            removeFromClient: true,
            addImportExclusion: false,
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
                    await this._ws(this._profile.commands.remove, {
                        [this._profile.idField]: payload[this._profile.idField],
                        delete_files: this._confirm.deleteFiles ?? false,
                        add_import_exclusion: this._confirm.addImportExclusion ?? false,
                    });
                    showToast(this, toastRemoveMovie(String(payload.title), Boolean(this._confirm.deleteFiles)));
                    this._selectedMovie = undefined;
                    break;
                case "m09":
                    await this._ws("delete_file_redownload", {
                        movie_id: payload.movie_id,
                        block_release: this._confirm.blockRelease ?? false,
                    });
                    showToast(this, toastDeleteRedownload(String(payload.title)));
                    break;
                case "d04":
                    await this._ws("queue_remove_blocklist", {
                        queue_id: payload.queue_id,
                        search_again: this._confirm.searchAgain ?? true,
                        remove_from_client: this._confirm.removeFromClient ?? true,
                    });
                    showToast(this, toastRemoveBlocklist(String(payload.title), Boolean(this._confirm.searchAgain)));
                    await this._animateQueueExit(Number(payload.queue_id));
                    break;
                case "d04b":
                    await this._ws("queue_remove", {
                        queue_id: payload.queue_id,
                        remove_from_client: this._confirm.removeFromClient ?? true,
                    });
                    showToast(this, toastRemoveQueue(String(payload.title)));
                    await this._animateQueueExit(Number(payload.queue_id));
                    break;
                case "m06": {
                    const rel = payload.release;
                    await this._ws("grab_release", { release: rel });
                    showToast(this, toastGrab());
                    this._manualMovieId = undefined;
                    break;
                }
                case null:
                    break;
                default: {
                    const _exhaustive = kind;
                    void _exhaustive;
                    break;
                }
            }
            if (kind !== "d04" && kind !== "d04b") {
                await this._refresh();
            }
        }
        catch (err) {
            const cmd = kind === "m10"
                ? this._profile.commands.remove
                : kind === "m09"
                    ? "delete_file_redownload"
                    : kind === "m06"
                        ? "grab_release"
                        : kind === "d04" || kind === "d04b"
                            ? "queue_remove"
                            : kind === null
                                ? "queue_remove"
                                : neverCommand(kind);
            this._fail(cmd, err);
        }
        finally {
            this._confirmBusy = false;
            this._confirm = null;
        }
    }
    async _animateQueueExit(queueId) {
        await animateQueueRowExit(() => {
            if (!this._exitingQueueIds.includes(queueId)) {
                this._exitingQueueIds = [...this._exitingQueueIds, queueId];
            }
        });
        await this._refresh();
        this._exitingQueueIds = this._exitingQueueIds.filter((id) => id !== queueId);
    }
    async _retryImport(row) {
        try {
            await this._ws("retry_import", {
                output_path: row.outputPath,
                download_client_id: row.downloadId,
            });
            showToast(this, toastRetryImport(this._queueTitle(row)));
            await this._refresh();
        }
        catch (err) {
            this._fail("retry_import", err);
        }
    }
    async _setMonitored(movieId, monitored, title) {
        try {
            await this._ws(this._profile.commands.setMonitored, {
                [this._profile.idField]: movieId,
                monitored,
            });
            showToast(this, monitored
                ? toastMonitorOn(title ?? this._profile.nounTitle)
                : toastMonitorOff(title ?? this._profile.nounTitle, this._profile.product));
            await this._refresh();
        }
        catch (err) {
            this._fail(this._profile.commands.setMonitored, err);
        }
    }
    async _movieSearch(m) {
        this._searchAgainBusy = true;
        try {
            await this._ws(this._profile.commands.search, {
                [this._profile.idField]: m.id,
            });
            showToast(this, toastSearchAgain(m.title));
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("not_found") || msg.includes("gone")) {
                showToast(this, toastGone(this._profile.noun));
                this._selectedMovie = undefined;
            }
            else {
                this._fail(this._profile.commands.search, err);
            }
        }
        finally {
            this._searchAgainBusy = false;
        }
    }
    async _seasonSearch(seriesId, seasonNumber) {
        try {
            await this._ws(this._profile.commands.seasonSearch, {
                series_id: seriesId,
                season_number: seasonNumber,
            });
            showToast(this, toastSearchAgain(`season ${seasonNumber}`));
        }
        catch (err) {
            this._fail(this._profile.commands.seasonSearch, err);
        }
    }
    async _setSeasonMonitored(seriesId, seasonNumber, monitored) {
        try {
            await this._ws(this._profile.commands.setSeasonMonitored, {
                series_id: seriesId,
                season_number: seasonNumber,
                monitored,
            });
            showToast(this, monitored
                ? toastMonitorOn(`season ${seasonNumber}`)
                : toastMonitorOff(`season ${seasonNumber}`, this._profile.product));
        }
        catch (err) {
            this._fail(this._profile.commands.setSeasonMonitored, err);
        }
    }
    async _openManualSearch(m) {
        if (this.app !== "sonarr") {
            await this._loadReleases(m.id);
            return;
        }
        this._manualMovieId = m.id;
        this._releases = [];
        this._episodes = [];
        this._episodeId = undefined;
        this._episodesLoading = true;
        try {
            const res = (await this._ws("get_episodes", {
                series_id: m.id,
            }));
            this._episodes = res.episodes ?? [];
            const first = this._episodes.find((episode) => !episode.hasFile) ??
                this._episodes[0];
            this._episodeId = first?.id;
        }
        catch (err) {
            this._fail("get_episodes", err);
            this._episodes = [];
        }
        finally {
            this._episodesLoading = false;
        }
        if (this._episodeId != null) {
            await this._loadEpisodeReleases(this._episodeId);
        }
    }
    async _saveQualityProfile() {
        const profileId = this._qualityPendingId;
        const m = this._selectedMovie;
        if (!m || profileId == null)
            return;
        const profiles = this._state?.quality_profiles ?? [];
        const name = profiles.find((p) => p.id === profileId)?.name ?? "profile";
        this._qualityBusy = true;
        try {
            await this._ws(this._profile.commands.setQuality, {
                [this._profile.idField]: m.id,
                quality_profile_id: profileId,
                search: this._qualitySearch,
            });
            showToast(this, toastProfile(name, this._qualitySearch));
            this._qualityOpen = false;
            await this._refresh();
        }
        catch (err) {
            this._fail(this._profile.commands.setQuality, err);
        }
        finally {
            this._qualityBusy = false;
        }
    }
    getCardSize() {
        return this._compact ? 4 : 8;
    }
}
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
], ArrDashboardCard.prototype, "_listedApp", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_mismatch", void 0);
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
], ArrDashboardCard.prototype, "_addPhase", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_lookupResults", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_addError", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_addPick", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_addSheetOpen", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_addProfileId", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_addRootPath", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_addSearchOn", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_addMonitored", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_addMinAvail", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_addBusy", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_selectedMovie", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_detailExtra", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_librarySearch", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_librarySort", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_libraryItems", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_libraryTotal", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_libraryLoading", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_libraryLoadingMore", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_addUpcoming", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_upcomingEpisodes", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_addRecent", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_addMonitor", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_lookupLib", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_queuePosters", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_compact", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_hostWidth", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_statusOpen", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_failureDetail", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_qualityOpen", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_qualitySearch", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_queueOverflow", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_manualMovieId", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_episodes", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_episodeId", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_episodesLoading", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_releases", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_showRejected", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_releaseBusy", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_releaseSort", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_exitingQueueIds", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_qualityPendingId", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_qualityBusy", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_searchAgainBusy", void 0);
__decorate([
    r()
], ArrDashboardCard.prototype, "_grabOkScreen", void 0);
function neverCommand(kind) {
    return kind;
}
defineElement("arr-card", ArrDashboardCard);
class ArrMoviesCard extends ArrDashboardCard {
}
class ArrSeriesCard extends ArrDashboardCard {
    constructor() {
        super(...arguments);
        this.app = "sonarr";
    }
}
defineElement("arr-movies-card", ArrMoviesCard);
defineElement("arr-series-card", ArrSeriesCard);
window.customCards =
    window.customCards ?? [];
window.customCards.push({
    type: "custom:arr-movies-card",
    name: "Arr Dashboard",
    description: "Radarr library, queue, and add card",
    preview: true,
    documentationURL: "https://github.com/SCWPretorius/ha-arr-dashboard",
}, {
    type: "custom:arr-series-card",
    name: "Arr Series",
    icon: "mdi:television",
    description: "Sonarr library, queue, and add card",
    preview: true,
    documentationURL: "https://github.com/SCWPretorius/ha-arr-dashboard",
});
function getConfigElement() {
    return document.createElement("arr-card-editor");
}
function getStubConfig(hass) {
    return { type: "custom:arr-card", instance: "" };
}

export { ArrDashboardCard, getConfigElement, getStubConfig };

import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("arr-virtual-list")
export class ArrVirtualList extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      overflow: auto;
      max-height: var(--arr-virtual-height, 480px);
    }
    .viewport {
      position: relative;
      width: 100%;
    }
    .spacer {
      width: 100%;
      pointer-events: none;
    }
    .window {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
    }
  `;

  @property({ type: Number }) itemHeight = 72;
  @property({ type: Number }) itemCount = 0;
  @property({ attribute: false }) renderItem!: (
    index: number,
  ) => unknown;

  @state() private _scrollTop = 0;
  @state() private _height = 400;

  private _ro?: ResizeObserver;

  connectedCallback(): void {
    super.connectedCallback();
    this._onScrollBound = this._onScroll.bind(this);
    this.addEventListener("scroll", this._onScrollBound);
    this._ro = new ResizeObserver(() => {
      this._height = this.clientHeight;
    });
    this._ro.observe(this);
  }

  disconnectedCallback(): void {
    if (this._onScrollBound) {
      this.removeEventListener("scroll", this._onScrollBound);
    }
    this._ro?.disconnect();
    super.disconnectedCallback();
  }

  private _onScrollBound?: (e: Event) => void;

  private _onScroll(): void {
    this._scrollTop = this.scrollTop;
  }

  protected render() {
    const buffer = this.itemHeight * 4;
    const total = this.itemCount * this.itemHeight;
    const start = Math.max(0, Math.floor((this._scrollTop - buffer) / this.itemHeight));
    const visible = Math.ceil((this._height + buffer * 2) / this.itemHeight);
    const end = Math.min(this.itemCount, start + visible);
    const items = [];
    for (let i = start; i < end; i++) {
      items.push(this.renderItem(i));
    }
    return html`
      <div class="viewport">
        <div class="spacer" style="height: ${total}px"></div>
        <div
          class="window"
          style="transform: translateY(${start * this.itemHeight}px)"
        >
          ${items}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "arr-virtual-list": ArrVirtualList;
  }
}
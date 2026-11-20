import { html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { defineElement } from "./define-element";

/**
 * Virtual scroller that renders into light DOM so parent card styles apply.
 */
export class ArrVirtualList extends LitElement {
  @property({ type: Number }) itemHeight = 72;
  @property({ type: Number }) itemCount = 0;
  @property({ type: Number }) columns = 1;
  @property({ type: String }) rowClass = "";
  @property({ attribute: false }) renderItem!: (
    index: number,
  ) => unknown;
  @property({ attribute: false }) renderRow!: (
    startIndex: number,
    count: number,
  ) => unknown;

  @state() private _scrollTop = 0;
  @state() private _height = 400;

  protected createRenderRoot() {
    return this;
  }

  private _rowCount(): number {
    if (this.columns <= 1) return this.itemCount;
    return Math.ceil(this.itemCount / this.columns);
  }

  private _onScrollBound?: (e: Event) => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.classList.add("arr-virtual-host");
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

  private _ro?: ResizeObserver;

  private _onScroll(): void {
    this._scrollTop = this.scrollTop;
  }

  protected render() {
    const rows = this._rowCount();
    const buffer = this.itemHeight * 4;
    const total = rows * this.itemHeight;
    const startRow = Math.max(
      0,
      Math.floor((this._scrollTop - buffer) / this.itemHeight),
    );
    const visibleRows = Math.ceil((this._height + buffer * 2) / this.itemHeight);
    const endRow = Math.min(rows, startRow + visibleRows);
    const rowNodes = [];
    for (let row = startRow; row < endRow; row++) {
      const startIndex = row * this.columns;
      if (this.columns <= 1) {
        rowNodes.push(this.renderItem(startIndex));
      } else if (this.renderRow) {
        const count = Math.min(
          this.columns,
          this.itemCount - startIndex,
        );
        rowNodes.push(
          html`<div class=${this.rowClass} role="presentation">
            ${this.renderRow(startIndex, count)}
          </div>`,
        );
      }
    }
    return html`
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

defineElement("arr-virtual-list", ArrVirtualList);

declare global {
  interface HTMLElementTagNameMap {
    "arr-virtual-list": ArrVirtualList;
  }
}
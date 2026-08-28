/* CA-BLOCK-1 — <document-lab>, the reusable document walkthrough component.
   Built now as architecture; populated in later phases with California contracts and disclosures,
   the Loan Estimate, Closing Disclosure, URLA/1003 and other regulated forms.

   THE FIXED-REGION RULE. Highlight regions are FIXED, HUMAN-DEFINED rectangles from the document
   definition (config/document-lab-model.mjs) — percentages of the page image, authored and
   reviewed by a person. This component draws exactly what the definition says; it contains no
   geometry inference, no OCR, and no automatic field detection, and the model's validator refuses
   a definition without human-authored regions. Regulated forms are not guessed at.

   The component renders: document header (title, source, version/effective date), the page image,
   the defined highlight regions, and — on selection — the region's learning objective,
   explanation, common mistake and text equivalent. */

class DocumentLab extends HTMLElement {
  /* definition: a document object from config/document-lab-model.mjs, already validated. */
  set definition(value) { this._definition = value; this.render(); }
  get definition() { return this._definition; }

  render() {
    const doc = this._definition;
    if (!doc) return;
    const page = doc.pages?.[0];
    this.innerHTML = `
      <section class="doc-lab" aria-label="Document walkthrough">
        <header class="doc-lab-header">
          <strong>${this.text(doc.title)}</strong>
          · ${this.text(doc.source)} · ${this.text(doc.version)} (effective ${this.text(doc.effectiveDate)})
        </header>
        <div class="doc-lab-page">
          ${page?.imagePath ? `<img src="${this.text(page.imagePath)}" alt="${this.text(doc.title)}, page ${this.text(page.page)}">` : `<div class="visual-placeholder">VISUAL ASSET PLANNED</div>`}
          ${(page?.highlights || []).map((highlight, index) => `
            <button type="button" class="doc-lab-highlight" data-highlight="${index}"
              style="left:${Number(highlight.region.x)}%;top:${Number(highlight.region.y)}%;width:${Number(highlight.region.w)}%;height:${Number(highlight.region.h)}%"
              aria-label="${this.text(highlight.learningObjective)}"></button>`).join("")}
        </div>
        <div class="doc-lab-explain" hidden></div>
      </section>`;
    const explain = this.querySelector(".doc-lab-explain");
    for (const button of this.querySelectorAll(".doc-lab-highlight")) {
      button.addEventListener("click", () => {
        const highlight = page.highlights[Number(button.dataset.highlight)];
        explain.hidden = false;
        explain.innerHTML = `
          <p><strong>${this.text(highlight.learningObjective)}</strong></p>
          <p>${this.text(highlight.explanation)}</p>
          ${highlight.commonMistake ? `<p><strong>Common mistake:</strong> ${this.text(highlight.commonMistake)}</p>` : ""}
          <p class="activity-note">${this.text(highlight.textEquivalent)}</p>`;
      });
    }
  }

  text(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  }
}

if (!customElements.get("document-lab")) customElements.define("document-lab", DocumentLab);
export {};

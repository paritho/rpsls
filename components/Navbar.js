const { wire } = HyperHTMLElement;

class Navbar extends HyperHTMLElement {
  static get observedAttributes() {
    return ["links", "title"];
  }

  created() {
    this.links = JSON.parse(this.getAttribute("links"));
  }

  get links() {
    return this._links || [];
  }

  set links(links) {
    this._links = links;
    this.render();
  }

  attributeChangedCallback(name, prev, curr) {
    this.render();
  }

  render() {
    return this.html`
      <nav class="navbar navbar-expand-sm navbar-light bg-light">
          <span class="navbar-brand h1 mb-0 navbar-brand-info">
            ${this.title}
          </span>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>      
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav mr-auto">
                ${this.links.map((link, idx) => {
                  return wire(link)`
                    <li id="${link.text.toLowerCase()}Link" class="nav-item">
                        <a is="a-route" class="nav-link" href="${link.to}">${
                    link.text
                  }</a>
                    </li>`;
                })}
              </ul>
          </div>
      </nav>`;
  }
}

Navbar.define("hyper-navbar");

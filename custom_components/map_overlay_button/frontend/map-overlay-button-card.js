/*
 * Map Overlay Button card, served by the Map Overlay Button integration.
 *
 * Home Assistant's own map card with a button on top. Position, text, icon
 * and tap action are chosen in the card editor; without a tap action the
 * button goes to the first view of the dashboard the map is on. Every option
 * of the built-in map card works the same.
 */

const VERSION = "1.1.0";
const CARD_TYPE = "map-overlay-button-card";
const EDITOR_TYPE = "map-overlay-button-card-editor";
const POSITIONS = ["bottom-left", "bottom-right", "top-left", "top-right"];
const DEFAULT_POSITION = "bottom-left";
// Tabs of the map's drawer in a panel view; ?tab=<one of these> in the page
// address opens the drawer on that tab.
const TABS = ["people", "devices", "zones"];

// Button height plus its margin from the map edge. The map's people drawer
// keeps this much room free on the button's side.
const BUTTON_SIZE = 48;
const BUTTON_MARGIN = 16;
const RESERVE = BUTTON_SIZE + BUTTON_MARGIN + "px";
// Distance from the map edge for a button in the corner of the map's own
// zoom and focus buttons.
const CONTROLS_CLEARANCE = BUTTON_MARGIN + BUTTON_SIZE;

const TEXT = {
  en: {
    name: "Map Overlay Button",
    description: "Map with a button on top that does what you choose, for example go back to your home view.",
    entities: "Entities",
    hours_to_show: "Hours of history",
    default_zoom: "Default zoom",
    theme_mode: "Map theme",
    theme_auto: "Automatic",
    theme_light: "Light",
    theme_dark: "Dark",
    button_section: "Button",
    button: "Show button",
    tap_action: "Tap action",
    tap_action_helper: "Leave empty to go to the first view of this dashboard.",
    position: "Position",
    "bottom-left": "Bottom left",
    "bottom-right": "Bottom right",
    "top-left": "Top left",
    "top-right": "Top right",
    show_label: "Show text",
    label: "Text",
    label_helper: "Leave empty for the word “Close” in your language.",
    icon: "Icon",
  },
  nl: {
    name: "Map Overlay Button",
    description: "Kaart met een knop erop die doet wat jij kiest, bijvoorbeeld terug naar je startweergave.",
    entities: "Entiteiten",
    hours_to_show: "Uren geschiedenis",
    default_zoom: "Standaard zoom",
    theme_mode: "Kaartthema",
    theme_auto: "Automatisch",
    theme_light: "Licht",
    theme_dark: "Donker",
    button_section: "Knop",
    button: "Knop tonen",
    tap_action: "Actie bij tikken",
    tap_action_helper: "Laat leeg om naar de eerste weergave van dit dashboard te gaan.",
    position: "Positie",
    "bottom-left": "Linksonder",
    "bottom-right": "Rechtsonder",
    "top-left": "Linksboven",
    "top-right": "Rechtsboven",
    show_label: "Tekst tonen",
    label: "Tekst",
    label_helper: "Laat leeg voor het woord “Sluiten” in je eigen taal.",
    icon: "Pictogram",
  },
};

const text = (hass, key) => {
  const lang = ((hass && hass.language) || navigator.language || "en").slice(0, 2);
  return (TEXT[lang] || TEXT.en)[key] || TEXT.en[key] || key;
};

// Options of this card; everything else goes to the built-in map card.
const CARD_KEYS = ["button", "tap_action", "position", "show_label", "label", "icon", "map_tap_action"];

// Inside the built-in map card: keep its people drawer (panel view) clear of
// the button. Selectors that do not exist in a Home Assistant version simply
// do nothing.
const OVERVIEW_CSS = `
  #root.panel-layout:not(.rtl) #overview {
    top: calc(var(--ha-space-3, 12px) + var(--mob-top-left, 0px));
    max-height: calc(100% - 2 * var(--ha-space-3, 12px)
      - var(--mob-top-left, 0px) - var(--mob-bottom-left, 0px));
  }
  #root.panel-layout.rtl #overview {
    top: calc(var(--ha-space-3, 12px) + var(--mob-top-right, 0px));
    max-height: calc(100% - 2 * var(--ha-space-3, 12px)
      - var(--mob-top-right, 0px) - var(--mob-bottom-right, 0px));
  }
  @media (max-width: 600px) {
    #root.panel-layout #overview {
      top: auto;
      bottom: var(--mob-bottom, 0px);
      max-height: 70%;
    }
  }
`;

const CARD_CSS = `
  :host {
    display: block;
    height: 100%;
  }
  #root {
    position: relative;
    height: 100%;
  }
  #map {
    position: relative;
    z-index: 0;
    height: 100%;
  }
  /* map_tap_action: a tap anywhere on the map does that action. */
  #tap {
    position: absolute;
    inset: 0;
    z-index: 1;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button {
    position: absolute;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    height: ${BUTTON_SIZE}px;
    min-width: ${BUTTON_SIZE}px;
    padding: 0 12px;
    border: none;
    border-radius: ${BUTTON_SIZE / 2}px;
    background: var(--map-overlay-button-background, var(--card-background-color, #fff));
    color: var(--map-overlay-button-color, var(--primary-text-color, #212121));
    box-shadow: var(--map-overlay-button-shadow, 0 2px 6px rgba(0, 0, 0, 0.35));
    font-family: inherit;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button.labelled {
    padding: 0 20px 0 14px;
  }
  button:active {
    filter: brightness(0.9);
  }
  .bottom-left {
    bottom: calc(${BUTTON_MARGIN}px + var(--safe-area-inset-bottom, 0px));
    left: calc(${BUTTON_MARGIN}px + var(--safe-area-inset-left, 0px));
  }
  .bottom-right {
    bottom: calc(${BUTTON_MARGIN}px + var(--safe-area-inset-bottom, 0px));
    right: calc(${BUTTON_MARGIN}px + var(--safe-area-inset-right, 0px));
  }
  .top-left {
    top: ${BUTTON_MARGIN}px;
    left: calc(${BUTTON_MARGIN}px + var(--safe-area-inset-left, 0px));
  }
  .top-right {
    top: ${BUTTON_MARGIN}px;
    right: calc(${BUTTON_MARGIN}px + var(--safe-area-inset-right, 0px));
  }
  /* The map's own zoom and focus buttons share this corner; stay beside them. */
  .top-left.beside-controls {
    left: calc(${CONTROLS_CLEARANCE}px + var(--safe-area-inset-left, 0px));
  }
  .top-right.beside-controls {
    right: calc(${CONTROLS_CLEARANCE}px + var(--safe-area-inset-right, 0px));
  }
  ha-icon {
    --mdc-icon-size: 24px;
  }
`;

class MapOverlayButtonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._card = undefined;
    this._button = undefined;
    this._hass = undefined;
    this._layout = undefined;
    this._preview = false;
    this._buildId = 0;
    this._onLocationChanged = () => this._applyTab();
  }

  connectedCallback() {
    // Navigating to this view while it is already open (for example from a
    // tap elsewhere with ?tab=devices) does not rebuild the card.
    window.addEventListener("location-changed", this._onLocationChanged);
  }

  disconnectedCallback() {
    window.removeEventListener("location-changed", this._onLocationChanged);
  }

  static getConfigElement() {
    return document.createElement(EDITOR_TYPE);
  }

  static getStubConfig(hass) {
    const people = Object.keys((hass && hass.states) || {})
      .filter((entityId) => entityId.startsWith("person."))
      .slice(0, 10);
    return { entities: people.length ? people : ["zone.home"] };
  }

  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Invalid configuration");
    }
    if (config.position && POSITIONS.indexOf(config.position) === -1) {
      throw new Error(`position must be one of: ${POSITIONS.join(", ")}`);
    }
    const mapConfig = Object.assign({}, config, { type: "map" });
    CARD_KEYS.forEach((key) => delete mapConfig[key]);
    this._config = config;
    this._mapConfig = mapConfig;
    this._render();
  }

  set hass(hass) {
    const languageChanged = !this._hass || this._hass.language !== hass.language;
    this._hass = hass;
    if (this._card) {
      this._card.hass = hass;
    }
    if (languageChanged && this._button) {
      this._updateButtonText();
    }
  }

  get hass() {
    return this._hass;
  }

  // Set by the dashboard view ("panel", "grid", ...); the map card changes its
  // look with it, so pass it on.
  set layout(layout) {
    this._layout = layout;
    if (this._card) {
      this._card.layout = layout;
    }
    this._placeButton();
  }

  get layout() {
    return this._layout;
  }

  set preview(preview) {
    this._preview = preview;
    if (this._card) {
      this._card.preview = preview;
    }
  }

  get preview() {
    return this._preview;
  }

  getCardSize() {
    return this._card && typeof this._card.getCardSize === "function"
      ? this._card.getCardSize()
      : 7;
  }

  getGridOptions() {
    return this._card && typeof this._card.getGridOptions === "function"
      ? this._card.getGridOptions()
      : { columns: "full", rows: 4, min_columns: 6, min_rows: 2 };
  }

  _render() {
    const root = this.shadowRoot;
    root.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = CARD_CSS;
    root.appendChild(style);

    const container = document.createElement("div");
    container.id = "root";
    root.appendChild(container);

    const mapHolder = document.createElement("div");
    mapHolder.id = "map";
    container.appendChild(mapHolder);

    if (this._config.map_tap_action && this._config.map_tap_action.action) {
      // A small map that opens something bigger: the map itself no longer pans
      // or zooms, a tap anywhere does the action.
      const tapLayer = document.createElement("div");
      tapLayer.id = "tap";
      tapLayer.addEventListener("click", (ev) => {
        ev.stopPropagation();
        this._fire(this._config.map_tap_action);
      });
      container.appendChild(tapLayer);
    }

    const position = this._config.position || DEFAULT_POSITION;
    this._button = undefined;
    if (this._config.button !== false) {
      container.appendChild(this._createButton(position));
      this._placeButton();
    }

    // Tell the map card which corner the button takes (see OVERVIEW_CSS).
    POSITIONS.forEach((corner) => {
      container.style.setProperty(
        `--mob-${corner}`,
        this._button && corner === position ? RESERVE : "0px"
      );
    });
    container.style.setProperty(
      "--mob-bottom",
      this._button && position.startsWith("bottom") ? RESERVE : "0px"
    );

    this._createMap(mapHolder);
  }

  // The built-in map card puts its zoom and focus buttons top right in a
  // panel view and top left otherwise (always top left for right-to-left
  // languages). A button in that corner moves beside them.
  _placeButton() {
    if (!this._button) {
      return;
    }
    const rtl = getComputedStyle(this).direction === "rtl";
    const controls = this._layout === "panel" && !rtl ? "top-right" : "top-left";
    const position = this._config.position || DEFAULT_POSITION;
    this._button.classList.toggle("beside-controls", position === controls);
  }

  _createButton(position) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = position;
    const icon = document.createElement("ha-icon");
    icon.icon = this._config.icon || "mdi:close";
    icon.setAttribute("icon", icon.icon);
    button.appendChild(icon);
    if (this._config.show_label !== false) {
      button.classList.add("labelled");
      button.appendChild(document.createElement("span"));
    }
    button.addEventListener("click", (ev) => {
      ev.stopPropagation();
      this._tap();
    });
    this._button = button;
    this._updateButtonText();
    return button;
  }

  _updateButtonText() {
    const fallback =
      (this._hass && this._hass.localize && this._hass.localize("ui.common.close")) || "Close";
    const label = this._config.label || fallback;
    this._button.title = label;
    this._button.setAttribute("aria-label", label);
    const span = this._button.querySelector("span");
    if (span) {
      span.textContent = label;
    }
  }

  _tap() {
    if (this._preview) {
      return; // Never leave the card editor.
    }
    let tapAction = this._config.tap_action;
    if (!tapAction || !tapAction.action) {
      // Nothing chosen: the first view of the dashboard this map is on.
      const dashboard = window.location.pathname.split("/").filter(Boolean)[0] || "lovelace";
      tapAction = { action: "navigate", navigation_path: `/${dashboard}` };
    }
    this._fire(tapAction);
  }

  _fire(tapAction) {
    if (this._preview) {
      return; // Never leave the card editor.
    }
    // The dashboard carries out the action, exactly as for built-in cards.
    this.dispatchEvent(
      new CustomEvent("hass-action", {
        bubbles: true,
        composed: true,
        detail: { config: { tap_action: tapAction }, action: "tap" },
      })
    );
  }

  async _createMap(holder) {
    const buildId = ++this._buildId;
    let card;
    try {
      const helpers = await window.loadCardHelpers();
      card = await helpers.createCardElement(this._mapConfig);
    } catch (err) {
      card = document.createElement("div");
      card.textContent = `Map Overlay Button: ${err}`;
    }
    if (buildId !== this._buildId) {
      return; // The configuration changed meanwhile; a newer build takes over.
    }
    card.layout = this._layout;
    card.preview = this._preview;
    if (this._hass) {
      card.hass = this._hass;
    }
    // The built-in card asks to be rebuilt once its code has loaded.
    card.addEventListener("ll-rebuild", (ev) => {
      ev.stopPropagation();
      this._render();
    });
    holder.appendChild(card);
    this._card = card;
    this._adjustOverview(card);
  }

  async _adjustOverview(card) {
    try {
      await customElements.whenDefined(card.localName);
      if (card.updateComplete) {
        await card.updateComplete;
      }
      const shadow = card.shadowRoot;
      if (!shadow || !("adoptedStyleSheets" in shadow)) {
        return;
      }
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(OVERVIEW_CSS);
      shadow.adoptedStyleSheets = shadow.adoptedStyleSheets.concat([sheet]);
    } catch (_ignored) {
      // Cosmetic only; the map and the button work without it.
    }
    this._applyTab();
  }

  // The map's drawer opens on People. With ?tab=devices (or zones, people) in
  // the page address it opens on that tab instead: the drawer is told the same
  // way as when the tab is tapped. Without the parameter nothing changes.
  async _applyTab() {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (!tab || TABS.indexOf(tab) === -1 || !this._card) {
      return;
    }
    const card = this._card;
    for (let attempt = 0; attempt < 50; attempt++) {
      const overview = card.shadowRoot && card.shadowRoot.querySelector("hui-map-overview");
      if (overview) {
        overview.dispatchEvent(new CustomEvent("map-overview-tab", { detail: { tab } }));
        return;
      }
      // The drawer appears once the map has loaded.
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (card !== this._card) {
        return;
      }
    }
  }
}

class MapOverlayButtonCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._form = undefined;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  _schema() {
    const hass = this._hass;
    return [
      { name: "entities", selector: { entity: { multiple: true } } },
      {
        name: "hours_to_show",
        selector: { number: { min: 0, max: 168, mode: "box", unit_of_measurement: "h" } },
      },
      { name: "default_zoom", selector: { number: { min: 1, max: 20, mode: "box" } } },
      {
        name: "theme_mode",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "auto", label: text(hass, "theme_auto") },
              { value: "light", label: text(hass, "theme_light") },
              { value: "dark", label: text(hass, "theme_dark") },
            ],
          },
        },
      },
      {
        type: "expandable",
        name: "button_section",
        title: text(hass, "button_section"),
        icon: "mdi:gesture-tap-button",
        flatten: true,
        expanded: true,
        schema: [
          { name: "button", selector: { boolean: {} } },
          {
            name: "position",
            selector: {
              select: {
                mode: "dropdown",
                options: POSITIONS.map((value) => ({ value, label: text(hass, value) })),
              },
            },
          },
          { name: "show_label", selector: { boolean: {} } },
          { name: "label", selector: { text: {} } },
          { name: "icon", selector: { icon: { placeholder: "mdi:close" } } },
          { name: "tap_action", selector: { ui_action: {} } },
        ],
      },
    ];
  }

  _data() {
    const config = this._config;
    return {
      entities: (config.entities || []).map((entity) =>
        typeof entity === "string" ? entity : entity.entity
      ),
      hours_to_show: config.hours_to_show,
      default_zoom: config.default_zoom,
      theme_mode: config.theme_mode || "auto",
      button: config.button !== false,
      tap_action: config.tap_action,
      position: config.position || DEFAULT_POSITION,
      show_label: config.show_label !== false,
      label: config.label,
      icon: config.icon,
    };
  }

  _render() {
    if (!this._hass) {
      return;
    }
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (schema) => text(this._hass, schema.name);
      this._form.computeHelper = (schema) =>
        schema.name === "label" || schema.name === "tap_action"
          ? text(this._hass, `${schema.name}_helper`)
          : undefined;
      this._form.addEventListener("value-changed", (ev) => this._changed(ev));
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.schema = this._schema();
    this._form.data = this._data();
  }

  _changed(ev) {
    ev.stopPropagation();
    const value = ev.detail.value;
    const config = Object.assign({}, this._config);

    // Keep per-entity settings (colors, labels) of entities that stay.
    const existing = {};
    (config.entities || []).forEach((entity) => {
      existing[typeof entity === "string" ? entity : entity.entity] = entity;
    });
    if (value.entities && value.entities.length) {
      config.entities = value.entities.map((entityId) => existing[entityId] || entityId);
    } else {
      delete config.entities;
    }

    // Only store what differs from the defaults.
    const set = (key, keep) => {
      if (keep) {
        config[key] = value[key];
      } else {
        delete config[key];
      }
    };
    set("hours_to_show", value.hours_to_show !== undefined && value.hours_to_show !== "");
    set("default_zoom", value.default_zoom !== undefined && value.default_zoom !== "");
    set("theme_mode", value.theme_mode && value.theme_mode !== "auto");
    set("button", value.button === false);
    set("tap_action", !!(value.tap_action && value.tap_action.action));
    set("position", value.position && value.position !== DEFAULT_POSITION);
    set("show_label", value.show_label === false);
    set("label", !!value.label);
    set("icon", !!value.icon);

    this._config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true })
    );
  }
}

const register = () => {
  if (customElements.get(CARD_TYPE)) {
    return;
  }
  customElements.define(CARD_TYPE, MapOverlayButtonCard);
  customElements.define(EDITOR_TYPE, MapOverlayButtonCardEditor);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: CARD_TYPE,
    name: text(undefined, "name"),
    description: text(undefined, "description"),
    preview: true,
    documentationURL: "https://github.com/milamaja/ha-map-overlay-button",
  });
  console.info(
    `%c MAP-OVERLAY-BUTTON %c ${VERSION} `,
    "color: white; background: #03a9f4; font-weight: 700;",
    "color: #03a9f4; background: white; font-weight: 700;"
  );
};

// Home Assistant replaces the browser's custom element registry while it
// starts. A card defined before that lands in the old registry, where
// dashboards cannot find it ("Custom element doesn't exist"). This file can
// load before Home Assistant has started, so register only once Home
// Assistant's own app element is defined, which happens after the swap.
if (customElements.get("home-assistant")) {
  register();
} else {
  customElements.whenDefined("home-assistant").then(register);
}

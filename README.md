# Map Overlay Button for Home Assistant

Home Assistant's own map, with a button on top that does what you choose.

Made for wall tablets and kiosks. A map shown full screen leaves no way back
on a tablet without a header or a working back button. Map Overlay Button
puts a clear button on the map, for example **Close**, that takes you back to
your home view. You choose where the button sits, what it says and what it
does, all from the dashboard editor. No files to copy, no YAML.

## What you get

- A **Map Overlay Button** card in the dashboard card picker. It is the
  standard Home Assistant map (people, devices, zones, history trails, the
  people drawer in a full-screen view) with one button on top.
- A visual editor for the button:
  - **Position**: bottom left (default), bottom right, top left or top right.
  - **Text** and **icon**, or an icon only.
  - **Tap action**: any standard Home Assistant action. Go to a view or
    another dashboard (picked from a list), open a website, run an action
    or script, show more info. Without a choice the button goes to the first
    view of the dashboard the map is on.
- The button stays clear of the map's people drawer, so they never overlap.
- Its own integration icon (Home Assistant 2026.3 and newer).

## Installation

### HACS (custom repository)

[![Open your Home Assistant instance and open this repository inside HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=milamaja&repository=ha-map-overlay-button&category=integration)

The button opens this repository in HACS (it uses [My Home Assistant](https://www.home-assistant.io/integrations/my/), which is on by default). Or add it by hand:

1. In HACS, open the menu (three dots, top right) and choose **Custom repositories**.
2. Add `https://github.com/milamaja/ha-map-overlay-button` with category **Integration**.
3. Install **Map Overlay Button** and restart Home Assistant
   (**Settings, System**, power icon top right, **Restart Home Assistant**).

Don't have HACS yet? See [the HACS installation guide](https://hacs.xyz/docs/use/).

### Manual

1. Copy the folder `custom_components/map_overlay_button` into the `custom_components` folder of your Home Assistant configuration directory.
2. Restart Home Assistant.

## Configuration

[![Open your Home Assistant instance and start setting up Map Overlay Button.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=map_overlay_button)

Or go to **Settings, Devices & services, Add integration** and search for
**Map Overlay Button**. There is nothing to fill in: click **Submit** and the
card is available on all your dashboards.

Reload the dashboard once afterwards (on a wall tablet: reload the kiosk app,
or restart it).

## Adding the card

1. Open your dashboard, click the **pencil** (top right) to edit it.
2. Click **Add card** and search for **Map Overlay Button**.
3. Pick the people, devices or zones to show. The people in your home are
   already filled in.
4. Under **Button**, choose the position, the text, the icon and the tap
   action. Leave the tap action empty to go to the first view of this
   dashboard.
5. Click **Save**.

### A full-screen map

1. Edit the dashboard and click the **+** next to the view tabs to add a view.
2. Set **View type** to **Panel (single card)**, give it a name and save.
3. Add the **Map Overlay Button** card to that view as above.

To open the map from your home view, give a tile or button on the home view a
tap action **Navigate** to the new map view. On the map, the button takes you
back.

In a full-screen map, Home Assistant shows a list with the tabs **People**,
**Devices** and **Zones**, and it always opens on People. Add `?tab=devices`
(or `?tab=zones`) to the navigation path to open it on that tab instead, for
example `/your-dashboard/map?tab=devices` to show where the car is.

## Options in YAML

Everything is in the visual editor; this is for those who prefer YAML. All
options of Home Assistant's
[map card](https://www.home-assistant.io/dashboards/map/) work the same.

```yaml
type: custom:map-overlay-button-card
entities:
  - person.alice
  - zone.home
hours_to_show: 12
position: bottom-left      # bottom-right, top-left, top-right
label: Home                # empty: "Close" in your language
icon: mdi:home
show_label: true           # false: icon only
button: true               # false: no button
tap_action:                # empty: the first view of this dashboard
  action: navigate
  navigation_path: /your-dashboard/your-view
```

The button colours follow your theme. To change them, set
`map-overlay-button-background`, `map-overlay-button-color` or
`map-overlay-button-shadow` in your theme.

## How it works

The integration serves the card from Home Assistant itself and adds it to
your dashboard resources, so every browser, the companion apps and kiosk apps
load it. The card shows Home Assistant's built-in map card unchanged and
places the button on top; the tap action is carried out by Home Assistant
exactly as for its own cards.

Removing the integration removes the card from your dashboard resources.

## License

MIT, see [LICENSE](LICENSE).

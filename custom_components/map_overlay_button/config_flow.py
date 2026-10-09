"""Config flow for Map Overlay Button: one click, nothing to fill in."""
from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN, NAME


class MapOverlayButtonConfigFlow(ConfigFlow, domain=DOMAIN):
    """Add the Map Overlay Button card to the dashboards."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Confirm and create the entry."""
        if user_input is not None:
            return self.async_create_entry(title=NAME, data={})
        return self.async_show_form(step_id="user")

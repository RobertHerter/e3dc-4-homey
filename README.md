# E3DC Home power station (Community Fork)

> **This is a community-maintained fork** of the original [jnk-cons/e3dc-4-homey](https://github.com/jnk-cons/e3dc-4-homey) which is no longer actively maintained.
> Goal: keep the app working with current Homey, improve documentation, and **fully implement rich E3/DC Wallbox support** (more telemetry + control via RSCP for solar-optimized EV charging).

Contributions, issues and PRs welcome on https://github.com/Copiis/e3dc-4-homey !

---

Do you own a home power station from E3DC? Would you like to integrate it into your SmartHome? Well,
you've found what you're looking for.

Control your devices based on the current performance data of your home power plant.

Change configuration parameters as you need. You have a dynamic electricity tariff and want to
charge your storage system when the electricity price is low? Set up a flow.

Do you want to charge your electric car as efficiently as possible with solar power? Set up a flow.

And the best thing about it? The communication between the home power station and Homey runs entirely in your local network.
 To do this, you need to activate the RSCP interface on your home power station. This is very simple:

1. Go to the main menu
2. Select "Personalize"
3. Seect "Profile"
4. Scroll down and set a RSCP Password
5. That's it

**Wallbox support**: Each connected wallbox appears as its own device with live power/solar-share. Use flow cards to start/stop charging, enable pure solar surplus (sun) mode, or set custom current + mode for advanced control.

You can find a detailed documentation [here](https://copiis.github.io/e3dc-4-homey/)

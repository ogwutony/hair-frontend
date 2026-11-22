# /culture page: things to fix

Reported 2026-11-22 from https://community.themajorities.com/culture

## 1. Avatar not loading in "Community Social Links": FIXED in code

**What you see:** The member `dedarolto.lindsey` shows a broken image with the text "avata" instead of a profile picture.

**Cause:** That member's avatar is a **video** (`.../video/upload/.../jyoojpfpcjdw7saih0j2.mov`). The Community Social Links card always used `<img>`, and an `<img>` tag can't display a video.

**Fix (`src/pages/CultureLabPage.jsx`):** When the avatar is a video, show it as a muted, looping `<video>`, the same way `CredentialHeader` already does elsewhere on the site.

## 2. Location autocomplete not working: code made safer, CONFIG STILL NEEDED

**What you see:** No suggestions appear when typing in the Location row. There's a small error icon inside the box, and the cursor shows ⊘ (disabled).

**Cause:** That icon and the locked input are Google Maps' own response when it **rejects the API key**. The code loads Google's script, but Google refuses the key and disables the field. This has to be fixed in Google Cloud and Vercel; a code change can't fix it.

**To do (Google Cloud Console → APIs & Services):**
- [ ] Open the key used for `REACT_APP_GOOGLE_MAPS_API_KEY` and check **Application restrictions → Website restrictions**. It must include `https://community.themajorities.com/*` (and `https://*.themajorities.com/*` if other subdomains use it).
- [ ] Check **API restrictions**: the key must allow **Maps JavaScript API** and **Places API**.
- [ ] Make sure **Places API** (the classic one, not only "Places API (New)") and **Maps JavaScript API** are enabled for the project.
  - Note: Google stopped offering the classic `places.Autocomplete` widget to *new* projects in March 2025. If the project was created after that, the code needs to move to `PlaceAutocompleteElement` (Places API New). Raise this if enabling classic Places isn't possible.
- [ ] Make sure **billing is enabled** on the Google Cloud project; Maps won't run without it.
- [ ] In Vercel → Project → Settings → Environment Variables, confirm `REACT_APP_GOOGLE_MAPS_API_KEY` is set for **Production**, then **redeploy**. `REACT_APP_*` values are baked in at build time.
- [ ] To confirm: open DevTools → Console on /culture. Google logs the exact reason, e.g. `RefererNotAllowedMapError`, `ApiNotActivatedMapError`, `InvalidKeyMapError` or `BillingNotEnabledMapError`.

**Code changes made (`src/components/LocationAutocomplete.jsx`):**
- If Google rejects the key, the field is turned back into a normal text box, so people can still type a location by hand instead of getting a locked field.
- It now checks for `google.maps.places` specifically before loading. Before, any other Google script that set `window.google` would stop Maps from loading at all.
- It logs a clear console message when the key is missing or rejected.

This component is shared, so the same fix applies to the Location fields on the Profile page.

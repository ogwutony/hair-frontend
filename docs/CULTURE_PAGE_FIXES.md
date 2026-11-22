# /culture page: things to fix

Reported 2026-11-22 from https://community.themajorities.com/culture

## 1. Avatar not loading in "Community Social Links": FIXED in code

**What you see:** The member `dedarolto.lindsey` shows a broken image with the text "avata" instead of a profile picture.

**Cause:** That member's avatar is a **video** (`.../video/upload/.../jyoojpfpcjdw7saih0j2.mov`). The Community Social Links card always used `<img>`, and an `<img>` tag can't display a video.

**Fix (`src/pages/CultureLabPage.jsx`):** When the avatar is a video, show it as a muted, looping `<video>`, the same way `CredentialHeader` already does elsewhere on the site.

## 2. Location autocomplete not working: code updated, GOOGLE SETUP STILL NEEDED

**What you see:** No suggestions appear when typing in the Location row. There's a small error icon inside the box, and the cursor shows ⊘ (disabled).

**Cause:** That icon and the locked input are Google Maps' own response when it **rejects the API key**. The code loads Google's script, but Google refuses the key and disables the field. This has to be fixed in Google Cloud and Vercel; a code change can't fix it.

**Code change made: moved to Places API (New)** (`src/components/LocationAutocomplete.jsx`)
- Suggestions now come from Google's newer **Places API (New)**, which Google Cloud projects created after March 2025 must use. The site draws its own suggestion list under the input, with arrow keys and Enter to pick and Esc to close.
- Picking a place fills in "Name, Address", e.g. `Massey Shots Bar & Grill, 123 Main St, Dallas, TX ...`. This is the same format as before.
- If the key can't use the new API, it automatically falls back to the classic Places widget.
- If Google rejects the key entirely, or no key is set, the field stays a normal text box so people can still type a location.
- Tests: `src/components/LocationAutocomplete.test.jsx`

**Still to do (Google Cloud Console → APIs & Services):** the code change can't fix a rejected key.
- [ ] Enable **Places API (New)** and **Maps JavaScript API** for the project.
- [ ] On the key used for `REACT_APP_GOOGLE_MAPS_API_KEY`:
  - **Website restrictions** must include `https://community.themajorities.com/*`
  - **API restrictions** must allow *Places API (New)* and *Maps JavaScript API*
- [ ] Make sure **billing is enabled** on the project.
- [ ] In Vercel → Settings → Environment Variables, confirm `REACT_APP_GOOGLE_MAPS_API_KEY` is set for **Production**, then **redeploy**. `REACT_APP_*` values are baked in at build time.
- [ ] To confirm: open DevTools → Console on /culture and type in Location. A Google error message there names the remaining problem.

This component is shared, so the same fix applies to the Location fields on the Profile and Partner pages.

# Jahvantè Town — playable p5.js portfolio

A top-down village game built by **adapting the code structure of `GameProjectFinal.zip`**, the supplied University of London p5.js game project. The original was a horizontal side-scroller. This version uses a scrolling overhead camera with houses as the portfolio sections.

## Play it locally

You do **not** need Node, React, Vite, or any package installation. For a zero-setup demo, double-click **`playable-preview.html`**. It is a standalone file with p5.js, game code, résumé and optional sound effects embedded. It also works when sent by itself.

```bash
cd Jahvante_P5_Village_Portfolio
python3 -m http.server 8000
```

Open **http://localhost:8000**. The game uses native ES modules, so don't just double-click `index.html` from a `file://` URL.

## Controls

- **Arrow keys / WASD**: Move the original green-alien-inspired character around the village.
- **E / Enter / Space**: Enter the house when near its door.
- **Mouse**: Click a house to open its content directly.
- **Mobile/touch**: Use the on-screen D-pad. Building directory buttons also work without movement.
- **Esc**: Exit the current house panel.
- **SFX OFF/ON**: Optional sounds, off by default. Sound effects are from the original uploaded game.
- **Return to town square**: Reset the avatar's position.

## The houses

| House | Portfolio content |
| --- | --- |
| Project Lab | API, GameFilter, E-Commerce case studies and public links |
| Guild Hall | Freelance, FinSight AI, and Trep DigitalX experience |
| Skill Shop | Technology stack and learning roadmap |
| My Home | Profile, approach, University of London, App Academy, Mia Academy |
| Trophy Hall | Coding Temple specialist badges, developer certificates, additional training and professional reference letters |
| Post Office | Email, GitHub, LinkedIn, downloadable résumé |

## Where to edit

- `js/data/content.js`: **All the content, project links, experience, skills and house metadata**.
- `js/game/sketch.js`: p5 instance-mode lifecycle (`setup`, `draw`, keyboard, mouse).
- `js/game/character.js`: Sprite based on the original game's green alien in a purple suit.
- `js/game/logic.js`: Input movement, collision and camera.
- `js/game/scenery.js`: Grass, roads, rooftops, pond, signs, trees and NPCs.
- `js/game/collectable.js`: Original Collectable concept adapted to technology tokens.
- `js/ui/panels.js`: Accessible room/dialog content and close behavior.
- `js/ui/controls.js`: Directory, action buttons, mobile D-pad, optional sound.
- `styles.css`: All layout and interface styling.

## Why this structure?

It follows the original game's separation of `sketch.js`, `other/character.js`, `other/logic.js`, and `scenery` / collectables, while converting global-style p5 code into **ES modules + p5 instance mode**. There is no dependency on React or npm and no use of official Pokémon graphics, characters or sounds. The look is an original, classic top-down RPG village.

## Notes

The included résumé and credentials are copies of the uploaded documents. Python is used to prepare web-friendly thumbnail images and build the portable preview; the playable browser game remains native JavaScript / p5.js. Project links are drawn from the previous portfolio and should be verified before public deployment. Information in the experience and project text is sourced from the supplied résumé and previous portfolio. The Trep DigitalX role is listed explicitly, with RIBER Italia as a client project.

The original uploaded game may have custom rights/attributions for its music; this site includes only its short sound effects and does not autoplay audio. Remove or replace any effects if you do not have rights to publish them.

## Adding and maintaining credentials

- Certificate metadata lives in `js/data/content.js`, in the `badges`, `certificates`, `recommendations`, and `additionalTraining` arrays.
- Original PDFs and image thumbnails are stored in `assets/credentials/`.
- To regenerate thumbnails from PDFs, use Python / PyMuPDF before running the standalone bundle script.
- The standalone `playable-preview.html` embeds all credential PDFs and images to work offline.
- **Before publishing publicly:** review the uploaded letters and certificates for personal details (including dates of birth, document numbers, and referees’ email addresses), and confirm permission to share recommendation letters. For a public version, it may be better to provide summaries and only share full recommendation letters on request.

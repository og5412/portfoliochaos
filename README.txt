JIAWEI LIU / DESIGN & CHAOS

LOCAL PREVIEW
Double-click START-PREVIEW.cmd. The site opens at Selected Work.
Keep its terminal window open while exploring. Close it to stop the preview.
Use this launcher for the 3D viewer; opening the HTML directly may block local 3D resources.

WEBSITE FILES
index.html                  Original homepage, with working project links
projects/                   Eight static project detail pages
assets/fruit/               Original material studies, cube stages, wire and gallery
assets/case-studies/        Original process drawings and project imagery
assets/fruit-viewer.js      Recovered cube stages and pressure-binding walkthrough
assets/surface-materials.js Scanned concrete, painted mineral walls and floor materials
assets/fruit/materials/     Local PBR maps, surface parameters and CC0 source credits
assets/vendor/             Local third-party libraries and their licenses

The 3D cube is based on geometry exported from cube2.c4d. Its original displacement was evaluated before export. The final stage adds localized pressure grooves and edge chips at three tight-wire contacts; the intact and traces stages retain their original geometry. The pre-wear final sculpt is preserved in the native master. The barbed wire is a separate Blender model with real twisted strands and sharp barb geometry. Original C4D materials were not exported; the web materials were rebuilt.

The cube now uses photographed concrete color, normal, roughness and small-scale
occlusion maps. Its intact surface has finer cast cement; the eroded surface and
local fractures reveal aggregate. Roughness is mapped into dry material ranges,
so the mineral grains, cement and fresh chips respond differently to light.
The charcoal walls and floor retain their average gray values, with restrained
surface detail and texture repetition measured against the original room size.
The geometry, wire growth, walkthrough cameras and source light layout are preserved.
See assets/fruit/materials/CREDITS.md for the ambientCG source material licenses.

gallery-room.glb contains the actual cube.c4d room, suspension and lamp housing.
source-gallery-config.json records the original scene proportions, cameras,
cube rotation and light layout. Legacy C4D percentages have no physical units;
web light power and exposure are calibrated for the real-time renderer.
The irregular wire has deliberate contacts, open bows, and embedded entry/exit
sections in the original eroded sculpture. Inspect detail moves closer without
changing the material stage or the current viewing direction.
The latest wire extends over all six faces. The first-stage entrance framing is
centered, and all orbit cameras keep world-up to prevent sideways roll.
The fourth side is closed with a matched wall. Walkthrough cameras stay inside
the room, using a wider lens for the entrance view. The original cameras remain
recorded in the source layout. Stage changes keep the current angle and detail
mode, with a 4.2-second eased transition for the camera, surfaces and wire.
The final wire has seven uneven windings around the cube: a main winding,
a stronger crossing response and five offset windings. The initial
fragment (wire_early, shown in material stage 2) continues into wire_deep_a
to complete the main winding. Additional windings grow with staggered starts.
The walls and floor use charcoal-gray materials. Broad winding arcs keep
visible air gaps. Longer tight bands, short buried sections and loose arcs
give each winding a different tension; spacing is deliberately uneven.
Both ends of each completed winding are buried inside the eroded sculpture.
Unequal inclinations, long tight spans and broad slack arcs form a tangled
binding around the cube without visible free cable ends in the final state.
Thicker main cables press into longer tight bands, while other strands remain
loose. Three matching corner-wear areas make the binding force visible.
Wire is fully opaque and grows along its authored paths, with matching shadows.
Returning to an earlier state retracts it along the same paths. Per-vertex
_GROWTH data in barbed-wire.glb controls the strand, coil and barb sequence.
Detail/room view and reset moves take 2.8 seconds; reversing continues from
the currently displayed state. Reduced-motion preferences are respected.

Upload the complete folder to a static web host, preserving its file structure.
No build step or server-side application is required for hosting.

The original chaos.mp4 is preserved. No changes were made to the source C4D file.



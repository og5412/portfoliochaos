# Material texture sources

PBR source maps from **ambientCG**, released under **CC0 1.0**. Free commercial and non-commercial use is allowed. Attribution is included here for provenance.

| Use | Official source | Technique | Source maps used |
| --- | --- | --- | --- |
| Sculpture body | [Concrete037](https://ambientcg.com/view?id=Concrete037) | Surface photogrammetry | 2K color; 1K OpenGL normal, roughness, ambient occlusion |
| Gallery floor | [Concrete048](https://ambientcg.com/view?id=Concrete048) | Surface photogrammetry | 1K color, OpenGL normal, roughness, ambient occlusion |
| Gallery walls | [Concrete034](https://ambientcg.com/view?id=Concrete034) | Approximation | 1K color, OpenGL normal, roughness; no AO supplied |

License information: [ambientCG License](https://docs.ambientcg.com/license/), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

Raw source ZIPs and every original map are preserved under `analysis/material-sources/` with archive/file SHA-256 records. Downloads began at the official `ambientcg.com/get` endpoint and followed its official download CDN redirect.

Web derivatives use technical JPEG encoding only: color quality85, OpenGL normal quality94 with4:4:4 chroma, grayscale roughness/AO quality90. No AI image editing, artistic color changes, retouching, resizing or geometry changes were applied. Exact source/derivative hashes, parameters, sizes and normal compression error are in `material-textures.json`.

Color maps are sRGB. Normal/roughness/AO are data textures. Do not use the displacement maps to alter the frozen sculpture geometry.

# Vendored Claude Code skills

These skills are vendored from the `ui-ux-pro-max` plugin. The `/plugin` command is
not available in Claude Code web sessions, so the plugin's skill bundle is committed
here instead — `.claude/skills/` is discovered automatically by Claude Code.

| Field | Value |
|---|---|
| Marketplace | [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| Plugin | `ui-ux-pro-max` |
| Version | 2.13.0 |
| Commit | `7f69fed6a2717900085f1bc3b263721f8ba025e2` |
| License | MIT |

## Skills

| Skill | Purpose |
|---|---|
| `ui-ux-pro-max` | Searchable UI/UX database — styles, palettes, font pairings, UX guidelines, charts, per-stack guidance |
| `ui-styling` | shadcn/ui, Tailwind, and design-system implementation |
| `design-system` | Three-layer design tokens and component specs |
| `brand` | Brand voice, visual identity, messaging |
| `slides` | HTML presentations with Chart.js |
| `banner-design` | Social, ad, hero, and print banners |
| `design` | Umbrella design skill (logos, CIP, mockups) |

`design` ships with the plugin but is shadowed when Claude Code has a built-in skill
of the same name. The other six activate normally.

## Notes

- `ui-ux-pro-max/scripts/*.py` run on stock Python 3 with no third-party packages.
- Nothing here is imported by the application build; these files only affect Claude Code.

## Updating

```sh
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill /tmp/uupm
rsync -a --delete /tmp/uupm/.claude/skills/ .claude/skills/   # then restore this README
```

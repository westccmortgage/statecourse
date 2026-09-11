# Production interface review

Requested by the owner: publish the new admin interface on the actual StateCourse site for inspection.

This release adds the workspace navigation, scoped data inspection and course text preview. New workspace mutations are refused server-side even for owners; their submit buttons are disabled. The existing catalog, video and approval endpoints keep their existing authorization and behavior. No student endpoint/player, freeze, scheduled function, payment mode or regulatory approval is changed by this release.

The owner reported successful execution of migrations 021, 022 and 023 in Supabase. This is operator-reported evidence, not independent database verification. No schema migration is executed by this deployment.

Student revision delivery and editable workspace operations remain on the implementation branch and are not part of this release. Weekly automation is not activated. A visible warning explains the read-only state. Missing data sources display unavailable rather than a successful zero.

Verification: static Netlify build and focused workspace/auth/video regression tests. An authenticated owner walkthrough is still required; no owner session has been impersonated. This release is for interface inspection, not a declaration that the entire admin project is complete.

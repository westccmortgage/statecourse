# State document architecture

StateCourse stores regulatory records by jurisdiction so course approval evidence never becomes a global default.

Each state contains separate provider, course, instructor, policy, approval, reporting, and version metadata. Public applications consume only reviewed publication fields; secure assessments and student records remain outside the public web artifact.

Directory convention:

`states/{state}/provider/` — provider applications, approval numbers, effective dates, and renewals.

`states/{state}/courses/` — course applications, approved versions, timed outlines, and document manifests.

`states/{state}/instructors/` — résumés, competence evidence, approvals, and appointments.

No state status may be advanced to Approved without a stored written regulator action and administrator verification.

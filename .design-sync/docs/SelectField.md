---
category: Controls & Inputs
---

SelectField — a select-style form field sharing AuthTextField's anatomy (visible label,
dark field, red error border, optional tag + help line) but opening a picker sheet instead
of editing text. Used by the sign-up form's civility and legal-status fields, which mirror
the back-office "Invite a coach" dropdowns.

The field itself is a button (RN has no native <select>): it announces its label and the
current value, and the caller pairs it with an OptionSheet for the actual choice.

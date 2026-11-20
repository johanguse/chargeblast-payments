#!/usr/bin/env bash
# Turns a branch name into a Cloudflare preview alias.
#
# Output uses lowercase letters, digits and dashes, starts with a letter, and
# has at most 42 characters, so "<alias>-chargeblast-payments" fits in one
# DNS label (63 characters).
#
#   preview-alias.sh feature/New-Filters   # feature-new-filters
#   preview-alias.sh 123-hotfix            # b-123-hotfix
set -euo pipefail

alias=$(printf '%s' "${1:-}" | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9]+/-/g; s/^-+//' | cut -c1-40 | sed -E 's/-+$//')
alias=${alias:-preview}
case "$alias" in
  [a-z]*) ;;
  *) alias="b-$alias" ;;
esac
printf '%s\n' "$alias"

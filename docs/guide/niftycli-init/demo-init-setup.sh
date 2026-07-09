#!/usr/bin/env bash
# Seeds an isolated, empty HOME (no existing config) so `niftycli init` runs
# as a true first-time setup for this demo. Also starts a local fake SMTP
# server so the recorded `niftycli new` calls show a real send succeeding
# instead of a DNS failure against a made-up host.
export HOME
HOME=$(mktemp -d)
node docs/guide/utils/fake-smtp.js 2525 >/dev/null 2>&1 &
disown
sleep 0.3
PS1='> '
clear

#!/usr/bin/env bash
# Seeds a HOME with an existing config (SMTP + one project) so this demo
# jumps straight into `niftycli new`. Also starts a local fake SMTP server
# so the recorded send shows a real success instead of a DNS failure
# against a made-up host.
export HOME
HOME=$(mktemp -d)
mkdir -p "$HOME/.niftycli"
cat > "$HOME/.niftycli/config.json" <<'CFG'
{
  "smtp": {
    "host": "127.0.0.1",
    "port": 2525,
    "secure": false,
    "user": "you@yourcompany.com",
    "pass": "demo",
    "fromName": "",
    "fromEmail": "you@yourcompany.com"
  },
  "projects": [{ "name": "Website", "email": "tasks-website@n.niftypm.com" }],
  "defaultProject": "Website"
}
CFG
node docs/guide/utils/fake-smtp.js 2525 >/dev/null 2>&1 &
disown
sleep 0.3
PS1='> '
clear

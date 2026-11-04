#!/usr/bin/env python3
"""One-off: discover and link related work items to HPUX-2227."""
import json
import base64
import urllib.request
import urllib.error

token = open("/Users/fkargbo/.jira-token").read().strip()
creds = base64.b64encode(f"fkargbo@redhat.com:{token}".encode()).decode()
HDR = {
    "Authorization": f"Basic {creds}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}


def api(method, path, body=None):
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(
        f"https://redhat.atlassian.net/rest/api/3{path}",
        data=data,
        headers=HDR,
        method=method,
    )
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:500]


def search(jql, n=25):
    status, res = api(
        "POST",
        "/search/jql",
        {
            "jql": jql,
            "maxResults": n,
            "fields": ["summary", "status", "issuetype", "parent", "customfield_10014"],
        },
    )
    if status != 200:
        print("search fail", status, res)
        return []
    return res.get("issues") or []


print("=== RELATED CANDIDATES ===")
for jql in [
    "parent = OBSINTA-1628 ORDER BY key ASC",
    "key in (HPUX-1614, HPUX-1615, HPUX-1532, HPUX-1533, HPUX-2106, OLS-4225, OBSINTA-1629, OLS-3716)",
]:
    print("\n---", jql[:100])
    for issue in search(jql):
        f = issue["fields"]
        parent = (f.get("parent") or {}).get("key") or f.get("customfield_10014")
        print(
            f"{issue['key']}\t{f['issuetype']['name']}\t{f['status']['name']}\t{parent}\t{f['summary']}"
        )

# Already: parent OBSINTA-1628, Informs OBSDA-1395
# Add Related for entry points, timeline, TP predecessor, adapter release
candidates = [
    ("Related", "HPUX-1614", "HPUX-2227"),
    ("Related", "HPUX-1615", "HPUX-2227"),
    ("Related", "HPUX-1533", "HPUX-2227"),
    ("Related", "HPUX-2106", "HPUX-2227"),
    ("Related", "OLS-4225", "HPUX-2227"),
    ("Related", "OBSINTA-1629", "HPUX-2227"),
    ("Related", "OLS-3716", "HPUX-2227"),
]

print("\n=== LINKING ===")
for typ, a, b in candidates:
    status, res = api(
        "POST",
        "/issueLink",
        {"type": {"name": typ}, "inwardIssue": {"key": a}, "outwardIssue": {"key": b}},
    )
    print(f"{typ} {a} <-> {b} => {status}", "OK" if status == 201 else res)

# Verify
print("\n=== HPUX-2227 LINKS AFTER ===")
status, issue = api(
    "GET",
    "/issue/HPUX-2227?fields=summary,parent,issuelinks",
)
print("parent:", (issue["fields"].get("parent") or {}).get("key"))
for L in issue["fields"].get("issuelinks") or []:
    t = L.get("type", {})
    other = L.get("outwardIssue") or L.get("inwardIssue") or {}
    direction = "outward" if L.get("outwardIssue") else "inward"
    label = t.get("outward") if direction == "outward" else t.get("inward")
    print(f"  {t.get('name')} ({label}) -> {other.get('key')} | {other.get('fields', {}).get('summary')}")

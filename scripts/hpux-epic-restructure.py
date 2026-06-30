#!/usr/bin/env python3
"""Apply HPUX-1643 / HPUX-1653 epic restructure via Jira REST API."""

from __future__ import annotations

import base64
import json
import os
import sys
import urllib.error
import urllib.request

JIRA_BASE = "https://redhat.atlassian.net/rest/api/3"
EMAIL = "fkargbo@redhat.com"
TOKEN = open(os.path.expanduser("~/.jira-token")).read().strip()
AUTH = base64.b64encode(f"{EMAIL}:{TOKEN}".encode()).decode()
ASSIGNEE = "712020:82775434-9895-4e7f-b099-ef325123e623"
OBS_COMPONENT = {"id": "80932"}
OCP_COMPONENT = {"id": "80924"}


def text(s: str, marks=None):
    node = {"type": "text", "text": s}
    if marks:
        node["marks"] = marks
    return node


def link(s: str, href: str):
    return text(s, [{"type": "link", "attrs": {"href": href}}])


def strong(s: str):
    return text(s, [{"type": "strong"}])


def heading(level: int, s: str):
    return {"type": "heading", "attrs": {"level": level}, "content": [text(s)]}


def para(*nodes):
    return {"type": "paragraph", "content": list(nodes)}


def bullet(*items: str):
    return {
        "type": "bulletList",
        "content": [
            {"type": "listItem", "content": [para(text(item))]} for item in items
        ],
    }


def task_list(*items: str):
    return {
        "type": "bulletList",
        "content": [
            {"type": "listItem", "content": [para(text("[ ] " + item))]} for item in items
        ],
    }


def doc(*blocks):
    return {"type": "doc", "version": 1, "content": list(blocks)}


def jira(method: str, path: str, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        f"{JIRA_BASE}{path}",
        data=data,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Basic {AUTH}",
        },
        method=method,
    )
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read()
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} {method} {path}", file=sys.stderr)
        print(e.read().decode(), file=sys.stderr)
        raise


def hpux_1643_description():
    return doc(
        heading(2, "Description / Background info"),
        para(
            text("Following the "),
            link("May 28 agentic experience review", "https://docs.google.com/document/d/1tkZn3DeHB9g88OdFDCPSyvEdFbLBjDTKrPooYmQpKa8/edit"),
            text(", UXD adopted a "),
            strong("plan-centric"),
            text(" console strategy for OCP 5.0 tech preview. Users manage "),
            strong("Plans"),
            text(" as the surfaced object; each Plan includes one or more "),
            strong("Proposals"),
            text(" describing how to resolve it. Alerts and other signals are "),
            strong("inputs"),
            text(", not the home surface."),
        ),
        para(
            text("This epic covers "),
            strong("OCP 5.0 tech preview delivery only"),
            text(" — proposals queue, advisory-first investigation detail, and MVP prototype — aligned with Agentic OpenShift (Joshua Wilson) and informed by Summit 2026 customer research."),
        ),
        para(
            text("Alert-triggered troubleshooting (Investigation Hub, per-alert widgets under "),
            link("HPUX-1532", "https://issues.redhat.com/browse/HPUX-1532"),
            text(") remains the contextual "),
            strong("entry"),
            text("; this epic defines the "),
            strong("5.0 TP destination"),
            text(" those flows land in."),
        ),
        para(
            strong("Post-5.0 north-star work"),
            text(" (fleet Recommendation Hub, impact scoring, multi-domain inbox, aggregated fleet plans) lives under "),
            link("HPUX-1653", "https://issues.redhat.com/browse/HPUX-1653"),
            text("."),
        ),
        para(strong("Related artifacts")),
        bullet(
            "May 28 review notes: https://docs.google.com/document/d/1tkZn3DeHB9g88OdFDCPSyvEdFbLBjDTKrPooYmQpKa8/edit",
            "Summit 2026 research: https://docs.google.com/document/d/1lriPFrreMq1d1qFiTNv0u-kEYfkaR8mWAKaSkstnqVo/edit",
            "UX prototype: ai-hub-autonomous-agentic-plans-mvp",
            "Informs: OLS-2894",
        ),
        {"type": "rule"},
        heading(2, "Problem statement"),
        para(
            text("Customers need a clear answer to \"what should I do next?\" for a "),
            strong("single cluster / 5.0 TP scope"),
            text(" — with AI surfacing root cause and recommended actions first. Autonomous execution requires graduated trust, audit trails, and sandbox validation. Summit 2026: customers want AI to "),
            strong("propose"),
            text(", not auto-execute in prod."),
        ),
        heading(2, "Goals for the work"),
        bullet(
            "Deliver 5.0 TP UX for proposals queue + advisory-first investigation detail (HPUX-1731)",
            "Ground designs in eng model (Plan/Proposal) with OSL alignment",
            "Prototype backend-faithful MVP workflow for stakeholder review",
            "Document integration with alert/investigation entry points (HPUX-1533)",
            "UI copy and domain-team coordination for TP launch readiness",
        ),
        heading(2, "Definition of done"),
        task_list(
            "Plan vs Proposal UX model documented with engineering (eng spec + UX supplement)",
            "5.0 TP designs for proposals queue + advisory-first investigation detail shipped and reviewed",
            "MVP prototype validated with Ju + OSL eng",
            "Integration with Investigation Hub / alert flows documented",
            "UI copy reviewed; domain teams aligned on Proposal representation",
            "Designs linked in epic; shared in agentic weekly meeting",
            "Stakeholder sign-off on 5.0 TP scope before epic closed",
        ),
        heading(2, "Out of scope (see HPUX-1653)"),
        bullet(
            "Fleet-scoped Recommendation Hub / AI Investigation Hub",
            "Impact score prioritization and Top Plans hero region",
            "Aggregated fleet Plan patterns across clusters",
            "Multi-domain inbox (ACS, Pipelines, GitOps drift, CVE)",
            "Multicluster apply / canary rollout UX",
        ),
    )


def hpux_1653_description():
    return doc(
        heading(2, "Description / Background info"),
        para(
            strong("Release horizon:"),
            text(" Post-5.0 north-star fleet experience — not OCP 5.0 tech preview. For shippable 5.0 scope, see "),
            link("HPUX-1643", "https://issues.redhat.com/browse/HPUX-1643"),
            text("."),
        ),
        para(
            text("Stakeholder feedback expanded the agentic troubleshooting strategy from alert-centric entry to a "),
            strong("plan-centric"),
            text(" model spanning the full fleet. Multi-domain operational signals — Prometheus alerts, pipeline failures, ACS violations, GitOps drift, CVE findings — spawn consolidated "),
            strong("Plans"),
            text("; each Plan may include one or more "),
            strong("Proposals"),
            text(" with sandboxed verification and human approval at every critical step."),
        ),
        para(
            text("This epic defines the "),
            strong("Recommendation / AI Investigation Hub"),
            text(" — the centralized, fleet-scoped home for autonomous agentic Plans — using a "),
            strong("hub-and-spoke"),
            text(" pattern:"),
        ),
        bullet(
            "Hub: macro visibility, impact prioritization, unified plan queue",
            "Spokes: contextual widgets on Alerting, Pipelines, ACS, and existing Investigation Hub flows (HPUX-1533)",
        ),
        para(
            text("Summit 2026: customers asked for prioritization by "),
            strong("real user impact"),
            text(" and "),
            strong("prod vs test environment"),
            text(" — not another flat alert list."),
        ),
        para(strong("Related artifacts")),
        bullet(
            "Concept deck: https://docs.google.com/presentation/d/1rzYTG1uxpkJ66dIWHEpOxL706x8i1f3C1Im0zRJZqms/edit",
            "Summit research: https://docs.google.com/document/d/1lriPFrreMq1d1qFiTNv0u-kEYfkaR8mWAKaSkstnqVo/edit",
            "Ju's fleet POC: https://github.com/julienlim/ocp-fleet-mgt-poc/tree/main/ocp-fleet-ui-concepts",
            "UX prototype (exploratory): ai-hub-autonomous-agentic-plans-mvp / ai-hub-v3",
        ),
        {"type": "rule"},
        heading(2, "Problem statement"),
        para(
            text("SREs, cluster administrators, and lead app developers operating OCP and RHACM fleets face cognitive overload from disconnected operational signals. Correlating alerts, pipeline failures, and security violations into actionable remediation is manual, slow, and error-prone. Without a unified plan-centric surface, users firefight symptoms cluster-by-cluster rather than authorizing validated, high-impact remediation strategies across the fleet."),
        ),
        heading(2, "Goals for the work"),
        bullet(
            "Define IA for the fleet-scoped Recommendation Hub (inbox + drilldown entry)",
            "Design split-tier Hub layout: inventory card, Plans KPI card, Top Impactful Plans, All Active Plans table",
            "Document Plan object model: trigger source, synopsis, status, aggregated fleet patterns",
            "Explore impact score / Top Plans prioritization UX",
            "Unify AI agent proposals and deterministic recommendations (Insights, fleet drift) in one inbox",
            "Support Fleet management and Core platform perspectives (same Proposal primitive, different scope lens)",
            "Define hub-and-spoke integration with domain consoles and 5.0 TP flows",
            "Validate assumptions with engineering (aggregation, sandboxing, impact scoring, RBAC)",
        ),
        heading(2, "Proposed Hub layout (split-tier)"),
        para(text("Header: Recommendation / AI Investigation Hub (fleet scope)")),
        para(text("Row 1: Fleet/Cluster Inventory card | Plans Overview KPI card (active, in sandbox, MTTR saved)")),
        para(text("Row 2: Top Impactful Plans — horizontal card row with Simulate and Drill Down actions")),
        para(text("Row 3: All Active Plans — sortable/filterable table (impact score, synopsis, trigger source, cluster, status, prod/sandbox env)")),
        heading(2, "Definition of done"),
        task_list(
            "Hub IA and Plan object model documented; eng assumptions register reviewed",
            "Hub inbox wireframes complete (inventory, KPI, top plans, plans table)",
            "Top Plans / impact score UX explored and documented",
            "Unified inbox pattern documented (AI + deterministic recs)",
            "Fleet vs Core perspective IA documented",
            "Hub drilldown and plan detail flows wireframed",
            "Hub-and-spoke integration map shared with HPUX-1532 / HPUX-1643 owners",
            "North-star prototype concepts available for stakeholder review",
            "Reviewed with Ju + eng; feedback incorporated",
            "Stakeholder sign-off on post-5.0 direction before epic closed",
        ),
        heading(2, "Out of scope"),
        bullet(
            "OCP 5.0 tech preview delivery (HPUX-1643)",
            "Engineering implementation of aggregation, sandbox execution, or impact scoring algorithms",
            "High-fidelity visual design / dev handoff (follow-on after wireframe validation)",
        ),
    )


CHILD_STORIES = [
    {
        "summary": "Post-5.0 — Hub IA, Plan object model, and eng assumptions register",
        "points": 3,
        "activity": "10318",  # Explore
        "labels": ["post-5.0", "UI", "UX", "applied-ai"],
        "description": doc(
            heading(1, "Goals for the work"),
            bullet(
                "Define Recommendation Hub IA: inbox as home surface, drilldown entry points, relationship to 5.0 TP queue (HPUX-1731)",
                "Document Plan fields: synopsis, trigger source, status (active / sandboxed / ready), cluster/fleet scope, prod vs sandbox env",
                "Document aggregated fleet Plan pattern (grouping identical alerts across clusters)",
                "Create eng assumptions register: aggregation logic, sandboxing boundaries, impact scoring, RBAC for approval, stale-plan re-validation",
            ),
            heading(1, "Definition of Done"),
            task_list(
                "Annotated IA diagram for Hub page hierarchy",
                "Plan object model UX spec (fields, states, aggregation rules)",
                "Assumptions register with open questions for Ju / OSL eng",
                "Reviewed in agentic weekly meeting",
            ),
        ),
    },
    {
        "summary": "Post-5.0 — Hub-and-spoke integration architecture",
        "points": 2,
        "activity": "10316",  # Consult
        "labels": ["post-5.0", "UX", "applied-ai"],
        "description": doc(
            heading(1, "Goals for the work"),
            bullet(
                "Map Hub ↔ per-alert widget (HPUX-1533) ↔ Investigation Hub ↔ 5.0 TP detail (HPUX-1643)",
                "Define shared Plan/Proposal object behavior across Hub and spokes (same approval mechanics, same status vocabulary)",
                "Identify entry points by domain: Alerting, Pipelines, ACS, GitOps, CVE / Insights",
            ),
            heading(1, "Definition of Done"),
            task_list(
                "Hub-and-spoke integration diagram (Miro/Figma/doc)",
                "Entry-point matrix: domain → trigger → plan creation → hub surfacing",
                "Shared UX principles doc (trust, transparency, human-in-the-loop)",
                "Shared with HPUX-1532 and HPUX-1643 owners",
            ),
        ),
    },
    {
        "summary": "Post-5.0 — Recommendation Hub inbox wireframes (inventory, KPI, plans table)",
        "points": 3,
        "activity": "10319",  # Make
        "labels": ["post-5.0", "UI", "UX", "applied-ai"],
        "description": doc(
            para(text("Depends on: Post-5.0 Hub IA story (create first under this epic).")),
            heading(1, "Goals for the work"),
            bullet(
                "Wireframe split-tier Hub layout per epic spec",
                "Row 1: Fleet/Cluster Inventory card + Plans Overview KPI card (active, in sandbox, MTTR saved)",
                "Row 3: All Active Plans table — sortable/filterable by impact score, trigger source, cluster, status, prod/sandbox env",
                "Align with prototype explorations: FleetInventoryBar, ActivePlansTable, DiagnosticsSummaryCard",
            ),
            heading(1, "Definition of Done"),
            task_list(
                "Low-fi wireframes for all three inbox regions (excluding Top Plans hero)",
                "Table column spec and filter model documented",
                "Wireframes linked in epic",
            ),
            heading(1, "Out of scope"),
            bullet(
                "Top Impactful Plans hero (separate story under this epic)",
                "Plan detail (separate story under this epic)",
            ),
        ),
    },
    {
        "summary": "Post-5.0 — Top Impactful Plans and impact score prioritization UX",
        "points": 3,
        "activity": "10319",
        "labels": ["post-5.0", "UI", "UX", "applied-ai"],
        "description": doc(
            heading(1, "Goals for the work"),
            bullet(
                "Design hero card row for AI-curated Top Plans (blast radius, clusters affected, domain)",
                "Explore impact score presentation and sorting (align with Summit: real user impact, prod vs test)",
                "Define Simulate and Drill Down actions from hero cards",
                "Document open questions for eng on impact quantification",
            ),
            heading(1, "Definition of Done"),
            task_list(
                "Wireframes for Top Plans hero region (1–3 cards + overflow pattern)",
                "Impact score UX spec with fallback if score unavailable",
                "Prioritization rationale visible to user (not black-box)",
            ),
        ),
    },
    {
        "summary": "Post-5.0 — Unified inbox: AI proposals + deterministic recommendations",
        "points": 2,
        "activity": "10318",
        "labels": ["post-5.0", "UX", "applied-ai"],
        "description": doc(
            heading(1, "Goals for the work"),
            bullet(
                "Define how AI agent Plans and deterministic recs (Insights, fleet drift, upgrade available) coexist in one queue",
                "Differentiate visually without fragmenting the inbox",
                "Document merge/split rules when signals correlate to the same underlying Plan",
            ),
            heading(1, "Definition of Done"),
            task_list(
                "Unified inbox pattern doc with examples (CVE, GitOps drift, alert-triggered plan)",
                "Wireframe notes or annotated examples in plans table",
                "Edge cases documented (duplicate plans, superseded recs)",
            ),
        ),
    },
    {
        "summary": "Post-5.0 — Fleet vs Core platform perspective switching",
        "points": 2,
        "activity": "10318",
        "labels": ["post-5.0", "UI", "UX", "applied-ai"],
        "description": doc(
            heading(1, "Goals for the work"),
            bullet(
                "Define IA for Fleet management vs Core platform lenses — same Proposal primitive, different scope",
                "Document what changes per perspective: inventory card, plan filtering, approval scope",
                "Align with existing prototype perspective switching in ai-hub-autonomous-agentic-plans-mvp",
            ),
            heading(1, "Definition of Done"),
            task_list(
                "Perspective-switching IA documented",
                "Side-by-side wireframe notes or annotated screenshots for both lenses",
                "Open questions for RHACM vs OCP console placement captured",
            ),
        ),
    },
    {
        "summary": "Post-5.0 — Hub drilldown to investigation entry flow",
        "points": 3,
        "activity": "10319",
        "labels": ["post-5.0", "UI", "UX", "applied-ai"],
        "description": doc(
            heading(1, "Goals for the work"),
            bullet(
                "Define user flow: plan row/card in Hub → investigation entry (not full Proposal execution)",
                "Breadcrumb and back-navigation patterns Hub ↔ detail",
                "Pre-flight re-validation indicator before Approve & Execute becomes active",
                "End at investigation entry; defer full Proposal review to plan detail story",
            ),
            heading(1, "Definition of Done"),
            task_list(
                "End-to-end flow diagram Hub → investigation entry",
                "Wireframes for drilldown transition and loading/re-validating states",
                "Explicit boundary documented vs plan detail + multi-proposal story",
            ),
        ),
    },
    {
        "summary": "Post-5.0 — Plan detail with multi-proposal review and sandbox path",
        "points": 5,
        "activity": "10319",
        "labels": ["post-5.0", "UI", "UX", "applied-ai"],
        "description": doc(
            heading(1, "Goals for the work"),
            bullet(
                "Design full-page plan detail for post-5.0: Declaration of Intent (root cause → intended change → blast radius)",
                "Multi-proposal review, compare, select, sandbox test path before apply",
                "Canary rollout UX for fleet plans (apply to Cluster A first, monitor, roll out)",
                "Extend — do not replace — 5.0 TP advisory-first detail (HPUX-1731)",
            ),
            heading(1, "Definition of Done"),
            task_list(
                "Wireframes for plan detail with 2+ Proposals",
                "DoI panel spec documented",
                "Sandbox test and canary rollout flows wireframed",
                "Reviewed with Ju; alignment note vs 5.0 TP detail",
            ),
        ),
    },
    {
        "summary": "Post-5.0 — Prototype north-star hub concepts in UX repo",
        "points": 3,
        "activity": "10319",
        "labels": ["post-5.0", "UI", "UX", "applied-ai"],
        "description": doc(
            heading(1, "Goals for the work"),
            bullet(
                "Implement exploratory prototype in ai-hub-autonomous-agentic-plans-mvp (ai-hub-v3) reflecting validated wireframes",
                "Demo-ready for stakeholder reviews (not eng handoff quality)",
                "Isolate from 5.0 TP prototype paths per prototype isolation rules",
            ),
            heading(1, "Definition of Done"),
            task_list(
                "Prototype route(s) for post-5.0 Hub inbox + Top Plans",
                "Prototype link in epic",
                "Walkthrough recorded or shared in agentic weekly meeting",
            ),
        ),
    },
]


def main():
    results = {"updated": [], "created": [], "errors": []}

    print("1. Updating HPUX-1643...")
    jira("PUT", "/issue/HPUX-1643", {
        "fields": {
            "summary": "Agentic Plan View — OCP 5.0 Tech Preview (proposals queue + investigation detail)",
            "description": hpux_1643_description(),
            "labels": ["5.0-tp", "problem-statement-data-driven"],
        }
    })
    results["updated"].append("HPUX-1643")

    print("2. Converting HPUX-1653 Story → Epic...")
    jira("PUT", "/issue/HPUX-1653", {
        "fields": {
            "issuetype": {"id": "10000"},
            "summary": "Post-5.0 — Recommendation Hub: fleet-scoped plan-centric AI Investigation Hub",
            "description": hpux_1653_description(),
            "labels": ["post-5.0", "UI", "UX", "applied-ai", "problem-statement-uxd-data-driven"],
            "components": [OBS_COMPONENT],
            "customfield_10014": None,
            "customfield_10028": None,
        }
    })
    results["updated"].append("HPUX-1653 (converted to Epic)")

    print("3. Linking HPUX-1653 relates to HPUX-1643...")
    jira("POST", "/issueLink", {
        "type": {"name": "Related"},
        "inwardIssue": {"key": "HPUX-1643"},
        "outwardIssue": {"key": "HPUX-1653"},
    })

    print("4. Creating child stories under HPUX-1653...")
    for story in CHILD_STORIES:
        payload = {
            "fields": {
                "project": {"key": "HPUX"},
                "issuetype": {"name": "Story"},
                "summary": story["summary"],
                "description": story["description"],
                "customfield_10014": "HPUX-1653",
                "customfield_10028": story["points"],
                "customfield_10464": {"id": story["activity"]},
                "labels": story["labels"],
                "components": [OBS_COMPONENT],
                "assignee": {"accountId": ASSIGNEE},
            }
        }
        created = jira("POST", "/issue", payload)
        results["created"].append({"key": created["key"], "summary": story["summary"], "points": story["points"]})
        print(f"   Created {created['key']}: {story['summary']}")

    print("5. Re-homing HPUX-1760 under HPUX-1653...")
    jira("PUT", "/issue/HPUX-1760", {"fields": {"customfield_10014": "HPUX-1653"}})
    results["updated"].append("HPUX-1760 (Epic Link → HPUX-1653)")

    print("6. Adding restructure comment to both epics...")
    comment = (
        "Epic restructure (Jun 2026): HPUX-1643 is now scoped to OCP 5.0 tech preview only. "
        "HPUX-1653 was promoted from Story to Epic for post-5.0 Recommendation Hub / AI Investigation Hub work. "
        "Child stories created under HPUX-1653; HPUX-1760 re-homed."
    )
    for key in ("HPUX-1643", "HPUX-1653"):
        jira("POST", f"/issue/{key}/comment", {
            "body": {
                "type": "doc",
                "version": 1,
                "content": [{"type": "paragraph", "content": [{"type": "text", "text": comment}]}],
            }
        })

    print("\n=== DONE ===")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()

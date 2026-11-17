# Kubernetes heals pods. *Operators* heal the application.

How the cluster takes on day-2 work that still lives in runbooks: failover, backup, upgrade, and scale for stateful software.

**Platform** · Aug 26, 2026
_Foday Kargbo · UX · Red Hat_

---

## Slide 1: Kubernetes heals pods. *Operators* heal the application.

How the cluster takes on day-2 work that still lives in runbooks: failover, backup, upgrade, and scale for stateful software.

- Operators
- CRDs
- Reconcile loop
- OLM

> Contextual notes: Tips: Arrow keys or click to navigate. Press N to toggle contextual notes. Works in any modern browser. Use fullscreen (F11) when presenting. This deck is Core Light, so Cmd/Ctrl+P Save as PDF keeps the white palette. The operator pattern was published by CoreOS in November 2016. Red Hat acquired CoreOS in 2018 and later contributed Operator Framework to CNCF (incubating, July 2020). [IMAGE OPPORTUNITY] Prompt for Nano Banana Pro 2: Abstract Kubernetes control loop on a light gray field. Thin dark-gray boxes for pods and a Custom Resource, one box outlined in Red Hat red-50 (#ee0000) labeled only by shape not text, arrows forming a closed reconcile cycle. No text in the image. Soft red glow upper-right. 16:9, print-friendly, no fedora, no logo.

---

## Slide 2: Day-1 is a YAML apply. Day-2 is still a page at 2am.

- **Install** is a Helm chart or a manifest. Most teams already have that.
- **Failover** for a three-node etcd or Postgres still needs a person who knows the quorum rules.
- **Upgrade** means drain order, replica lag, and a rollback path written in a doc.
- **Backup** is a CronJob someone copied from a gist, until the restore is tested in anger.

> Contextual notes: A Deployment restarts a crashed container. It does not reconfigure Patroni after a node loss, take a consistent Postgres backup, or run an etcd member replacement. Those steps sit in a wiki or a pager rotation. CoreOS named this gap in 2016: Kubernetes abstractions cover stateless replica sets well, and leave application-specific ops to humans. [VIDEO OPPORTUNITY] A 60-second clip of a human following a failover runbook (tmux, kubectl, Slack) would land the pain before the definition slide.

---

## Slide 3: 82% of container users run Kubernetes in production

**82%** of container users run Kubernetes in production, up from 66% in 2023.

The platform is settled. The remaining work is operating the databases, queues, and observability stacks that sit on it.

> Contextual notes: CNCF Annual Survey 2025 (published January 2026): among container users, 82% run Kubernetes in production, up from 66% in 2023. The same report calls Kubernetes 'boring' as praise: stable APIs, known failure modes. Once the platform is boring, the remaining cost is operating the software on top of it. Operator Framework is listed among incubating projects that grow as organizations mature Kubernetes operations.

**Source:** CNCF Annual Survey 2025 (Jan 2026) · https://www.cncf.io/wp-content/uploads/2026/01/CNCF_Annual_Survey_Report_final.pdf

---

## Slide 4: Charts stop after install. The operator keeps reconciling.

**Package: Helm chart / manifests**

- Renders YAML and applies it once
- Upgrade is another helm upgrade
- Drift after apply is your problem
- Domain knowledge stays in the runbook

**Operator: Controller in the cluster**

- Watches a Custom Resource for desired state
- Requeues until status matches spec
- Encodes failover, backup, and resize in code
- Users apply a CR, not a 40-step wiki

> Contextual notes: Helm remains the dominant Kubernetes package manager (CNCF 2024 survey: 75% preferred it). Charts are the right tool for templated install. They do not watch the live object after apply. A controller does: it requeues on events and compares spec to status until they match. That is the Kubernetes control-loop model, applied to one application. [MEME OPPORTUNITY] A 'deployed it, walked away' reaction image after this slide would release the tension before the definition.

---

## Slide 5: An operator is a controller that encodes one application's runbook.

- It extends the API with a **Custom Resource Definition** so desired state is an object, like a Deployment.
- A **controller** in the cluster watches that object and reconciles spec against live state.
- The difference from a generic controller is **domain knowledge**: quorum, backup, upgrade order, restore.

> Contextual notes: Original CoreOS definition (Brandon Philips, 2016): an Operator is an application-specific controller that extends the Kubernetes API to create, configure, and manage instances of complex stateful applications. It builds on resources and controllers, and adds domain knowledge. A ReplicaSet controller knows how to keep N pods. A Postgres operator knows how to keep a primary and two replicas, including WAL, membership, and backup. Archived post: https://web.archive.org/web/20191125171801/https://coreos.com/blog/introducing-operators.html

---

## Slide 6: Quote

> "What we're trying to do with Operators is to encode the operational knowledge people need to manage these distributed apps."
>: Brandon Philips, then CTO, CoreOS · The Register, Nov 2016

> Contextual notes: Quoted from Philips speaking to The Register on the November 2016 launch. CoreOS shipped etcd Operator and Prometheus Operator as the first public examples. Red Hat later built Operator SDK, Operator Lifecycle Manager, and OperatorHub on this pattern. Source: https://www.theregister.com/2016/11/03/hello_operator_automate_my_kubernetes/

---

## Slide 7: You put desired state on a Custom Resource. A loop makes it true.

1. **Custom Resource** (User): kind: Postgres · spec.replicas: 3 · spec.backup.schedule
2. **Controller / reconcile** (Operator): Watch events. Diff spec vs cluster. Create, patch, or delete owned objects.
3. **Owned resources** (Cluster): StatefulSet, Services, Secrets, PVCs, CronJobs for backup

> Contextual notes: Reconcile is the same loop Kubernetes uses internally: observe, diff, act, requeue. The CR is the user-facing API. The operator Pod holds the controller. Downstream objects (StatefulSet, Service, Secret, PVC) are owned via ownerReferences so garbage collection works. Status on the CR is how the operator reports progress (Ready, degraded, backup last-success). [VIDEO OPPORTUNITY] A short Operator SDK demo that scaffolds a project and shows the generated Reconcile() method would make this concrete.

---

## Slide 8: The user ships a CR. The operator owns the rest.

```yaml
apiVersion: example.com/v1
kind: Postgres
metadata:
  name: shop-db
spec:
  version: "16"
  replicas: 3
  storage: 200Gi
  backup:
    schedule: "0 2 * * *"
    retention: 14d
```

Three replicas, nightly backup, 14-day retention. Failover order is not in this file. That is the operator's job.

> Contextual notes: This CR is illustrative, not a live API. Production Postgres operators (Crunchy PGO, CloudNativePG, Zalando) each have their own CRDs. The point is the contract: the user edits spec, the operator owns implementation. CloudNativePG documents a similar Cluster spec with instances and backup. Resist stuffing install flags into the CR; keep spec at the level an SRE would speak.

---

## Slide 9: 22 operators on OperatorHub declare Auto Pilot

**22** operators on OperatorHub declare Auto Pilot, out of 447 listings.

Most of the catalog installs the software. A small set takes the pager: scale, heal, and tune without a human in the loop.

> Contextual notes: OperatorHub.io filter counts as of 26 Aug 2026: 447 items in the catalog. Capability filters: Basic Install 236, Upgrades 77, Full Lifecycle 67, Deep Insights 45, Auto Pilot 22. Filters overlap (an Auto Pilot operator also qualifies as Basic Install), so do not treat them as a partition of 447. The useful reading: most published operators stop at install. Few claim the full SRE loop. https://operatorhub.io/

**Source:** OperatorHub.io capability filters, 26 Aug 2026

---

## Slide 10: Capability levels mark how much of the runbook is in software.

- **L1 Basic Install**: Create, configure, and run the workload
- **L2 Upgrades**: Version upgrades with a rollback path and no data loss
- **L3 Full Lifecycle**: Backup, restore, failover, reconfigure, scale
- **L4 Deep Insights**: Metrics, alerts, and log analysis for that application
- **L5 Auto Pilot**: Autoscale, auto-heal, and tune without a ticket

> Contextual notes: Operator Framework capability levels are a self-declared maturity model, not a certification grade. Level 2 is published as automated upgrades (the framework name uses a marketing adjective this deck drops). Level 5 Auto Pilot covers horizontal/vertical scaling, auto-healing, and tuning. Use the levels when shopping: if you need tested backup/restore, look for Full Lifecycle, not Basic Install. Docs: https://sdk.operatorframework.io/docs/overview/operator-capabilities/

---

## Slide 11: Write Go when the logic is stateful. Helm or Ansible when a chart is enough.

- **Go.** Full control loop. Custom status, webhooks, and real failover code. Default when the application has a quorum.
- **Helm.** Chart as operator. Reconcile is helm template plus apply. Use when install and values-driven upgrade are the work.
- **Ansible.** Role as reconcile. CR events run playbooks. Use when the existing ops path is already Ansible.

> Contextual notes: Operator SDK project types: Go (kubebuilder-style, full client-go), Helm (wrap an existing chart; reconcile is helm upgrade), Ansible (watches CRs and runs roles). Java Operator SDK joined the framework in 2023. Pick Go when the reconcile body is real control logic (membership, fencing, split-brain). Pick Helm when you already ship a chart and want OLM packaging. Pick Ansible when the runbook is already playbooks. https://sdk.operatorframework.io/

---

## Slide 12: Start with the service that still needs a human at 2am.

- Search **OperatorHub** for that service. Prefer Full Lifecycle over Basic Install.
- If a fit exists, install it with **OLM** and treat the CR as the new runbook.
- If the catalog is thin, scaffold with **operator-sdk** and encode the first failover path only.

operatorhub.io · olm.operatorframework.io · sdk.operatorframework.io

> Contextual notes: OperatorHub.io is the public OLM catalog (community-operators on GitHub). OLM installs, upgrades, and resolves dependencies for operators on the cluster. OpenShift includes OLM by default; vanilla Kubernetes can install it. Next step is concrete: pick the service that still needs a human, check whether a Full Lifecycle operator exists, then either install it or scaffold the first reconcile for failover only. Resist boiling the ocean at L5 on day one. https://operatorhub.io/ · https://olm.operatorframework.io/

---

## Slide 13: Thank You

Foday Kargbo · UX · Red Hat
fkargbo@redhat.com

> Contextual notes: Closing. Optional follow-ups: Operator SDK getting-started, CloudNativePG or Crunchy PGO as a Postgres case study, OLM CatalogSource on vanilla Kubernetes.

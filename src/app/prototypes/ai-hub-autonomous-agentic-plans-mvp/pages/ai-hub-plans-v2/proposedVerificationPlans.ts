/** Read-only commands proposed for each mock run before verification is approved. */
export const PROPOSED_VERIFICATION_COMMANDS: Record<string, readonly [string, string]> = {
  tp1: ['oc get applicationsets -A', 'oc get networkpolicies -A'],
  tp2: ['oc get deployment payment-api -n payments-prod -o yaml', 'oc get networkpolicies -n payments-prod'],
  tp3: ['oc adm top pods -n payments-prod', 'oc get pods -n payments-prod -o wide'],
  tp4: ['oc get pvc -A', 'oc get pods -n openshift-storage -o wide'],
  tp5: ['oc get etcd cluster -o yaml', 'oc get clusteroperators kube-apiserver etcd'],
  cp1: ['oc get clusterversion version -o yaml', 'oc get clusteroperators -o wide'],
  cp2: ['oc get clusterversion version -o yaml', 'oc get clusteroperators -o wide'],
  cp4: ['oc get clusterversion version -o yaml', 'oc get nodes -o wide'],
  ap1: ['oc adm top pods -n app-analytics-dev', 'oc get pods -n app-analytics-dev -o wide'],
  ap2: ['oc get eventlisteners -n openshift-pipelines', 'oc get pods -n openshift-pipelines -o wide'],
  ap3: ['oc get secrets -n openshift-authentication', 'oc get pods -n openshift-authentication -o wide'],
  ap4: ['oc get pods -n openshift-dns -o wide', 'oc get dns.operator.openshift.io default -o yaml'],
  ap5: ['oc get baremetalhosts -A', 'oc get nodes -o wide'],
  ap6: ['oc get configmaps -n app-staging', 'oc get applications -A'],
  ap7: ['oc get ingresscontrollers -n openshift-ingress-operator', 'oc get pods -n openshift-ingress -o wide'],
  ap8: ['oc get deployments -n retail-prod -o yaml', 'oc get networkpolicies -n retail-prod'],
  ap9: ['oc get nodes -o wide', 'oc get events -A --sort-by=.lastTimestamp'],
  ap10: ['oc get pods -n ci-cd -l app=jenkins', 'oc get deployments -n ci-cd -l app=jenkins'],
  ap11: ['oc get hpa -n api-services', 'oc get apiservices -o wide'],
  ap12: ['oc get image.config.openshift.io cluster -o yaml', 'oc get pods -n openshift-image-registry -o wide'],
  ap13: ['oc get pvc -n data-services', 'oc get storageclasses -o wide'],
  ap14: ['oc get nodes -o wide', 'oc get machineconfigs -o wide'],
  ap15: ['oc get imagestreams -n openshift-image-registry', 'oc get cronjobs -n openshift-image-registry'],
  op1: ['oc get servicemonitors -A', 'oc get pods -n openshift-monitoring -l app.kubernetes.io/name=prometheus'],
  op2: [
    "oc get secret alertmanager-main -n openshift-monitoring -o jsonpath='{.metadata.resourceVersion}'",
    'oc get pods -n openshift-monitoring -l app.kubernetes.io/name=alertmanager',
  ],
  op3: ['oc get pvc -n openshift-monitoring', 'oc get pods -n openshift-monitoring -l app.kubernetes.io/name=thanos-compactor'],
  op4: [
    'oc get deployments -n openshift-opentelemetry-operator -l app.kubernetes.io/name=otel-collector',
    'oc get pods -n openshift-opentelemetry-operator -l app.kubernetes.io/name=otel-collector',
  ],
  op5: ['oc get pvc -n openshift-monitoring', 'oc get pods -n openshift-monitoring -l app=perses'],
  'certmgr-renewal-pending': [
    'oc get certificate ingress-tls -n cert-manager -o yaml',
    "oc get secret ingress-tls -n cert-manager -o jsonpath='{.metadata.creationTimestamp}'",
  ],
  'acs-netpol-remediation-denied': ['oc get networkpolicies -n retail-prod', 'oc get deployments -n retail-prod -o wide'],
  'quota-exhaustion-escalating': ['oc get resourcequotas -n openshift-ingress', 'oc get events -n openshift-ingress --sort-by=.lastTimestamp'],
  'ingress-controller-escalated': ['oc get ingresscontrollers -n openshift-ingress-operator', 'oc get pods -n openshift-ingress -o wide'],
  'prometheus-wal-emergency-stopped': [
    'oc get pods -n openshift-monitoring -l app.kubernetes.io/name=prometheus',
    'oc get pvc -n openshift-monitoring',
  ],
  'etcd-defrag-failed': ['oc get etcd cluster -o yaml', 'oc get clusteroperator etcd -o yaml'],
  'op5-manual-escalation': ['oc get pvc -n openshift-monitoring', 'oc get pods -n openshift-monitoring -l app=grafana'],
  'inv-alert-node-not-ready': ['oc get nodes -o wide', 'oc describe node worker-02'],
  'inv-alert-mds-cache-high': ['oc get pods -n openshift-storage -l app=rook-ceph-mds', 'oc get pvc -n openshift-storage'],
  'inv-alert-vm-cannot-evict': ['oc get virtualmachines -A', 'oc get poddisruptionbudgets -A'],
  'inv-alert-node-cpu-high': ['oc adm top nodes', 'oc get pods -A -o wide'],
};

const DOMAIN_FALLBACK_COMMANDS: Record<string, readonly [string, string]> = {
  Storage: ['oc get pvc -A', 'oc get pods -A -o wide'],
  Network: ['oc get networkpolicies -A', 'oc get pods -n openshift-ingress -o wide'],
  Security: ['oc get certificates -A', 'oc get networkpolicies -A'],
  Compute: ['oc get nodes -o wide', 'oc adm top pods -A'],
  'Cluster update': ['oc get clusterversion version -o yaml', 'oc get clusteroperators -o wide'],
  Prometheus: ['oc get servicemonitors -A', 'oc get pods -n openshift-monitoring -o wide'],
};

type VerificationPlanSource = {
  id: string;
  synopsis: string;
  triggerDomain: string;
};

export function buildProposedVerificationScript(plan: VerificationPlanSource): string {
  const commands = PROPOSED_VERIFICATION_COMMANDS[plan.id]
    ?? DOMAIN_FALLBACK_COMMANDS[plan.triggerDomain]
    ?? ['oc get pods -A -o wide', 'oc get events -A --sort-by=.lastTimestamp'];
  return [
    '#!/usr/bin/env bash',
    '# Proposed Verification Plan',
    `# Will validate: ${plan.synopsis.replace(/\s+/g, ' ').trim()}`,
    ...commands,
  ].join('\n');
}

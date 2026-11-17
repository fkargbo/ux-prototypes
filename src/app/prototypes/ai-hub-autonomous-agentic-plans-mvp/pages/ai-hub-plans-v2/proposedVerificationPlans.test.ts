import { MVP_PLAN_IDS } from './plansMvpConstants';
import { PROPOSED_VERIFICATION_COMMANDS, buildProposedVerificationScript } from './proposedVerificationPlans';

test('all listed agentic runs have contextual, read-only proposed verification commands', () => {
  expect(Object.keys(PROPOSED_VERIFICATION_COMMANDS)).toHaveLength(39);
  for (const id of MVP_PLAN_IDS) {
    expect(PROPOSED_VERIFICATION_COMMANDS[id]).toHaveLength(2);
  }
  for (const commands of Object.values(PROPOSED_VERIFICATION_COMMANDS)) {
    for (const command of commands) {
      expect(command).toMatch(/^oc (?:get|describe|adm top) /);
      expect(command).not.toMatch(/\b(?:apply|delete|patch|replace|restart|rollout|scale|exec|rsh)\b/i);
    }
  }
});

test('formats the TLS renewal verification plan as a proposed bash script', () => {
  const script = buildProposedVerificationScript({
    id: 'certmgr-renewal-pending',
    synopsis: 'Renew ingress TLS certificate',
    triggerDomain: 'Security',
  });
  expect(script).toContain('# Proposed Verification Plan');
  expect(script).toContain('# Will validate: Renew ingress TLS certificate');
  expect(script).toContain('oc get certificate ingress-tls -n cert-manager');
  expect(script).not.toMatch(/Checking|cleared|healthy|verified/i);
});

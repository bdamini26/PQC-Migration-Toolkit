// PQC Migration Audit — offline dashboard logic
// Runs entirely client-side. No data leaves the browser.

const els = {
  datasetStatus: document.getElementById('datasetStatus'),
  controlLabel: document.querySelector('.control-label'),
  metaAuditId: document.getElementById('metaAuditId'),
  metaBuild: document.getElementById('metaBuild'),
  statCritical: document.getElementById('statCritical'),
  statHigh: document.getElementById('statHigh'),
  statMigratedRisk: document.getElementById('statMigratedRisk'),
  statMigratedKeys: document.getElementById('statMigratedKeys'),
  riskTableBody: document.getElementById('riskTableBody'),
  migratedTableBody: document.getElementById('migratedTableBody'),
  fileInput: document.getElementById('fileInput'),
  loadSampleBtn: document.getElementById('loadSampleBtn'),
  resetBtn: document.getElementById('resetBtn'),
};

const statCards = {
  critical: document.querySelector('.stat-card.critical'),
  high: document.querySelector('.stat-card.high'),
  migratedRisk: document.querySelector('.stat-card.migrated-risk'),
  migratedKeys: document.querySelector('.stat-card.migrated-keys'),
};

function riskBadge(level){
  const cls = (level || '').toLowerCase();
  const label = cls ? cls.toUpperCase() : 'UNKNOWN';
  return `<span class="badge ${cls}">${label}</span>`;
}

function renderEmptyState(){
  els.datasetStatus.textContent =
    'No audit dataset loaded — showing empty state. Import the JSON file (import_audit_report.json) to populate this view.';
  els.controlLabel.classList.remove('active');
  els.metaAuditId.textContent = '—';
  els.metaBuild.textContent = '—';

  els.statCritical.textContent = '0';
  els.statHigh.textContent = '0';
  els.statMigratedRisk.textContent = '0';
  els.statMigratedKeys.textContent = '0';
  Object.values(statCards).forEach(c => c.classList.remove('has-value'));

  els.riskTableBody.innerHTML =
    `<tr class="empty-row"><td colspan="6">No keys scanned yet. Load or import an audit session to populate this table.</td></tr>`;
  els.migratedTableBody.innerHTML =
    `<tr class="empty-row"><td colspan="4">No keys migrated yet. Run the migration engine, then import its output to populate this table.</td></tr>`;
}

function renderData(data){
  const scanned = data.scanned_keys || [];
  const migrated = data.migrated_keys || [];
  const migratedFiles = new Set(migrated.map(m => m.key_file));

  const criticalCount = scanned.filter(k => (k.risk_level || '').toLowerCase() === 'critical').length;
  const highCount = scanned.filter(k => (k.risk_level || '').toLowerCase() === 'high').length;
  const migratedRiskCount = scanned.filter(k => migratedFiles.has(k.key_file)).length;
  const migratedKeysCount = migrated.length;

  els.metaAuditId.textContent = data.audit_id || '—';
  els.metaBuild.textContent = data.build || '—';

  els.controlLabel.classList.add('active');
  els.datasetStatus.textContent =
    `Audit dataset loaded (${data.audit_id || 'unknown session'}) — ${scanned.length} key(s) scanned, ${migrated.length} migrated.`;

  els.statCritical.textContent = criticalCount;
  els.statHigh.textContent = highCount;
  els.statMigratedRisk.textContent = migratedRiskCount;
  els.statMigratedKeys.textContent = migratedKeysCount;

  statCards.critical.classList.toggle('has-value', criticalCount > 0);
  statCards.high.classList.toggle('has-value', highCount > 0);
  statCards.migratedRisk.classList.toggle('has-value', migratedRiskCount > 0);
  statCards.migratedKeys.classList.toggle('has-value', migratedKeysCount > 0);

  if (scanned.length === 0){
    els.riskTableBody.innerHTML =
      `<tr class="empty-row"><td colspan="6">No keys scanned yet. Load or import an audit session to populate this table.</td></tr>`;
  } else {
    els.riskTableBody.innerHTML = scanned.map(k => `
      <tr>
        <td>${k.key_file ?? ''}</td>
        <td>${k.algorithm ?? ''}</td>
        <td>${k.key_size ?? ''}</td>
        <td>${k.est_upgrade ?? ''}</td>
        <td>${riskBadge(k.risk_level)}</td>
        <td>${k.pqc_ready ? '<span class="check-yes">YES</span>' : '<span class="check-no">NO</span>'}</td>
      </tr>
    `).join('');
  }

  if (migrated.length === 0){
    els.migratedTableBody.innerHTML =
      `<tr class="empty-row"><td colspan="4">No keys migrated yet. Run the migration engine, then import its output to populate this table.</td></tr>`;
  } else {
    els.migratedTableBody.innerHTML = migrated.map(m => `
      <tr>
        <td>${m.key_file ?? ''}</td>
        <td>${m.kem_scheme ?? ''}</td>
        <td>${m.signature_scheme ?? ''}</td>
        <td>${m.key_fingerprint ?? ''}</td>
      </tr>
    `).join('');
  }
}

// Embedded copy of the sample dataset so "Load Sample" works even
// when this page is opened directly from disk (file://) with no server.
const EMBEDDED_SAMPLE = {
  "audit_id": "AUD-2026-0728",
  "build": "1.4.2",
  "generated_at": "2026-07-28T21:40:00Z",
  "scanned_keys": [
    { "key_file": "server_id_rsa1024.pem", "algorithm": "RSA-1024", "key_size": 1024, "est_upgrade": "Immediate", "risk_level": "critical", "pqc_ready": false },
    { "key_file": "legacy_vpn_rsa1024.key", "algorithm": "RSA-1024", "key_size": 1024, "est_upgrade": "Immediate", "risk_level": "critical", "pqc_ready": false },
    { "key_file": "web_tls_rsa2048.pem", "algorithm": "RSA-2048", "key_size": 2048, "est_upgrade": "30 days", "risk_level": "high", "pqc_ready": false },
    { "key_file": "api_gateway_rsa2048.key", "algorithm": "RSA-2048", "key_size": 2048, "est_upgrade": "30 days", "risk_level": "high", "pqc_ready": false },
    { "key_file": "device_auth_ecc_p256.pem", "algorithm": "ECC P-256", "key_size": 256, "est_upgrade": "60 days", "risk_level": "medium", "pqc_ready": false },
    { "key_file": "signing_key_ecc_p256.key", "algorithm": "ECC P-256", "key_size": 256, "est_upgrade": "60 days", "risk_level": "medium", "pqc_ready": false },
    { "key_file": "backup_master_rsa2048.pem", "algorithm": "RSA-2048", "key_size": 2048, "est_upgrade": "30 days", "risk_level": "high", "pqc_ready": false }
  ],
  "migrated_keys": [
    { "key_file": "web_tls_rsa2048.pem", "kem_scheme": "Kyber768", "signature_scheme": "Dilithium3", "key_fingerprint": "6c9a1f0e2b7d4c53" },
    { "key_file": "api_gateway_rsa2048.key", "kem_scheme": "Kyber768", "signature_scheme": "Dilithium3", "key_fingerprint": "a12e884fd90b3c61" },
    { "key_file": "device_auth_ecc_p256.pem", "kem_scheme": "Kyber512", "signature_scheme": "Dilithium2", "key_fingerprint": "3f7c2a9e1d5b8067" }
  ]
};

els.fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try{
      const data = JSON.parse(evt.target.result);
      renderData(data);
    }catch(err){
      alert('Could not parse that file as JSON audit data:\n' + err.message);
    }
  };
  reader.readAsText(file);
});

els.loadSampleBtn.addEventListener('click', () => {
  // Try fetching the on-disk sample first (works when served over http://),
  // fall back to the embedded copy (works when opened via file://).
  fetch('data/import_audit_report.json')
    .then(r => { if(!r.ok) throw new Error('no server'); return r.json(); })
    .then(renderData)
    .catch(() => renderData(EMBEDDED_SAMPLE));
});

els.resetBtn.addEventListener('click', renderEmptyState);

// Start in the empty state, exactly like the reference screenshot.
renderEmptyState();

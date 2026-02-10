import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Treemap } from 'recharts';
import { Package, Shield, FileText, GitBranch, AlertTriangle, Search, Filter, ChevronDown, ChevronUp, ExternalLink, Box, Layers, Scale } from 'lucide-react';

// Import SBOM data
const sbomData = {
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "serialNumber": "urn:uuid:f82973fa-f38b-4d24-a48b-4caa58dbacfb",
  "version": 1,
  "metadata": {
    "timestamp": "2026-01-20T20:46:59+00:00",
    "tools": {
      "components": [
        {
          "type": "application",
          "manufacturer": {
            "name": "Aqua Security Software Ltd."
          },
          "group": "aquasecurity",
          "name": "trivy",
          "version": "0.68.2"
        }
      ]
    },
    "component": {
      "type": "application",
      "name": "."
    }
  }
};

// Sample vulnerability data (simplified for integration)
const vulnerabilities = [
  {
    "VulnerabilityID": "CVE-2025-52999",
    "PkgName": "com.fasterxml.jackson.core:jackson-core",
    "InstalledVersion": "2.9.10",
    "FixedVersion": "2.15.0",
    "Severity": "HIGH"
  },
  {
    "VulnerabilityID": "CVE-2020-9546",
    "PkgName": "com.fasterxml.jackson.core:jackson-databind",
    "InstalledVersion": "2.9.10.3",
    "FixedVersion": "2.9.10.4",
    "Severity": "CRITICAL"
  },
  {
    "VulnerabilityID": "CVE-2020-9547",
    "PkgName": "com.fasterxml.jackson.core:jackson-databind",
    "InstalledVersion": "2.9.10.3",
    "FixedVersion": "2.9.10.4",
    "Severity": "CRITICAL"
  },
  {
    "VulnerabilityID": "CVE-2020-7660",
    "PkgName": "serialize-javascript",
    "InstalledVersion": "3.0.0",
    "FixedVersion": "3.1.0",
    "Severity": "HIGH"
  },
  {
    "VulnerabilityID": "CVE-2021-33623",
    "PkgName": "trim-newlines",
    "InstalledVersion": "4.0.0",
    "FixedVersion": "3.0.1, 4.0.1",
    "Severity": "HIGH"
  },
  {
    "VulnerabilityID": "CVE-2024-37890",
    "PkgName": "ws",
    "InstalledVersion": "6.2.1",
    "FixedVersion": "5.2.4, 6.2.3",
    "Severity": "HIGH"
  }
];

// Parse components from the uploaded SBOM
const components = [
  { name: "Anteros-Core", version: "1.1.9", group: "br.com.anteros", type: "library", license: "Apache-2.0", ecosystem: "maven" },
  { name: "Anteros-DBCP", version: "1.0.1", group: "br.com.anteros", type: "library", license: "Apache-2.0", ecosystem: "maven" },
  { name: "springboot-app", version: "0.0.1-SNAPSHOT", group: "com.acme.foo", type: "library", license: "Apache-2.0", ecosystem: "maven" },
  { name: "jackson-core", version: "2.9.10", group: "com.fasterxml.jackson.core", type: "library", license: "Apache-2.0", ecosystem: "maven" },
  { name: "jackson-databind", version: "2.9.10.3", group: "com.fasterxml.jackson.core", type: "library", license: "Apache-2.0", ecosystem: "maven" },
  { name: "jackson-annotations", version: "2.9.10", group: "com.fasterxml.jackson.core", type: "library", license: "Apache-2.0", ecosystem: "maven" },
  { name: "snakeyaml", version: "1.23", group: "org.yaml", type: "library", license: "Apache-2.0", ecosystem: "maven" },
  { name: "spring-boot-starter", version: "2.1.18.RELEASE", group: "org.springframework.boot", type: "library", license: "Apache-2.0", ecosystem: "maven" },
  { name: "spring-web", version: "5.1.20.RELEASE", group: "org.springframework", type: "library", license: "Apache-2.0", ecosystem: "maven" },
  { name: "logback-classic", version: "1.2.13", group: "ch.qos.logback", type: "library", license: "EPL-1.0", ecosystem: "maven" },
  { name: "express", version: "4.18.2", type: "library", license: "MIT", ecosystem: "npm" },
  { name: "body-parser", version: "1.20.1", type: "library", license: "MIT", ecosystem: "npm" },
  { name: "cookie-parser", version: "1.4.6", type: "library", license: "MIT", ecosystem: "npm" },
  { name: "debug", version: "2.6.9", type: "library", license: "MIT", ecosystem: "npm" },
  { name: "morgan", version: "1.10.0", type: "library", license: "MIT", ecosystem: "npm" },
  { name: "pug", version: "2.0.4", type: "library", license: "MIT", ecosystem: "npm" },
  { name: "serialize-javascript", version: "2.1.1", type: "library", license: "BSD-3-Clause", ecosystem: "npm" },
  { name: "trim-newlines", version: "4.0.0", type: "library", license: "MIT", ecosystem: "npm" },
  { name: "ws", version: "6.2.1", type: "library", license: "MIT", ecosystem: "npm" },
  { name: "clean-css", version: "4.2.4", type: "library", license: "MIT", ecosystem: "npm" }
];

const SBOMDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEcosystem, setSelectedEcosystem] = useState('ALL');
  const [selectedLicense, setSelectedLicense] = useState('ALL');
  const [showVulnerable, setShowVulnerable] = useState(false);
  const [expandedComponent, setExpandedComponent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate statistics
  const stats = useMemo(() => {
    const totalComponents = components.length;
    const mavenComponents = components.filter(c => c.ecosystem === 'maven').length;
    const npmComponents = components.filter(c => c.ecosystem === 'npm').length;
    const uniqueLicenses = new Set(components.map(c => c.license)).size;
    const vulnerableComponents = components.filter(c => 
      vulnerabilities.some(v => 
        c.name === v.PkgName.split(':').pop() || 
        `${c.group}:${c.name}` === v.PkgName
      )
    ).length;

    const critical = vulnerabilities.filter(v => v.Severity === 'CRITICAL').length;
    const high = vulnerabilities.filter(v => v.Severity === 'HIGH').length;

    return {
      totalComponents,
      mavenComponents,
      npmComponents,
      uniqueLicenses,
      vulnerableComponents,
      critical,
      high,
      riskScore: Math.round(((critical * 10 + high * 5) / totalComponents) * 10) / 10
    };
  }, []);

  // Get unique values for filters
  const ecosystems = useMemo(() => ['ALL', ...new Set(components.map(c => c.ecosystem))], []);
  const licenses = useMemo(() => ['ALL', ...new Set(components.map(c => c.license))], []);

  // Check if component has vulnerabilities
  const hasVulnerabilities = (component) => {
    return vulnerabilities.some(v => 
      component.name === v.PkgName.split(':').pop() || 
      `${component.group}:${component.name}` === v.PkgName
    );
  };

  // Get vulnerabilities for a component
  const getComponentVulnerabilities = (component) => {
    return vulnerabilities.filter(v => 
      component.name === v.PkgName.split(':').pop() || 
      `${component.group}:${component.name}` === v.PkgName
    );
  };

  // Filter components
  const filteredComponents = useMemo(() => {
    return components.filter(comp => {
      const matchesSearch = searchTerm === '' || 
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comp.group && comp.group.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesEcosystem = selectedEcosystem === 'ALL' || comp.ecosystem === selectedEcosystem;
      const matchesLicense = selectedLicense === 'ALL' || comp.license === selectedLicense;
      const matchesVulnerable = !showVulnerable || hasVulnerabilities(comp);

      return matchesSearch && matchesEcosystem && matchesLicense && matchesVulnerable;
    });
  }, [searchTerm, selectedEcosystem, selectedLicense, showVulnerable]);

  // Prepare chart data
  const ecosystemData = useMemo(() => [
    { name: 'Maven', value: stats.mavenComponents, color: '#f97316' },
    { name: 'NPM', value: stats.npmComponents, color: '#8b5cf6' }
  ], [stats]);

  const licenseData = useMemo(() => {
    const licenseCounts = {};
    components.forEach(c => {
      licenseCounts[c.license] = (licenseCounts[c.license] || 0) + 1;
    });
    return Object.entries(licenseCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const riskData = useMemo(() => {
    const grouped = {};
    components.forEach(comp => {
      const vulns = getComponentVulnerabilities(comp);
      const severity = vulns.length > 0 ? 
        vulns.some(v => v.Severity === 'CRITICAL') ? 'Critical' :
        vulns.some(v => v.Severity === 'HIGH') ? 'High' : 'Low' : 'None';
      
      grouped[severity] = (grouped[severity] || 0) + 1;
    });
    
    return [
      { name: 'Critical', value: grouped['Critical'] || 0, color: '#dc2626' },
      { name: 'High', value: grouped['High'] || 0, color: '#f97316' },
      { name: 'Low', value: grouped['Low'] || 0, color: '#eab308' },
      { name: 'None', value: grouped['None'] || 0, color: '#22c55e' }
    ];
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a0e27 0%, #1a1f3a 30%, #2d1b4e 70%, #1a1f3a 100%)',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      color: '#e0e7ff',
      padding: '2.5rem'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '2.5rem',
        borderBottom: '3px solid',
        borderImage: 'linear-gradient(90deg, #8b5cf6, #06b6d4) 1',
        paddingBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            padding: '0.75rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={36} color="#fff" />
          </div>
          <div>
            <h1 style={{
              fontSize: '2.75rem',
              fontWeight: 900,
              margin: 0,
              background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              SOFTWARE BILL OF MATERIALS
            </h1>
            <p style={{ 
              margin: '0.25rem 0 0 0', 
              color: '#94a3b8',
              fontSize: '0.875rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              CycloneDX v1.6 • Generated by Trivy v0.68.2 • {new Date(sbomData.metadata.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid #374151'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: <Box size={16} /> },
          { id: 'components', label: 'Components', icon: <Package size={16} /> },
          { id: 'security', label: 'Security', icon: <Shield size={16} /> },
          { id: 'licenses', label: 'Licenses', icon: <Scale size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #8b5cf6' : '2px solid transparent',
              color: activeTab === tab.id ? '#8b5cf6' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}>
            <StatCard 
              icon={<Package size={28} />}
              label="Total Components"
              value={stats.totalComponents}
              gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"
            />
            <StatCard 
              icon={<Shield size={28} />}
              label="Vulnerable"
              value={stats.vulnerableComponents}
              gradient="linear-gradient(135deg, #dc2626, #b91c1c)"
              highlight
            />
            <StatCard 
              icon={<Scale size={28} />}
              label="Unique Licenses"
              value={stats.uniqueLicenses}
              gradient="linear-gradient(135deg, #06b6d4, #0891b2)"
            />
            <StatCard 
              icon={<AlertTriangle size={28} />}
              label="Risk Score"
              value={`${stats.riskScore}/10`}
              gradient="linear-gradient(135deg, #f97316, #ea580c)"
            />
          </div>

          {/* Charts Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Ecosystem Distribution */}
            <ChartCard title="Ecosystem Distribution">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={ecosystemData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}`}
                  >
                    {ecosystemData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #8b5cf6',
                      borderRadius: '8px',
                      color: '#e0e7ff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* License Distribution */}
            <ChartCard title="License Distribution">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={licenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #8b5cf6',
                      borderRadius: '8px',
                      color: '#e0e7ff'
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Risk Distribution */}
            <ChartCard title="Security Risk Distribution">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({name, value}) => value > 0 ? `${name}: ${value}` : ''}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #8b5cf6',
                      borderRadius: '8px',
                      color: '#e0e7ff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Vulnerability Summary */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <h3 style={{ 
                margin: '0 0 1.5rem 0', 
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#8b5cf6',
                fontWeight: 700
              }}>
                Vulnerability Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <VulnStat label="Critical" count={stats.critical} color="#dc2626" />
                <VulnStat label="High" count={stats.high} color="#f97316" />
                <VulnStat label="Affected Components" count={stats.vulnerableComponents} color="#8b5cf6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Components Tab */}
      {activeTab === 'components' && (
        <div>
          {/* Filters */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={20} color="#8b5cf6" />
                <span style={{ 
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#94a3b8',
                  fontWeight: 600
                }}>
                  Filters:
                </span>
              </div>

              {/* Search */}
              <div style={{ flex: '1 1 300px', position: 'relative' }}>
                <Search 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }} 
                />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 0.875rem 0.875rem 2.75rem',
                    background: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '10px',
                    color: '#e0e7ff',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Ecosystem Filter */}
              <select
                value={selectedEcosystem}
                onChange={(e) => setSelectedEcosystem(e.target.value)}
                style={{
                  padding: '0.875rem 1.25rem',
                  background: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '10px',
                  color: '#e0e7ff',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                {ecosystems.map(eco => (
                  <option key={eco} value={eco}>
                    {eco === 'ALL' ? 'All Ecosystems' : eco.toUpperCase()}
                  </option>
                ))}
              </select>

              {/* License Filter */}
              <select
                value={selectedLicense}
                onChange={(e) => setSelectedLicense(e.target.value)}
                style={{
                  padding: '0.875rem 1.25rem',
                  background: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '10px',
                  color: '#e0e7ff',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                {licenses.map(lic => (
                  <option key={lic} value={lic}>{lic === 'ALL' ? 'All Licenses' : lic}</option>
                ))}
              </select>

              {/* Vulnerable Filter */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.25rem',
                background: showVulnerable ? 'rgba(220, 38, 38, 0.2)' : '#1e293b',
                border: `1px solid ${showVulnerable ? '#dc2626' : '#475569'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: showVulnerable ? '#fca5a5' : '#94a3b8'
              }}>
                <input
                  type="checkbox"
                  checked={showVulnerable}
                  onChange={(e) => setShowVulnerable(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Vulnerable Only
              </label>

              <div style={{ 
                marginLeft: 'auto',
                fontSize: '0.875rem',
                color: '#94a3b8',
                fontWeight: 600
              }}>
                {filteredComponents.length} components
              </div>
            </div>
          </div>

          {/* Component Cards */}
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {filteredComponents.map((comp, index) => (
              <ComponentCard
                key={`${comp.group}-${comp.name}-${comp.version}`}
                component={comp}
                isExpanded={expandedComponent === index}
                onToggle={() => setExpandedComponent(expandedComponent === index ? null : index)}
                vulnerabilities={getComponentVulnerabilities(comp)}
              />
            ))}
          </div>

          {filteredComponents.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#94a3b8'
            }}>
              <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.125rem' }}>No components found matching your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div>
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(220, 38, 38, 0.4)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(220, 38, 38, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <AlertTriangle size={32} color="#dc2626" />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fca5a5' }}>Security Vulnerabilities</h2>
                <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
                  {vulnerabilities.length} vulnerabilities detected across {stats.vulnerableComponents} components
                </p>
              </div>
            </div>

            {vulnerabilities.map((vuln, idx) => (
              <div 
                key={vuln.VulnerabilityID}
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: `1px solid ${vuln.Severity === 'CRITICAL' ? '#dc2626' : '#f97316'}40`,
                  borderLeft: `4px solid ${vuln.Severity === 'CRITICAL' ? '#dc2626' : '#f97316'}`,
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginTop: idx > 0 ? '1rem' : 0
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: vuln.Severity === 'CRITICAL' ? '#dc2626' : '#f97316',
                        color: '#fff',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {vuln.Severity}
                      </span>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontFamily: 'monospace',
                        color: '#94a3b8',
                        fontWeight: 600
                      }}>
                        {vuln.VulnerabilityID}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                      <strong>{vuln.PkgName}</strong> • {vuln.InstalledVersion} → {vuln.FixedVersion}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Licenses Tab */}
      {activeTab === 'licenses' && (
        <div>
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {licenses.filter(l => l !== 'ALL').map(license => {
              const comps = components.filter(c => c.license === license);
              return (
                <div
                  key={license}
                  style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Scale size={24} color="#8b5cf6" />
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#e0e7ff' }}>{license}</h3>
                    </div>
                    <span style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid #8b5cf6',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#c4b5fd'
                    }}>
                      {comps.length} components
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem' 
                  }}>
                    {comps.map(comp => (
                      <span
                        key={`${comp.group}-${comp.name}`}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          color: '#cbd5e1',
                          fontFamily: 'monospace'
                        }}
                      >
                        {comp.name}@{comp.version}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, gradient, highlight }) => (
  <div style={{
    background: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${highlight ? 'rgba(220, 38, 38, 0.4)' : 'rgba(139, 92, 246, 0.3)'}`,
    borderRadius: '16px',
    padding: '1.75rem',
    transition: 'all 0.3s ease',
    cursor: 'default',
    boxShadow: highlight ? '0 8px 32px rgba(220, 38, 38, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.3)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = highlight ? '0 12px 40px rgba(220, 38, 38, 0.3)' : '0 12px 40px rgba(139, 92, 246, 0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = highlight ? '0 8px 32px rgba(220, 38, 38, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.3)';
  }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <div style={{ 
        background: gradient,
        padding: '0.75rem',
        borderRadius: '10px',
        display: 'flex'
      }}>
        {icon}
      </div>
      <div style={{ 
        fontSize: '0.75rem', 
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#94a3b8',
        fontWeight: 600
      }}>
        {label}
      </div>
    </div>
    <div style={{ 
      fontSize: '2.5rem', 
      fontWeight: 900,
      background: gradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      lineHeight: 1
    }}>
      {value}
    </div>
  </div>
);

// Chart Card Component
const ChartCard = ({ title, children }) => (
  <div style={{
    background: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  }}>
    <h3 style={{ 
      margin: '0 0 1.5rem 0', 
      fontSize: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#8b5cf6',
      fontWeight: 700
    }}>
      {title}
    </h3>
    {children}
  </div>
);

// Vulnerability Stat Component
const VulnStat = ({ label, count, color }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '8px',
    border: `1px solid ${color}40`
  }}>
    <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 600 }}>{label}</span>
    <span style={{ 
      fontSize: '1.25rem', 
      fontWeight: 900, 
      color 
    }}>
      {count}
    </span>
  </div>
);

// Component Card Component
const ComponentCard = ({ component, isExpanded, onToggle, vulnerabilities }) => {
  const hasVulns = vulnerabilities.length > 0;
  const highestSeverity = hasVulns ? 
    vulnerabilities.some(v => v.Severity === 'CRITICAL') ? 'CRITICAL' : 'HIGH' : null;

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${hasVulns ? (highestSeverity === 'CRITICAL' ? 'rgba(220, 38, 38, 0.4)' : 'rgba(249, 115, 22, 0.4)') : 'rgba(139, 92, 246, 0.3)'}`,
      borderLeft: `4px solid ${hasVulns ? (highestSeverity === 'CRITICAL' ? '#dc2626' : '#f97316') : '#8b5cf6'}`,
      borderRadius: '12px',
      padding: '1.5rem',
      transition: 'all 0.3s ease',
      boxShadow: hasVulns ? '0 8px 32px rgba(220, 38, 38, 0.15)' : '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              background: component.ecosystem === 'maven' ? '#f97316' : '#8b5cf6',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              {component.ecosystem}
            </span>
            {hasVulns && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.75rem',
                background: highestSeverity === 'CRITICAL' ? '#dc2626' : '#f97316',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                <AlertTriangle size={12} />
                {vulnerabilities.length} {vulnerabilities.length === 1 ? 'Vuln' : 'Vulns'}
              </span>
            )}
            <span style={{
              padding: '0.25rem 0.75rem',
              background: 'rgba(6, 182, 212, 0.2)',
              border: '1px solid #06b6d4',
              color: '#67e8f9',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              {component.license}
            </span>
          </div>
          <h3 style={{ 
            margin: '0 0 0.5rem 0',
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#e0e7ff'
          }}>
            {component.group ? `${component.group}:` : ''}{component.name}
          </h3>
          <div style={{ 
            fontSize: '0.875rem',
            color: '#94a3b8',
            fontFamily: 'monospace'
          }}>
            v{component.version}
          </div>
        </div>
        
        {vulnerabilities.length > 0 && (
          <button
            onClick={onToggle}
            style={{
              background: 'transparent',
              border: `1px solid ${highestSeverity === 'CRITICAL' ? '#dc2626' : '#f97316'}`,
              borderRadius: '8px',
              padding: '0.5rem',
              color: highestSeverity === 'CRITICAL' ? '#dc2626' : '#f97316',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${highestSeverity === 'CRITICAL' ? '#dc2626' : '#f97316'}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        )}
      </div>

      {/* Expanded Vulnerabilities */}
      {isExpanded && vulnerabilities.length > 0 && (
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #374151'
        }}>
          <h4 style={{ 
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#94a3b8',
            marginBottom: '1rem',
            fontWeight: 700
          }}>
            Vulnerabilities
          </h4>
          {vulnerabilities.map(vuln => (
            <div 
              key={vuln.VulnerabilityID}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: `1px solid ${vuln.Severity === 'CRITICAL' ? '#dc2626' : '#f97316'}40`,
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: vuln.Severity === 'CRITICAL' ? '#dc2626' : '#f97316',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {vuln.Severity}
                </span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontFamily: 'monospace',
                  color: '#94a3b8',
                  fontWeight: 600
                }}>
                  {vuln.VulnerabilityID}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                Upgrade to <strong style={{ color: '#67e8f9' }}>{vuln.FixedVersion}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SBOMDashboard;

# OpenCost AI

## Technical Architecture & Open Source Strategy

Version: 1.0

Status: Founding Architecture Document

Owner: Engineering

Last Updated: June 2026

---

# Executive Summary

OpenCost AI is not intended to become a dashboard company.

The long-term vision is to become the governance and control plane for enterprise AI.

The architecture must therefore support:

* Visibility
* Governance
* Enforcement
* Optimization

from day one.

The system should evolve from:

Visibility Platform

↓

Governance Platform

↓

AI Gateway

↓

AI Operating Layer

---

# Core Architectural Principles

## Principle 1

Provider Agnostic

Support all AI providers.

Never become dependent on a single vendor.

Supported:

* OpenAI
* Anthropic
* Gemini
* Azure OpenAI
* AWS Bedrock
* Groq
* Together AI
* Cohere
* Mistral

Future providers should require minimal engineering effort.

---

## Principle 2

API First

Everything must be accessible via APIs.

The dashboard is a consumer of APIs.

It is not the product itself.

---

## Principle 3

Event Driven

Every AI interaction becomes an event.

Events are immutable.

Everything derives from event streams.

---

## Principle 4

Gateway Future

Even if v1 is analytics-only,

all architecture should anticipate future proxying of AI traffic.

---

# System Architecture

V1 Architecture

```text
AI Provider APIs
        ↓
Usage Collectors
        ↓
Normalization Layer
        ↓
Event Store
        ↓
Analytics Engine
        ↓
Dashboard APIs
        ↓
Frontend
```

Future Architecture

```text
Applications
Agents
Employees
        ↓
OpenCost Gateway
        ↓
Policy Engine
        ↓
Routing Engine
        ↓
Provider APIs
```

This future architecture creates the moat.

---

# Core Services

## Service 1

Identity Service

Responsibilities:

* Organizations
* Users
* Teams
* Roles

Technology:

* Clerk
* Auth0
* Keycloak

Recommendation:

Clerk initially.

---

## Service 2

Provider Integration Service

Responsibilities:

* API credential management
* Provider connectivity
* Sync jobs

Supported Providers

Phase 1:

* OpenAI
* Anthropic
* Gemini

Phase 2:

* Azure OpenAI
* Bedrock

---

# Provider Integration Design

**Auth strategy:** Prefer OAuth 2.0 / OIDC for vendor connect; use API keys only as fallback or for Covalynce-issued Gateway keys. See `INTEGRATIONS_STRATEGY.md` for the full matrix and REST catalog (`GET /api/v1/integrations/catalog`).

Every provider implements:

```typescript
interface ProviderAdapter {
  syncUsage()
  syncBilling()
  validateCredentials()
}
```

Benefits:

* Standardized ingestion
* Easy expansion

---

# Service 3

Usage Collection Engine

Responsibilities:

* Pull usage data
* Normalize events
* Calculate costs

Input Sources:

* Usage APIs
* Billing APIs
* Audit Logs

Output:

Normalized Usage Events

---

# Canonical Event Format

Every provider maps to:

```json
{
  "event_id": "",
  "provider": "",
  "model": "",
  "organization_id": "",
  "user_id": "",
  "team_id": "",
  "input_tokens": 0,
  "output_tokens": 0,
  "cost": 0,
  "timestamp": ""
}
```

All downstream systems use this schema.

---

# Service 4

Cost Calculation Engine

Responsibilities:

* Cost attribution
* Pricing normalization
* Historical pricing

Reason:

Model pricing changes frequently.

Historical calculations must remain accurate.

---

# Pricing Table Example

```json
{
  "provider": "openai",
  "model": "gpt-5",
  "effective_date": "2026-01-01",
  "input_cost_per_million": 2.5,
  "output_cost_per_million": 10
}
```

Versioned pricing required.

---

# Service 5

Analytics Engine

Responsibilities:

* Aggregations
* Reports
* Dashboards

Queries:

* Spend by User
* Spend by Team
* Spend by Provider
* Spend by Model

---

# Service 6

Alert Engine

Responsibilities:

* Budget alerts
* Spend spikes
* Anomaly detection

Future:

Predictive alerts.

---

# Service 7

Policy Engine (Future)

Responsibilities:

* Budget enforcement
* Model restrictions
* Team permissions

Example:

```yaml
engineering:
  monthly_limit: 5000

marketing:
  monthly_limit: 2000
```

---

# Service 8

Routing Engine (Future)

Responsibilities:

Automatically choose models.

Example:

```text
GPT-5 Cost:
$1

Gemini Cost:
$0.20
```

Route intelligently.

---

# Database Architecture

Primary Database

PostgreSQL

Reason:

Strong consistency

Mature ecosystem

Excellent analytics support

---

# Core Tables

organizations

users

teams

providers

usage_events

budgets

alerts

pricing_versions

audit_logs

---

# Recommended Additional Tables

projects

cost_centers

tags

policy_rules

future_agent_registry

These become important later.

---

# Event Storage Strategy

All usage events remain immutable.

Never update.

Never delete.

Append only.

Benefits:

* Auditing
* Compliance
* Historical analytics

---

# Analytics Storage

Option A

PostgreSQL

Initial phase.

---

Option B

ClickHouse

After scale.

Recommended:

Move after 100M+ events.

---

# Queue Architecture

Technology:

BullMQ

or

Kafka

Recommendation:

BullMQ initially.

Kafka later.

---

# Background Jobs

Provider Sync

Frequency:

Every 15 minutes

---

Budget Evaluation

Frequency:

Every 5 minutes

---

Alert Evaluation

Frequency:

Every 5 minutes

---

Daily Aggregations

Frequency:

Daily

---

# Caching Layer

Technology:

Redis

Use Cases:

* Dashboard queries
* Team analytics
* Provider analytics

---

# API Design

REST initially.

GraphQL later if required.

---

# Core API Groups

Authentication

Organizations

Users

Teams

Providers

Usage

Analytics

Budgets

Alerts

Audit Logs

---

# Security Architecture

Requirements

Mandatory:

* Encryption at rest
* Encryption in transit
* Secrets management
* RBAC
* Audit logging

---

# Secrets Management

Never store plaintext API keys or OAuth tokens.

Credentials are encrypted at rest with `authType` (`OAUTH` | `API_KEY`) on the `Provider` record. OAuth access tokens are refreshable when vendors support it.

Use:

AWS Secrets Manager

or

Hashicorp Vault

---

# Audit Logging

Log:

* User actions
* Configuration changes
* Provider connections
* Budget changes

Required for enterprise customers.

---

# Multi-Tenant Architecture

Every record scoped by:

organization_id

Mandatory.

No exceptions.

---

# Open Source Strategy

Most important section.

---

# Mistake To Avoid

Do not open-source everything.

Do not close-source everything.

Both fail.

---

# Recommended Model

Open Core

---

Community Edition

Apache 2.0

Includes:

* Core dashboard
* Providers
* Analytics
* Basic reporting

---

Commercial Edition

Closed Source

Includes:

* SSO
* Enterprise RBAC
* Compliance
* Advanced governance
* Budget enforcement
* Audit exports

---

# Why Open Core

Benefits:

* Developer adoption
* Enterprise monetization
* Community contributions

Proven by:

* GitLab
* Elastic
* Datadog ecosystem
* Hashicorp

---

# Repository Structure

```text
opencost-ai/

apps/
  dashboard
  api

packages/
  sdk
  provider-adapters
  ui

services/
  ingestion
  analytics
  alerts

docs/
```

Monorepo recommended.

---

# Deployment Strategy

Self Hosted First

Reason:

Trust.

Most companies won't connect billing systems to SaaS immediately.

---

Supported:

Docker

Docker Compose

Kubernetes

---

# Future Architecture

The Billion Dollar Layer

---

Today

```text
Company
   ↓
OpenAI
```

Future

```text
Company
   ↓
OpenCost Gateway
   ↓
OpenAI
Claude
Gemini
Bedrock
```

Every request passes through OpenCost.

Now OpenCost can:

* Track spend
* Enforce budgets
* Route models
* Apply policies
* Measure ROI

This becomes the infrastructure layer.

---

# Engineering Roadmap

Phase 1

Visibility

Months 0-6

---

Phase 2

Budgets

Months 6-12

---

Phase 3

Governance

Months 12-18

---

Phase 4

Gateway

Months 18-24

---

Phase 5

Enterprise AI Operating Layer

Months 24+

---

# Technical North Star

The ultimate goal is not dashboards.

The ultimate goal is:

Every enterprise AI request should flow through OpenCost AI before reaching an AI provider.

At that point OpenCost AI becomes the governance, optimization, and financial operating system for enterprise AI.

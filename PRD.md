# OpenCost AI

## Product Requirements Document (PRD)

Version: 1.0

Status: MVP Definition

Owner: Product Team

Last Updated: June 2026

---

# Overview

OpenCost AI is an AI FinOps platform that provides organizations with complete visibility, attribution, governance, and optimization of AI spending across providers, applications, and agents.

The MVP focuses on solving one core problem:

> "I don't know where my AI spend is going."

Everything else is secondary.

---

# Product Goal

Provide organizations with:

* AI spend visibility
* Team-level attribution
* User-level attribution
* Provider-level attribution
* Model-level attribution
* Budget monitoring

without requiring organizations to change their existing workflows.

---

# MVP Success Criteria

A customer should be able to answer:

* How much AI cost us this month?
* Which teams are spending the most?
* Which users are spending the most?
* Which models are generating the highest costs?
* Which AI provider costs us the most?
* Which projects consume the most AI resources?

within 60 seconds of logging in.

---

# User Personas

## Persona 1: CTO

Responsibilities:

* Technology strategy
* AI adoption
* Budget oversight

Pain Points:

* Lack of visibility
* Cost unpredictability
* Vendor fragmentation

Success Metric:

* Spend visibility across organization

---

## Persona 2: Engineering Manager

Responsibilities:

* Team productivity
* Tooling decisions

Pain Points:

* Cannot attribute AI spend

Success Metric:

* Team-level spend reporting

---

## Persona 3: Platform Engineer

Responsibilities:

* Infrastructure
* Tool governance

Pain Points:

* No centralized monitoring

Success Metric:

* Single pane of glass

---

## Persona 4: Finance Team

Responsibilities:

* Budgeting
* Forecasting

Pain Points:

* AI spend unpredictability

Success Metric:

* Monthly forecasting accuracy

---

# MVP Features

## Feature 1

Organization Management

Description:

Create and manage organizations.

Requirements:

* Organization creation
* Invite users
* Assign roles
* Manage teams

Roles:

* Admin
* Manager
* Viewer

Priority:

P0

---

## Feature 2

Provider Integrations

Description:

Connect AI providers.

Supported Providers:

* OpenAI
* Anthropic
* Gemini

Future:

* Bedrock
* Azure OpenAI
* Groq
* Together
* Cohere

Requirements:

* OAuth connect (preferred) with API key fallback
* Secure credential storage (encrypted; `authType` OAUTH | API_KEY)
* Periodic sync jobs
* Public integrations catalog for embeddability

See `INTEGRATIONS_STRATEGY.md`.

Priority:

P0

---

## Feature 3

Usage Collection Engine

Description:

Collect usage and billing data.

Requirements:

* Token consumption
* Input tokens
* Output tokens
* Model
* Timestamp
* User attribution
* Cost estimation

Priority:

P0

---

## Feature 4

Spend Dashboard

Description:

Display spend metrics.

Widgets:

* Total spend
* Daily spend
* Weekly spend
* Monthly spend
* Provider breakdown
* Model breakdown
* Team breakdown

Priority:

P0

---

## Feature 5

User Attribution

Description:

Attribute spend to users.

Display:

* User
* Requests
* Tokens
* Cost

Priority:

P0

---

## Feature 6

Team Attribution

Description:

Attribute spend to teams.

Display:

* Team
* Total Cost
* Active Users
* Cost Trend

Priority:

P0

---

## Feature 7

Budget Monitoring

Description:

Track spend against budgets.

Requirements:

* Team budgets
* Organization budgets
* Monthly budgets

Display:

* Current spend
* Remaining budget
* Burn rate

Priority:

P1

---

## Feature 8

Alerts

Description:

Generate spend alerts.

Triggers:

* Budget threshold exceeded
* Sudden spend increase
* Provider cost spike

Channels:

* Email
* Slack

Priority:

P1

---

# MVP Features NOT Included

The following are explicitly excluded:

* Model routing
* Cost optimization recommendations
* Agent governance
* Compliance engine
* Policy engine
* ROI attribution
* Cost forecasting
* Procurement workflows

These belong to later phases.

---

# User Journey

## Admin Flow

Step 1

Create Organization

↓

Step 2

Invite Team

↓

Step 3

Connect Providers

↓

Step 4

Sync Usage Data

↓

Step 5

View Dashboard

↓

Step 6

Configure Budgets

---

# Dashboard Requirements

## Dashboard Overview

Metrics:

* Total Spend
* Daily Spend
* Monthly Spend
* Budget Utilization

Charts:

* Spend Over Time
* Provider Distribution
* Team Distribution

---

# Dashboard Sections

## Section 1

Executive Summary

Cards:

* Total Cost
* Active Users
* Active Teams
* Total Requests

---

## Section 2

Provider Analytics

Cards:

* OpenAI
* Anthropic
* Gemini

Metrics:

* Cost
* Requests
* Token Usage

---

## Section 3

Team Analytics

Metrics:

* Cost per Team
* Growth Rate
* Active Users

---

## Section 4

User Analytics

Metrics:

* Top Spenders
* Most Active Users
* Cost Distribution

---

# Database Design

## organizations

Fields:

* id
* name
* created_at
* updated_at

---

## users

Fields:

* id
* org_id
* email
* role
* created_at

---

## teams

Fields:

* id
* org_id
* name

---

## providers

Fields:

* id
* org_id
* provider_name
* encrypted_credentials

---

## usage_records

Fields:

* id
* provider
* model
* user_id
* team_id
* input_tokens
* output_tokens
* cost
* timestamp

---

## budgets

Fields:

* id
* org_id
* team_id
* monthly_limit

---

## alerts

Fields:

* id
* org_id
* alert_type
* status

---

# API Requirements

## POST /organizations

Create organization

---

## POST /users

Invite user

---

## POST /providers/connect

Connect provider

---

## GET /usage

Fetch usage records

Filters:

* date
* provider
* team
* user

---

## GET /dashboard

Return dashboard metrics

---

## POST /budgets

Create budget

---

## GET /alerts

Fetch alerts

---

# Security Requirements

Must Have:

* Encryption at rest
* Encryption in transit
* Role-based access
* Audit logs
* API credential encryption

---

# Performance Requirements

Dashboard Load:

< 3 seconds

Usage Query:

< 2 seconds

API Latency:

< 500ms

---

# Event Tracking

Track:

* Organization Created
* User Invited
* Provider Connected
* Dashboard Viewed
* Budget Created
* Alert Triggered

Purpose:

Product analytics

---

# MVP Tech Stack

Frontend:

* Next.js
* TypeScript
* Tailwind
* shadcn/ui

Backend:

* Node.js
* NestJS

Database:

* PostgreSQL

Caching:

* Redis

Queue:

* BullMQ

Hosting:

* AWS

Authentication:

* Clerk or Auth0

Monitoring:

* OpenTelemetry

---

# Open Source Architecture

Community Edition:

* Self-hosted
* Single organization
* Unlimited users
* Core dashboard

Commercial Features:

* SSO
* Advanced RBAC
* Multi-org
* Audit exports
* Compliance controls

---

# MVP Timeline

## Sprint 1

Weeks 1-2

* Authentication
* Organizations
* Users

---

## Sprint 2

Weeks 3-4

* Provider Integrations
* Usage Collection

---

## Sprint 3

Weeks 5-6

* Dashboard
* Team Analytics

---

## Sprint 4

Weeks 7-8

* Budgets
* Alerts

---

## Sprint 5

Weeks 9-10

* Security Hardening
* Documentation

---

## Sprint 6

Weeks 11-12

* Beta Release

---

# MVP Success Metrics

Technical:

* <3 second dashboard load
* 99.5% uptime

Business:

* 20 Design Partners
* 10 Active Organizations
* 100 Connected AI Accounts

Product:

* Weekly Active Admins > 60%
* Dashboard Return Rate > 40%

---

# Future Roadmap

Version 2

* Model Routing
* Cost Optimization

Version 3

* Policy Engine
* Governance

Version 4

* AI Agent Management

Version 5

* AI Operating System

The MVP should remain focused on visibility and attribution. Every feature must be evaluated against the question:

"Does this help users understand where their AI spend is going?"

If the answer is no, it should not be included in the MVP.

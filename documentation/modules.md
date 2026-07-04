# CRM Modules

## Overview

The Customer Relationship Management (CRM) system is divided into multiple functional modules. Each module is responsible for managing a specific part of the customer lifecycle. Together, these modules provide a centralized platform for managing customer relationships, sales activities, and business operations.

---

# 1. Authentication Module

## Purpose

The Authentication module secures the CRM system by verifying user identity and controlling access to protected resources.

### Features

* User Registration
* User Login
* User Logout (revokes refresh token)
* Get Current User
* JWT Access Token
* Refresh Token
* Protected Routes
* Role-Based Authorization

### Benefits

* Secure system access
* Prevent unauthorized access
* Protect sensitive business data

---

# 2. Dashboard Module

## Purpose

The Dashboard provides an overview of business performance and customer activities through summary cards and analytics.

### Features

* Total Leads
* Total Contacts
* Total Companies
* Active Deals
* Performance Overview Chart

### Benefits

* Quick business overview
* Improved decision making
* Easy monitoring of daily activities

---

# 3. Company Module

## Purpose

The Company module manages organizations that interact with the business.

### Features

* Add Company
* Delete Company
* Search Companies
* Filter by Industry
* CSV Export

### Benefits

* Centralized company information
* Better organization of customer data
* Easy relationship management

---

# 4. Contact Module

## Purpose

The Contact module stores and manages individual contacts associated with companies.

### Features

* Add Contact
* Delete Contact
* Search Contacts
* Company Association
* CSV Export

### Benefits

* Organized customer contacts
* Faster communication
* Improved customer management

---

# 5. Lead Module

## Purpose

The Lead module tracks potential customers and sales opportunities.

### Features

* Create Lead
* Delete Lead
* Lead Status Tracking (New, Contacted, Qualified, Lost, Converted)
* Search and Filters (status, source)
* CSV Export

### Benefits

* Better lead management
* Higher sales efficiency
* Improved customer conversion

---

# 6. Deal Pipeline Module

## Purpose

The Deal module manages sales opportunities throughout the sales process.

### Features

* Create Deal
* Update Deal Stage (Kanban drag-and-drop)
* Assign Deal Value
* Search Deals
* Sales Pipeline visualization

### Benefits

* Better sales visibility
* Improved revenue tracking
* Efficient opportunity management

---

# 7. Task Module

## Purpose

The Task module helps users organize and manage work related to customers and sales.

### Features

* Create Task
* Delete Task
* Mark Complete / Pending
* Task Priority (Low, Medium, High)
* Search and Filters (priority, status)

### Benefits

* Improved productivity
* Better task tracking
* Organized workflow

---

# 8. Activity Module

## Purpose

The Activity module records interactions performed with leads, contacts, and deals — including calls, emails, notes, and meetings.

### Features

* Log Activity (type: call, email, note, meeting)
* Delete Activity
* Timeline History

### Benefits

* Better auditing
* Activity monitoring
* Improved transparency

---

# 9. Reports Module

## Purpose

The Reports module provides analytics and visual summaries of CRM data to support business decisions.

### Features

* Leads Summary (by status)
* Deals Pipeline Summary (by stage)
* Sales Performance (win rate, total revenue)
* Activity Summary

### Benefits

* Data-driven decision making
* Visibility into sales performance
* Quick identification of trends

---

# Module Relationships

The CRM modules are interconnected to support the complete customer lifecycle.

```text
Company
    │
    ▼
Contact
    │
    ▼
Lead
    │
    ▼
Deal
    │
    ▼
Task / Activity
    │
    ▼
Reports
```

---

# Planned Modules (Not Yet Implemented)

* Follow-up / Reminder Module
* Standalone Notes Module (currently, notes exist only as an Activity type)
* Task and Lead Assignment workflows (currently limited to an owner/assignee field with no assignment UI)

---

# Summary

Each CRM module has a specific responsibility while working together as part of an integrated system. This modular architecture improves maintainability, scalability, and ease of development, allowing new features to be added without affecting existing functionality.
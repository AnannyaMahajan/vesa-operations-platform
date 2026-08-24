# Service Level Agreement (SLA) Engine Design

## 1. SLA Targets by Request Type

| Request Process | Target SLA Hours | Dynamic Calculation Formula |
| :--- | :---: | :--- |
| **Software Access Request** | 24 Hours | $T_{\text{due}} = T_{\text{created}} + 24\text{ hours}$ |
| **Expense Reimbursement** | 48 Hours | $T_{\text{due}} = T_{\text{created}} + 48\text{ hours}$ |
| **Document Approval** | 72 Hours | $T_{\text{due}} = T_{\text{created}} + 72\text{ hours}$ |
| **Equipment Request** | 72 Hours | $T_{\text{due}} = T_{\text{created}} + 72\text{ hours}$ |

---

## 2. Dynamic SLA Status Logic

SLA status is computed on the fly using actual timestamps rather than static database labels:

- **WITHIN_SLA**: Active request where $\text{current\_time} < T_{\text{due}} - 0.25 \times H_{\text{target}}$.
- **APPROACHING_SLA**: Active request where remaining time is $\le 25\%$ of total SLA window.
- **OVERDUE**: Active request where $\text{current\_time} > T_{\text{due}}$.
- **COMPLETED_WITHIN_SLA**: Finished request where $T_{\text{completed}} \le T_{\text{due}}$.
- **COMPLETED_AFTER_SLA**: Finished request where $T_{\text{completed}} > T_{\text{due}}$.

---

## 3. SLA Escalation & Monitoring

- Background status engine recalculates SLA compliance on every query.
- Overdue warnings generate instant role notifications to assignees and operations managers.

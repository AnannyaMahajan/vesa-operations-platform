const { query, get } = require('../database/db');
const { computeSlaStatus } = require('../services/slaCalculator');

async function getDashboardStats(req, res, next) {
  try {
    const user = req.user;

    // Build base query scoped to role
    let scopeWhere = '';
    const scopeParams = [];

    if (user.role === 'Employee') {
      scopeWhere = ' WHERE requester_id = ?';
      scopeParams.push(user.id);
    } else if (['Reporting Manager', 'Department Staff', 'Department Head / Director'].includes(user.role)) {
      scopeWhere = ' WHERE (department_id = ? OR requester_id = ? OR current_assignee_id = ?)';
      scopeParams.push(user.department_id, user.id, user.id);
    }

    // 1. Status Counts
    const statusCounts = query(`
      SELECT status, COUNT(*) as count
      FROM requests
      ${scopeWhere}
      GROUP BY status
    `, scopeParams);

    const countsMap = {
      total: 0,
      open: 0,
      pending_approval: 0,
      in_progress: 0,
      completed: 0,
      rejected: 0,
      overdue: 0
    };

    statusCounts.forEach(sc => {
      countsMap.total += sc.count;
      if (['SUBMITTED', 'UNDER_REVIEW', 'APPROVAL_PENDING'].includes(sc.status)) {
        countsMap.open += sc.count;
        if (sc.status === 'APPROVAL_PENDING') countsMap.pending_approval += sc.count;
      } else if (sc.status === 'PROCESSING') {
        countsMap.open += sc.count;
        countsMap.in_progress += sc.count;
      } else if (sc.status === 'COMPLETED') {
        countsMap.completed += sc.count;
      } else if (sc.status === 'REJECTED') {
        countsMap.rejected += sc.count;
      }
    });

    // 2. SLA Breakdown
    const rWhere = scopeWhere 
      ? scopeWhere.replace(/requester_id/g, 'r.requester_id').replace(/department_id/g, 'r.department_id').replace(/current_assignee_id/g, 'r.current_assignee_id') 
      : '';

    const allRequests = query(`
      SELECT r.created_at, r.sla_due_at, r.completed_at, r.status, rt.target_sla_hours
      FROM requests r
      JOIN request_types rt ON r.request_type_id = rt.id
      ${rWhere}
    `, scopeParams);

    const slaMap = {
      within_sla: 0,
      approaching_sla: 0,
      overdue: 0,
      completed_within_sla: 0,
      completed_after_sla: 0
    };

    allRequests.forEach(r => {
      const sla = computeSlaStatus(r);
      if (sla === 'WITHIN_SLA') slaMap.within_sla++;
      else if (sla === 'APPROACHING_SLA') slaMap.approaching_sla++;
      else if (sla === 'OVERDUE') {
        slaMap.overdue++;
        countsMap.overdue++;
      } else if (sla === 'COMPLETED_WITHIN_SLA') slaMap.completed_within_sla++;
      else if (sla === 'COMPLETED_AFTER_SLA') slaMap.completed_after_sla++;
    });

    // SLA Compliance Rate
    const totalFinished = slaMap.completed_within_sla + slaMap.completed_after_sla;
    const slaComplianceRate = totalFinished > 0 
      ? Math.round((slaMap.completed_within_sla / totalFinished) * 100)
      : 100;

    // 3. Workload by Request Type
    const typeWorkload = query(`
      SELECT rt.name as type_name, rt.code as type_code, COUNT(r.id) as count
      FROM request_types rt
      LEFT JOIN requests r ON r.request_type_id = rt.id ${scopeWhere ? 'AND ' + scopeWhere.replace('WHERE ', '').replace(/requester_id/g, 'r.requester_id').replace(/department_id/g, 'r.department_id').replace(/current_assignee_id/g, 'r.current_assignee_id') : ''}
      GROUP BY rt.id
    `, scopeParams);

    // 4. Workload by Department
    const deptWorkload = query(`
      SELECT d.name as department_name, d.code as department_code, COUNT(r.id) as count
      FROM departments d
      LEFT JOIN requests r ON r.department_id = d.id ${scopeWhere ? 'AND ' + scopeWhere.replace('WHERE ', '').replace(/requester_id/g, 'r.requester_id').replace(/department_id/g, 'r.department_id').replace(/current_assignee_id/g, 'r.current_assignee_id') : ''}
      GROUP BY d.id
    `, scopeParams);

    res.json({
      role: user.role,
      counts: countsMap,
      slaBreakdown: slaMap,
      slaComplianceRate,
      workloadByType: typeWorkload,
      workloadByDepartment: deptWorkload
    });
  } catch (err) {
    next(err);
  }
}

async function getBottleneckAnalysis(req, res, next) {
  try {
    const stageDurationRows = query(`
      SELECT r.request_number, r.title, rt.name as type_name,
             ap.stage_name, ap.action, ap.created_at, r.created_at as request_created_at
      FROM approvals ap
      JOIN requests r ON ap.request_id = r.id
      JOIN request_types rt ON r.request_type_id = rt.id
      ORDER BY ap.request_id, ap.created_at ASC
    `);

    const overdueSummary = query(`
      SELECT r.request_number, r.title, rt.name as type_name, d.name as department_name,
             u.full_name as assignee_name, r.created_at, r.sla_due_at
      FROM requests r
      JOIN request_types rt ON r.request_type_id = rt.id
      JOIN departments d ON r.department_id = d.id
      LEFT JOIN users u ON r.current_assignee_id = u.id
      WHERE r.sla_status = 'OVERDUE' OR (r.status NOT IN ('COMPLETED', 'REJECTED', 'CANCELLED') AND r.sla_due_at < CURRENT_TIMESTAMP)
      ORDER BY r.sla_due_at ASC
    `);

    res.json({
      bottleneckData: stageDurationRows,
      overdueRequests: overdueSummary
    });
  } catch (err) {
    next(err);
  }
}

async function exportOperationalReport(req, res, next) {
  try {
    const { format = 'csv', status, request_type_id, start_date, end_date } = req.query;

    let sql = `
      SELECT r.request_number, rt.name as type_name, u.full_name as requester_name,
             d.name as department_name, r.title, r.priority, r.status, r.sla_status,
             r.created_at, r.completed_at
      FROM requests r
      JOIN request_types rt ON r.request_type_id = rt.id
      JOIN users u ON r.requester_id = u.id
      JOIN departments d ON r.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ` AND r.status = ?`;
      params.push(status);
    }
    if (request_type_id) {
      sql += ` AND r.request_type_id = ?`;
      params.push(request_type_id);
    }

    sql += ` ORDER BY r.created_at DESC`;
    const rows = query(sql, params);

    if (format.toLowerCase() === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="vesa_operational_report.json"');
      return res.send(JSON.stringify(rows, null, 2));
    }

    // CSV format
    let csv = 'Request Number,Type,Requester,Department,Title,Priority,Status,SLA Status,Created At,Completed At\n';
    rows.forEach(r => {
      csv += `"${r.request_number}","${r.type_name}","${r.requester_name}","${r.department_name}","${r.title.replace(/"/g, '""')}","${r.priority}","${r.status}","${r.sla_status}","${r.created_at}","${r.completed_at || ''}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="vesa_operational_report.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  getBottleneckAnalysis,
  exportOperationalReport,
  exportReport: exportOperationalReport
};

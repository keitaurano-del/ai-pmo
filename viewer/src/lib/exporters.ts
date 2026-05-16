import ExcelJS from 'exceljs';
import { CaseData, IssueRow, WbsRow } from './data';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

async function workbookToBlob(wb: ExcelJS.Workbook): Promise<Blob> {
  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

function applyHeaderStyle(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1D2E94' },
    };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });
  row.height = 24;
}

function applyBodyStyle(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.alignment = { vertical: 'top', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    };
  });
}

export async function exportWbs(c: CaseData) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'AI PMO Viewer';
  wb.created = new Date();

  const sheet = wb.addWorksheet('WBS', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [
    { header: 'ID', key: 'wbs_id', width: 12 },
    { header: 'タスク名', key: 'name', width: 50 },
    { header: '担当', key: 'owner', width: 16 },
    { header: '計画開始', key: 'planned_start', width: 13 },
    { header: '計画終了', key: 'planned_end', width: 13 },
    { header: '実績開始', key: 'actual_start', width: 13 },
    { header: '実績終了', key: 'actual_end', width: 13 },
    { header: '進捗率', key: 'progress_pct', width: 10 },
    { header: '状態', key: 'status', width: 14 },
    { header: 'Backlog ID', key: 'backlog_id', width: 14 },
  ];
  applyHeaderStyle(sheet.getRow(1));

  const flatRows: WbsRow[] = c.wbsFlat;
  flatRows.forEach((r) => {
    const indent = '  '.repeat(r.depth);
    const row = sheet.addRow({
      wbs_id: r.wbs_id,
      name: `${indent}${r.name}`,
      owner: r.owner,
      planned_start: r.planned_start,
      planned_end: r.planned_end,
      actual_start: r.actual_start,
      actual_end: r.actual_end,
      progress_pct: r.progress_pct / 100,
      status: statusLabel(r.status),
      backlog_id: r.backlog_id,
    });
    // 進捗率を %
    row.getCell('progress_pct').numFmt = '0%';
    if (r.depth === 0) {
      row.font = { bold: true };
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF4FF' } };
    } else if (r.status === 'at_risk') {
      row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
    } else if (r.status === 'done') {
      row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    }
    applyBodyStyle(row);
  });

  // メタ情報シート
  const meta = wb.addWorksheet('プロジェクト概要');
  meta.columns = [
    { header: '項目', key: 'key', width: 22 },
    { header: '値', key: 'value', width: 60 },
  ];
  applyHeaderStyle(meta.getRow(1));
  meta.addRows([
    { key: 'プロジェクト名', value: `${c.project.name} — ${c.project.fullName}` },
    { key: 'クライアント', value: c.project.client },
    { key: 'ベンダー', value: c.project.vendor },
    { key: 'PM', value: c.project.pm },
    { key: 'PMO 担当', value: c.project.pmoOps },
    { key: '基準日', value: c.project.referenceDate },
    { key: '出力日時', value: new Date().toLocaleString('ja-JP') },
  ]);
  meta.eachRow((row, n) => n > 1 && applyBodyStyle(row));

  const blob = await workbookToBlob(wb);
  downloadBlob(blob, `${c.slug}_wbs_${dateTag()}.xlsx`);
}

export async function exportIssues(c: CaseData) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'AI PMO Viewer';

  const sheet = wb.addWorksheet('課題管理表', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [
    { header: 'ID', key: 'issue_id', width: 12 },
    { header: '優先度', key: 'priority', width: 10 },
    { header: '状態', key: 'status', width: 12 },
    { header: 'カテゴリ', key: 'category', width: 20 },
    { header: 'タイトル', key: 'title', width: 50 },
    { header: '担当', key: 'owner', width: 16 },
    { header: '起票者', key: 'reporter', width: 16 },
    { header: '起票日', key: 'opened_date', width: 13 },
    { header: '期限', key: 'due_date', width: 13 },
    { header: '関連 WBS', key: 'wbs_id', width: 12 },
    { header: 'Backlog ID', key: 'backlog_id', width: 14 },
  ];
  applyHeaderStyle(sheet.getRow(1));

  c.issues.forEach((i: IssueRow) => {
    const row = sheet.addRow(i);
    applyBodyStyle(row);
    if (i.priority === 'High') {
      row.getCell('priority').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
      row.getCell('priority').font = { color: { argb: 'FF991B1B' }, bold: true };
    } else if (i.priority === 'Mid') {
      row.getCell('priority').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      row.getCell('priority').font = { color: { argb: 'FF92400E' }, bold: true };
    } else if (i.priority === 'Low') {
      row.getCell('priority').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
      row.getCell('priority').font = { color: { argb: 'FF065F46' }, bold: true };
    }
    if (i.status === 'Closed') {
      row.font = { color: { argb: 'FF94A3B8' }, italic: true };
    }
  });

  // 集計シート
  const summary = wb.addWorksheet('集計');
  summary.columns = [
    { header: 'カテゴリ', key: 'cat', width: 24 },
    { header: '件数', key: 'count', width: 10 },
  ];
  applyHeaderStyle(summary.getRow(1));
  const byPriority = ['High', 'Mid', 'Low', 'Closed'].map((p) => ({
    cat: p,
    count: c.issues.filter((i) =>
      p === 'Closed' ? i.status === 'Closed' : i.priority === p && i.status !== 'Closed',
    ).length,
  }));
  summary.addRows(byPriority);
  summary.eachRow((row, n) => n > 1 && applyBodyStyle(row));

  const blob = await workbookToBlob(wb);
  downloadBlob(blob, `${c.slug}_issues_${dateTag()}.xlsx`);
}

export async function exportRisks(c: CaseData) {
  if (!c.risks) return;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'AI PMO Viewer';

  const sheet = wb.addWorksheet('リスク台帳', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'タイトル', key: 'title', width: 50 },
    { header: '発生確率', key: 'p', width: 12 },
    { header: '影響', key: 'i', width: 10 },
    { header: 'スコア', key: 'score', width: 14 },
    { header: 'トリガー', key: 'trigger', width: 40 },
    { header: '対応策', key: 'countermeasure', width: 50 },
    { header: 'エスカレ先', key: 'escalation', width: 20 },
  ];
  applyHeaderStyle(sheet.getRow(1));

  c.risks.forEach((r) => {
    const row = sheet.addRow(r);
    applyBodyStyle(row);
    if (r.tone === 'red') {
      row.getCell('score').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
      row.getCell('score').font = { color: { argb: 'FF991B1B' }, bold: true };
    } else {
      row.getCell('score').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      row.getCell('score').font = { color: { argb: 'FF92400E' }, bold: true };
    }
  });

  const blob = await workbookToBlob(wb);
  downloadBlob(blob, `${c.slug}_risks_${dateTag()}.xlsx`);
}

function statusLabel(s: string): string {
  return s === 'done' ? '完了' : s === 'in_progress' ? '進行中' : s === 'at_risk' ? '遅延注意' : '未着手';
}

function dateTag(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

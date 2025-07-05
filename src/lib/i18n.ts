
export const roleMap: Record<string, string> = {
  branch_manager: 'مدير فرع',
  regional_manager: 'مدير إقليمي',
  quality_officer: 'مسؤول جودة',
  senior_management: 'إدارة عليا',
  system_admin: 'مسؤول نظام',
};

export const violationStatusMap: Record<string, string> = {
  paid: 'مدفوعة',
  unpaid: 'غير مدفوعة',
  filed: 'ملفية',
};

export const objectionStatusMap: Record<string, string> = {
  approved: 'مقبول',
  pending: 'قيد المراجعة',
  rejected: 'مرفوض',
};

export const userStatusMap: Record<string, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
};

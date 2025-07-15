"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EC_CONSENSUS = exports.ADMIN_PERMISSIONS = void 0;
exports.ADMIN_PERMISSIONS = {
    SUPER_ADMIN: [
        'manage_users',
        'manage_nominations',
        'manage_candidates',
        'manage_elections',
        'view_all_reports',
        'system_configuration',
        'bulk_operations',
    ],
    EC_MEMBER: [
        'review_nominations',
        'approve_nominations',
        'reject_nominations',
        'view_nomination_reports',
        'comment_on_nominations',
    ],
};
exports.EC_CONSENSUS = {
    TOTAL_MEMBERS: 3,
    REQUIRED_FOR_APPROVAL: 2,
    REQUIRED_FOR_REJECTION: 2,
};
//# sourceMappingURL=admin-permissions.constant.js.map
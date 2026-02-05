// src/services/auditLogger.service.ts
// Wrapper around audit.service.ts providing a convenient auditLogger.log() API
import { logAction, AuditLogPayload } from './audit.service';

interface AuditUser {
    id: string;
    username: string;
    role: string;
    department: string;
}

const auditLogger = {
    async log(actionTypeCode: string, details: Record<string, any>, user?: AuditUser): Promise<void> {
        try {
            const payload: AuditLogPayload = {
                entity_type: details.entityType || 'BUDGET_ITEM',
                entity_id: String(details.itemId || details.requestId || ''),
                action_type_code: actionTypeCode,
                action_by: user?.username || 'system',
                action_from: 'BUDGET',
                previous_data: details.previousData,
                new_data: details,
                ip_address: details.ipAddress,
            };

            await logAction(payload);
        } catch (error) {
            // Fail-open: don't break business logic if audit logging fails
            console.error(`[AuditLogger] Failed to log action ${actionTypeCode}:`, error);
        }
    }
};

export default auditLogger;

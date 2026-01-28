import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://localhost:3002';
const AUDIT_API_KEY = process.env.AUDIT_SERVICE_API_KEY || 'BUDGET_DEFAULT_KEY';

export interface AuditLogPayload {
    entity_type: string;
    entity_id: string;
    action_type_code: string;
    action_by: string;
    previous_data?: any;
    new_data?: any;
    ip_address?: string;
}

export async function logAction(payload: AuditLogPayload): Promise<void> {
    try {
        // If auth is disabled in audit service or using a test key, we just send what we have.
        // Ideally, we should check if configuration is present.
        if (!AUDIT_SERVICE_URL) {
            console.warn('Audit Service URL not configured. Skipping audit log.');
            return;
        }

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': AUDIT_API_KEY
        };

        // Send request
        // We use fire-and-forget pattern implicitly by not returning the promise in some contexts,
        // but here we await it to catch errors for now.
        // In the controller, we can decide whether to await or not.
        await axios.post(`${AUDIT_SERVICE_URL}/api/audit-logs`, payload, { headers });

        console.log(`Audit log sent successfully: ${payload.action_type_code} on ${payload.entity_type} ${payload.entity_id}`);
    } catch (error: any) {
        // Fail-open: Request succeeded but audit failed. We log the error but don't throw it
        // so the main business logic doesn't break.
        console.error('Failed to send audit log:', error.message);
        if (error.response) {
            console.error('Audit Service Response:', error.response.data);
        }
    }
}

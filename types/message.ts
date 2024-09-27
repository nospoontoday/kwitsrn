export type Message = {
    id: string;
    message: string;
    type: string;
    sender_id: string;
    group_id: string;
    expense_id: string;
    created_at: Date;
    updated_at: Date;
}
export type Conversation = {
    id: number;
    avatar_url: string;
    is_group: boolean;
    is_user: boolean;
    is_admin: boolean;
    public_key: string;
    created_at: Date;
    updated_at: Date;
    blocked_at: string;
    last_message: string;
    last_message_date: string | null;
}
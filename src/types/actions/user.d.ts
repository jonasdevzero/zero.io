import { ContactI, GroupI, NotificationI, InvitationI } from '../user'

export interface UpdateUser {
    name?: string
    username?: string
    picture?: string
    email?: string
}

type RoomType = 'contact' | 'group'

export interface UpdateRoom {
    where: string | string[]
    set: {
        name?: string
        username?: string
        picture?: string
        messages?: []
        unread_messages?: number
        description?: string
        block?: boolean
        you_block?: boolean
        online?: boolean
    }
    roomType: RoomType
}

export interface RemoveRoom {
    roomType: RoomType
    roomId: string
}

export interface PushMessage {
    where: string | string[]
    data: any
    roomType: RoomType
}

export interface RemoveMessage {
    where: string
    messageId: string
    roomType: RoomType
}

export type PushData = ContactI | GroupI | NotificationI | InvitationI
export type PushDataType = 'contacts' | 'groups' | 'notifications' | 'invitations'

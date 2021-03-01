import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, JoinColumn, BeforeInsert } from "typeorm";
import { GroupMessages, GroupUsers } from "./";

@Entity("group")
export default class Group extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    image: string;

    @Column("uuid")
    created_by: string;

    @Column({ name: "last_message_sender", type: "uuid" })
    lastMessageSender: string;

    @Column({ name: "last_message" })
    lastMessage: string;

    @Column({ name: "last_message_time" })
    lastMessageTime: Date;

    @Column()
    created_at: Date;

    @Column()
    updated_at: Date;

    @OneToMany(_ => GroupMessages, messages => messages.group, {
        cascade: ["update", "remove"],
    })
    @JoinColumn({ name: "group_id" })
    messages: GroupMessages[];

    @OneToMany(_ => GroupUsers, users => users.group, {
        cascade: ["update", "remove"],
    })
    @JoinColumn({ name: "group_id" })
    users: GroupUsers[];

    @BeforeInsert()
    private setCreatedAt() {
        const date = new Date();

        this.lastMessage = "";
        this.lastMessageSender = this.created_by;
        this.lastMessageTime = date; 
        this.created_at = date;
        this.updated_at = date; 
    };
};
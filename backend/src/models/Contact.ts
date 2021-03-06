import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, JoinColumn, OneToMany, BeforeInsert } from "typeorm";
import { User, ContactMessages } from "./";

@Entity("contact")
export default class Contact extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("uuid")
    contact_id: string;

    @Column()
    contact_username: string;

    @Column()
    contact_image: string;

    @Column()
    unread_messages: number;

    @Column()
    active: boolean;

    @Column()
    blocked: boolean;

    @ManyToOne(_ => User, user => user.contacts)
    @JoinColumn({ name: "user_id" })
    user: User;

    @OneToMany(_ => ContactMessages, messages => messages.contact, {
        cascade: ["update", "remove"],
    })
    @JoinColumn({ name: "id_contact" })
    messages: ContactMessages[];

    @BeforeInsert() 
    private setBlocked() {
        this.blocked = false;
    };
};

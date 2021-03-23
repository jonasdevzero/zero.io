import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Group, GroupUsers, User, GroupMessages } from "../models";
import { GroupUsersView, GroupView } from "../views";

export default {
    async index(request: Request, response: Response) {
        try {
            const id = response.locals.user.id; // from auth route
            const groupRepository = getRepository(Group);

            const groups = await groupRepository
                .createQueryBuilder("group")
                .orderBy("group.last_message_time", "DESC")
                .leftJoinAndSelect("group.users", "users")
                .leftJoinAndSelect("users.user", "user")
                .where("user.id = :id", { id })
                .getMany();

            return response.status(200).json({ groups: GroupView.renderMany(groups) });
        } catch (err) {
            console.log(err);
            return response.status(500).json({ message: "Internal server error" })
        };
    },

    async create(request: Request, response: Response) {
        try {
            const id = response.locals.user.id;
            const { name, description, members } = request.body;

            const userRepository = getRepository(User);
            const user = await userRepository.findOne(id);

            if (!user)
                return response.status(400).json({ message: "Invalid id" });

            let image = undefined, image_key = undefined;
            if (request.file) {
                // I'm changed the Express.Multer.File interface adding the location variable as string | undefined;   
                const { location, filename } = request.file;

                image = process.env.STORAGE_TYPE === "s3" ? location : `${process.env.APP_URL}/files/${filename}`;
                image_key = filename;
            };

            const now = new Date();

            const groupRepository = getRepository(Group);
            const group = await groupRepository.create({ name, image: image, description, created_by: id, image_key, last_message_time: now }).save();

            const groupUsersRepository = getRepository(GroupUsers);
            await groupUsersRepository.create({ user, group, role: "admim" }).save();

            if (members) {
                const membersArray = Array.isArray(members) ? members : [members];
                const groupUsersRepository = getRepository(GroupUsers);

                membersArray.forEach(async (member_id: string) => {
                    await groupUsersRepository.create({ user: { id: member_id }, group, role: "user" }).save();
                });
            };

            return response.status(200).json({ group: GroupView.render(group) });
        } catch (err) {
            console.log(err);
            return response.status(500).json({ message: "Internal server error!" });
        };
    },

    async update(request: Request, response: Response) {
        try {
            const { id } = request.params;
            const user_id = response.locals.user.id; // from auth route
            const { unread_messages } = request.query;

            const groupUsersRepository = getRepository(GroupUsers);
            const groupUser = await groupUsersRepository.findOne({ where: { user: { id: user_id }, group: { id } } })

            if (!groupUser)
                return response.status(400).json({ message: "Incorrect group Id" });

            if (unread_messages === "true") {
                await groupUsersRepository.update(groupUser, { unread_messages: undefined });
                return response.status(200).json({ message: "ok" });
            };
        } catch (err) {
            console.log(err);
        };
    },

    async indexMessages(request: Request, response: Response) {
        try {
            const group_id = request.query.group_id?.toString();

            const groupMessagesRepository = getRepository(GroupMessages);
            const messages = await groupMessagesRepository.find({ group_id });

            return response.status(200).json({ messages });
        } catch (err) {
            console.log(err);
            return response.status(500).json({ message: "Internal Server Error" });
        };
    },

    async createMessage(request: Request, response: Response) {
        try {
            const sender_id = response.locals.user.id; // from auth route
            const { group_id, message } = request.body;

            const groupRepository = getRepository(Group);
            const groupUsersRepository = getRepository(GroupUsers);
            const groupMessagesRepository = getRepository(GroupMessages);

            const posted_at = new Date();

            const messageData = await groupMessagesRepository.create({ sender_id, group_id, message, posted_at }).save();

            const group = await groupRepository.findOne({ where: { id: group_id }, relations: ["users", "users.user"] });
            if (!group)
                return response.status(400).json({ message: "Group_id Incorrect" });

            group?.users.forEach(async (groupUser) => {
                if (groupUser.user.id !== sender_id) {
                    const id = groupUser.id;
                    const unread_messages = groupUser.unread_messages ? ++groupUser.unread_messages : 1;
                    await groupUsersRepository.update(id, { unread_messages });
                };
            });

            const groupUsers = await groupUsersRepository.find({ where: { group: { id: group_id } }, relations: ["user"] });

            const newMessage = {
                ...messageData,
                users: GroupUsersView.renderUsers(groupUsers),
            };

            return response.status(201).json({ message: newMessage });
        } catch (err) {
            console.log(err);
            return response.status(500).json({ message: "Internal Server Error" });
        };
    },
};

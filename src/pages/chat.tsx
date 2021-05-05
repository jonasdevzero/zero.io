import Head from 'next/head';
import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import { api, userService, socket } from "../services";
import { UserI, ContactI, GroupI } from "../types/user";
import { useSetUserMaster } from "../utils";
import Cookies from 'js-cookie';

import {
    Container,
    Inner,
    ContainerWithoutChat,
} from '../styles/pages/chat';
import {
    Sidebar,
    Messages,
    Profile,
    AddContact,
    CreateGroup,
    LoadingContainer,
    Call,
} from "../components"

interface ChatI {
    theme: "light" | "dark";
    setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>
};

export default function Chat({ theme, setTheme }: ChatI) {
    const [user, setUser] = useState<UserI>();
    const setUserMaster = useSetUserMaster(user, setUser);

    const [currentContainer, setCurrentContainer] = useState<'profile' | "messages" | "addContact" | "createGroup">("messages");

    const [currentRoom, setCurrentRoom] = useState<ContactI & GroupI>(undefined);
    const [currentRoomType, setCurrentRoomType] = useState<"contact" | "group">("contact");

    const router = useRouter();

    const [loading, setLoading] = useState(true);

    const [startingOrReceivingCall, setStartingOrReceivingCall] = useState<'starting' | 'receiving'>(undefined);
    const [userCall, setUserCall] = useState<ContactI>(undefined); // call from or call to
    const [callerSignal, setCallerSignal] = useState(undefined);
    const [callType, setCallType] = useState<'video' | 'audio'>(undefined);
    const [callMinimized, setCallMinimized] = useState(false);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) router.replace("/signin");

        Cookies.remove('test')
        socket.connect();
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        userService.auth()
            .then(user => {
                setUser(user);
                setLoading(false);
            })
            .catch(() => router.replace('/signin'));

        return () => {
            socket.disconnect();
            socket.off("private-message");
            socket.off("group-message");
            socket.off("contact");
            socket.off("group");
        };
    }, []);

    useEffect(() => {
        socket
            .removeListener('private-message')
            .removeListener('group-listener')
            .removeListener('contact')
            .removeListener('group')
            .removeListener('call')

        socket.once('ready', (contactsOnline) => {
            console.log('contacts online', contactsOnline)
        })

        socket.on("private-message", message => {
            const sender = message.sender_id, receiver = message.contact.id;

            const existsContact = user?.contacts?.find(c => c?.id === sender);
            if (!existsContact && user?.id === receiver) {
                api.get(`/contact/${sender}`).then(response => {
                    const contact: ContactI = response.data.contact;

                    socket.emit("user", { event: "addContact", contactId: contact.id }, (isOnline: boolean) => {
                        contact.online = isOnline;
                        setUserMaster.contacts.push(contact);
                    });
                });
            } else {
                const currentContactId = currentRoom?.id;
                setUserMaster.contacts.pushMessage({ where: [sender, receiver], message, currentContactId });
            };
        });

        socket.on("group-message", message => {
            const group_id = message.group_id, currentGroupId = currentRoom?.id;

            setUserMaster.groups.pushMessage({ where: group_id, message, currentGroupId });
        });

        socket.on("contact", ({ event, data }) => {
            switch (event) {
                case "update":
                    const { where, set } = data;
                    setUserMaster.contacts.update({ where, set })
                    break;
            };
        });

        socket.on("group", ({ event, group }) => {
            switch (event) {
                case "new":
                    socket.emit("group", { event: "join", groupId: group.id }, () => {
                        setUserMaster.groups.push(group);
                    });
                    break;
            };
        });

        socket.on("call", ({ event, signal, callType, callFrom }) => {
            switch (event) {
                case 'request':
                    setUserCall(user.contacts.find(contact => contact.id === callFrom));
                    setCallerSignal(signal);
                    setCallType(callType);
                    setStartingOrReceivingCall('receiving');
                    break
                case 'finished':
                    navigator.mediaDevices.getUserMedia({ video: false, audio: false }).then(() => {
                        socket.removeListener('call-accepted');
                        socket.removeListener('call-rejected');
                        endCall();
                    });
                    break
            }
        });
    }, [user, currentRoom]);

    function startCall(contact: ContactI, type: 'video' | 'audio') {
        setUserCall(contact);
        setCallType(type);
        setStartingOrReceivingCall('starting');
    };

    function endCall() {
        setUserCall(undefined);
        setCallType(undefined);
        setStartingOrReceivingCall(undefined);
    };

    function rejectCall() {
        socket.emit('call', { event: 'rejected', to: userCall.id }, () => endCall());
    };

    return (
        <Container>
            <Head>
                <title>Zero | Chat</title>
            </Head>

            {!loading ? (
                <>
                    <Sidebar
                        user={user}
                        currentContainer={currentContainer}
                        setCurrentContainer={setCurrentContainer}
                        setCurrentRoom={setCurrentRoom}
                        setCurrentRoomType={setCurrentRoomType}
                        theme={theme}
                        setTheme={setTheme}
                        callMinimized={callMinimized}
                        setCallMinimized={setCallMinimized}
                    />

                    <Inner>
                        {function () {
                            switch (currentContainer) {
                                case 'profile':
                                    return (
                                        <Profile
                                            user={user}
                                            setUserMaster={setUserMaster}
                                            theme={theme}
                                        />
                                    );
                                case 'messages':
                                    if (!currentRoom) {
                                        return (
                                            <ContainerWithoutChat>
                                                <h1>Select or serach a room to chat</h1>
                                            </ContainerWithoutChat>
                                        );
                                    };

                                    return (
                                        <Messages
                                            user={user}
                                            currentRoom={currentRoom}
                                            currentRoomType={currentRoomType}
                                            setUserMaster={setUserMaster}
                                            startCall={startCall}
                                            theme={theme}
                                        />
                                    );
                                case 'addContact':
                                    return (
                                        <AddContact
                                            user={user}
                                            setUserMaster={setUserMaster}
                                            setCurrentRoom={setCurrentRoom}
                                            setCurrentRoomType={setCurrentRoomType}
                                            setCurrentContainer={setCurrentContainer}
                                        />
                                    );
                                case 'createGroup':
                                    return (
                                        <CreateGroup
                                            user={user}
                                            setUserMaster={setUserMaster}
                                            setCurrentRoom={setCurrentRoom}
                                            setCurrentRoomType={setCurrentRoomType}
                                            setCurrentContainer={setCurrentContainer}
                                            theme={theme}
                                        />
                                    );
                            };
                        }()}

                        {startingOrReceivingCall ? (
                            <Call
                                userCall={userCall}
                                callerSignal={callerSignal}
                                startingOrReceivingCall={startingOrReceivingCall}
                                callType={callType}
                                callMinimized={callMinimized}
                                setCallMinimized={setCallMinimized}
                                endCall={endCall}
                                rejectCall={rejectCall}
                            />
                        ) : null}
                    </Inner>
                </>
            ) : (<LoadingContainer theme={theme} />)}
        </Container>
    );
};
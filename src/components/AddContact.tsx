import { useState, Dispatch, SetStateAction } from "react";
import { UserI } from "../types/user";
import { SetUserMasterI } from "../types/useSetUserMaster";
import { api, socket } from "../services";
import useDebounce from '../hooks/useDebounce';
import { useDispatch } from 'react-redux'
import { setCurrentRoom } from '../store/actions/currentRoom'

import {
    Container,
    Header,
    Inner,
} from "../styles/components/BaseContainer";
import {
    Form,
    Input,
    Contacts,
    Contact,
    Submit,
    WrapperAvatar,
    Initial,
} from "../styles/components/AddContact";
import { Avatar } from "@material-ui/core";
import {
    Search as SearchIcon,
    Add as AddIcon,
} from "@material-ui/icons";

interface AddContactI {
    user: UserI;
    setUserMaster: SetUserMasterI;
    setCurrentContainer: Dispatch<SetStateAction<"profile" | "messages" | "addContact" | "createGroup">>;
};

export default function AddContact({ user, setUserMaster, setCurrentContainer, }: AddContactI) {
    const [username, setUsername] = useState("");
    const [contacts, setContacts] = useState<UserI[]>();

    const dispatch = useDispatch()

    async function add(contact: UserI) {
        await api.post(`/contact`, { contact_id: contact.id }).then(response => {
            const newContact = response.data.contact;

            socket.emit("contact", { contactId: newContact.id, event: "addContact" }, (isOnline: boolean) => {
                newContact.online = isOnline;

                setUserMaster.contacts.push(newContact).then(() => {
                    dispatch(setCurrentRoom(newContact, 'contact'))
                    setCurrentContainer("messages");
                });
            });
        });
    };

    useDebounce(() => {
        if (username.length > 0) {
            api.get(`/user?username=${username}`).then(response => {
                const users = response.data.user;
                setContacts(users.filter((u: UserI) => u.id !== user.id && !(user.contacts.find(c => c.id === u.id))));
            });
        } else {
            setContacts(undefined)
        };
    }, [username], 500);

    return (
        <Container>
            <Header>
                <h1>Add Contact</h1>
            </Header>

            <Inner>
                <Form onSubmit={e => e.preventDefault()}>
                    <Input
                        placeholder="Type an username"
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />

                    <Submit type="button">
                        <SearchIcon />
                    </Submit>
                </Form>

                <Contacts>
                    {contacts ? contacts.map((contact, i) => {
                        return (
                            <Contact onClick={() => add(contact)} key={i}>
                                <WrapperAvatar>
                                    <Avatar src={contact.picture} />
                                    <p>{contact.username}</p>
                                </WrapperAvatar>

                                <AddIcon fontSize="large" />
                            </Contact>
                        );
                    }) : (
                        <Initial>
                            <strong>Search for users to add to your contacts</strong>
                        </Initial>
                    )}
                </Contacts>
            </Inner>
        </Container>
    );
};

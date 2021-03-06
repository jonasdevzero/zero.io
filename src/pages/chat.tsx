import Head from 'next/head'
import { useRouter } from "next/router"
import { useState, useEffect } from 'react'
import { userService, socket } from "../services"
import { useDispatch } from 'react-redux'
import { setUser } from '../store/actions/user'

import { Container } from '../styles/pages/chat'
import {
    Sidebar,
    Room,
    ChatScreens,
    LoadingContainer,
    Call,
} from "../components"

export default function Chat() {
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const dispatch = useDispatch()

    useEffect(() => {
        userService.connect()
            .then(user => dispatch(setUser(user)))
            .then(() => setLoading(false))
            .catch(() => router.replace('/signin'))

        return () => { socket.disconnect() }
    }, [])

    return (
        <Container>
            <Head>
                <title>Zero | Chat</title>
            </Head>

            {!loading ? (
                <>
                    <Sidebar />
                    <Room />
                    <ChatScreens />
                    <Call />
                </>
            ) : (<LoadingContainer />)}
        </Container>
    )
}

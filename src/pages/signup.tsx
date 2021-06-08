import Head from 'next/head'
import { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { userService } from "../services"
import { useWarn } from '../hooks'

import { Header, Footer } from "../components"
import {
    Container,
    Inner,
    Form,
    FormTitle,
    InputWrapper,
    Label,
    Input,
    Submit,
    Links,
    RedirectLink,
    FormStepProgress,
    FormStepBack,
    ErrorMessage,
} from "../styles/pages/base"
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { AxiosError } from 'axios'

export default function SignUp() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")

    const [currentStep, setCurrentStep] = useState(0)
    const [error, setError] = useState(undefined)

    const router = useRouter()
    const warn = useWarn()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError(undefined)
        userService.subscribe({ username, password, confirmPassword, name, email })
            .then(handleSucess)
            .catch(handleError)
    }

    function handleSucess() {
        warn.success('Welcome to  Zero')
        setTimeout(() => router.push('/chat'), 3000)
    }

    function handleError(error: AxiosError) {
        const { message } = error.response.data
        setError(message)
        setCurrentStep(0)
    }

    return (
        <Container>
            <Head>
                <title>Zero | Sign Up</title>
            </Head>

            <Header />

            <Inner>
                <Form onSubmit={handleSubmit}>
                    <FormTitle>Sign Up</FormTitle>

                    {error && (<ErrorMessage>{error}</ErrorMessage>)}

                    {currentStep === 0 ? (
                        <>
                            <InputWrapper>
                                <Label htmlFor='username'>Username</Label>
                                <Input id='username' type='text' value={username} onChange={e => setUsername(e.target.value)} />
                            </InputWrapper>

                            <InputWrapper>
                                <Label htmlFor='password'>Password</Label>
                                <Input id='password' type='password' value={password} onChange={e => setPassword(e.target.value)} />
                            </InputWrapper>

                            <InputWrapper>
                                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                                <Input id='confirmPassword' type='password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            </InputWrapper>

                            <Submit type='button' onClick={() => setCurrentStep(1)}>Next</Submit>
                        </>
                    ) : currentStep === 1 ? (
                        <>
                            <InputWrapper>
                                <Label htmlFor='name'>Name</Label>
                                <Input id='name' type='text' value={name} onChange={e => setName(e.target.value)} />
                            </InputWrapper>

                            <InputWrapper>
                                <Label htmlFor='email'>E-mail</Label>
                                <Input id='email' type='text' value={email} onChange={e => setEmail(e.target.value)} />
                            </InputWrapper>

                            <Submit type='submit'>Sign Up</Submit>
                        </>
                    ) : null}

                    <Links>
                        <Link href='/signin'>
                            <RedirectLink>Already a member?</RedirectLink>
                        </Link>
                    </Links>

                    {currentStep > 0 ? (
                        <FormStepBack onClick={() => setCurrentStep(currentStep - 1)}>
                            <ArrowBackIosIcon fontSize='large' />
                        </FormStepBack>
                    ) : null}

                    <FormStepProgress step={currentStep} />
                </Form>
            </Inner>

            <Footer />
        </Container>
    )
}

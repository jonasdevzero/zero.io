import styled from "styled-components";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;

    width: 100%;
    height: 100%;

    background-color: #303030;

    overflow-y: scroll;
`;

export const Header = styled.header`
    display: flex;
    align-items: flex-end;

    padding: 0 3rem;
    margin: 0 9rem;
    margin-top: 4.6rem;
    border-bottom: solid .1rem #777;

    h1 {
        font-size: 4rem;
        font-weight: 700;
        margin-bottom: 2rem;
    };
`;

export const Inner = styled.div`
    width: 60rem;
    margin: 2.5rem auto;
    padding: 3.5rem;
    border-radius: .7rem;

    background-color: #2c2c2c;
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    align-items: center;

    margin-bottom: 3rem;
    padding: 3rem;
    padding-bottom: 2rem;

    background-color: #2f2f2f;
    border-radius: 1rem;
`;

export const InputWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;

    margin-bottom: 2rem;

    &.row {
        flex-direction: row;
        align-items: center;
    };
`;

export const Label = styled.label`
    display: flex;
    align-items: center;

    color: lightgray;
    font-size: 1.4rem;
    margin-bottom: .5rem;

    .MuiSvgIcon-root {
        margin-left: .5rem;
        cursor: pointer;
    };
`;

export const Input = styled.input`
    height: 4rem;
    width: 100%;

    border: none;
    border-radius: .7rem;
    outline: none;

    padding: 0 .7rem;

    font-size: 1.6rem;
    color: #fff;
    background-color: #353535;
`;

export const Button = styled.button`
    height: 4rem;

    color: #fff;
    font-size: 1.4rem;
    background-color: #222;

    margin-left: 1rem;
    padding: .5rem 2rem;
    border: none;
    border-radius: .7rem;
    outline: none;
    cursor: pointer;

    &.password {
        margin: 0;
    };
    &.delete {
        background-color: red;
        font-weight: 700;
    };
`;
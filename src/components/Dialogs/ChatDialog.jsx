/********************************************************************************
 * Copyright (c) 2018 - 2022 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 *
 * SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 ********************************************************************************/
import React, { forwardRef, useCallback, useContext, useEffect, useImperativeHandle } from 'react';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import ediTDorContext from "../../context/ediTDorContext";
import * as gptService from '../../services/gptService';

export const ChatDialog = forwardRef((props, ref) => {
    const context = useContext(ediTDorContext);

    const inputRef = React.useRef(null)
    const lastMessageRef = React.useRef(null)
    const scrollToBottom = useCallback(() => {
        try {
            lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
        } catch (_) { }
    }, [lastMessageRef]);

    const [display, setDisplay] = React.useState(false);
    const [currentMessage, setCurrentMessage] = React.useState("");
    const [isWaitingForResponse, setIsWaitingForResponse] = React.useState(false);
    const [messages, setMessages] = React.useState([
        {
            "author": "chat",
            "description": "Send a message and it will be forwarded to a GPT instance. It will assist you in writing your TDs"
        }
    ]);

    useImperativeHandle(ref, () => {
        return {
            openModal: () => open(),
            close: () => close()
        }
    });

    const open = useCallback(() => {
        setTimeout(() => { scrollToBottom() }, 250);
        setDisplay(true);
    }, [scrollToBottom]);

    const close = useCallback(() => {
        setDisplay(false);
    }, []);

    const buildChildren = useCallback(() => {
        let idx = -1;
        return messages.map((message) => {
            idx++;
            if (message.author === "chat") {
                return <div className='chat chat-start text-ellipsis whitespace-pre-line' key={idx}>
                    <div className='chat-bubble bg-gray-500 text-white'>
                        <div className="overflow-x-auto">
                            {message.description}
                        </div>
                    </div>
                </div>;
            }

            return <div className='chat chat-end text-ellipsis whitespace-pre-line' key={idx}>
                <div className='chat-bubble bg-blue-500 text-white'>
                    <div className="overflow-x-auto">
                        {message.description}
                    </div>
                </div>
            </div>;
        });
    }, [messages]);

    const onSubmit = useCallback(async () => {
        if (currentMessage === "") {
            return;
        }

        setIsWaitingForResponse(true);

        const cm = currentMessage;
        setMessages(prevState => [...prevState, { "author": "user", "description": cm }]);
        scrollToBottom();
        setCurrentMessage("");

        const response = await gptService.sendRequest(cm);
        setMessages(prevState => [...prevState, { "author": "chat", "description": response }]);
        scrollToBottom();

        setIsWaitingForResponse(false);
    }, [currentMessage, scrollToBottom]);

    const copyLastMessageToEditor = useCallback(() => {
        context.updateOfflineTD(messages[messages.length - 1].description);
    }, [context, messages]);

    const isLastMessageFromGpt = useCallback(() => {
        return messages[messages.length - 1].author === "chat";
    }, [messages]);

    useEffect(() => {
        const keydownHandler = (e) => {
            if (display && e.key === 'Escape') {
                return close();
            }

            if (isWaitingForResponse) {
                return;
            }

            if (document.activeElement === inputRef.current && e.key === 'Enter') {
                return onSubmit();
            }

            if (display && e.key === 'Enter' && e.ctrlKey) {
                return onSubmit();
            }
        };

        document.addEventListener('keydown', keydownHandler);
        return () => {
            document.removeEventListener('keydown', keydownHandler);
        }
    }, [isWaitingForResponse, display, onSubmit, close, inputRef]);

    useEffect(() => { scrollToBottom() }, [messages, scrollToBottom]);

    if (!display) {
        return null;
    }

    return (
        <div className="flex w-full h-full absolute justify-end items-end z-10 p-4 pointer-events-none">
            <div className="w-full md:w-3/5 lg:w-2/5  max-h-full shadow-xl bg-gray-600 rounded-xl text-white pointer-events-auto">
                <div className="flex flex-col justify-start items-start p-4 ">
                    <div className="flex w-full justify-between pb-4">
                        <h1 className="text-xl font-bold">Ask Your AI Assistant</h1>
                        <button className='bg-gray-500 rounded-xl p-2' onClick={close}>
                            <FaTimes></FaTimes>
                        </button>
                    </div>
                    <div className="overflow-y-auto overflow-x-hidden max-h-[32rem]" >
                        {buildChildren()}
                        <div ref={lastMessageRef} />
                    </div>
                    {isWaitingForResponse &&
                        <div className='chat chat-start'>
                            <div className='chat-bubble bg-gray-500 text-white flex items-center'>
                                <div className='animate-bounce h-1.5 w-1.5 bg-white rounded-full mr-1' />
                                <div className='animate-bounce h-1.5 w-1.5 bg-white rounded-full mr-1' />
                                <div className='animate-bounce h-1.5 w-1.5 bg-white rounded-full' />
                            </div>
                        </div>
                    }
                    {isLastMessageFromGpt() && !isWaitingForResponse &&
                        <button className="link pt-2" onClick={copyLastMessageToEditor}>
                            Copy last message to editor
                        </button>
                    }
                    <div className="flex w-full pt-4">
                        <input
                            name="Chat"
                            id="Chat"
                            className="grow border-gray-600 bg-gray-600 p-2 sm:text-sm border-2 text-white rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="Start typing..."
                            type="text"
                            autoFocus={true}
                            value={currentMessage}
                            onChange={e => setCurrentMessage(e.target.value)}
                            ref={inputRef}
                        />
                        <button id="submitButton" className="flex text-white justify-center items-center bg-blue-500 ml-2 py-2 px-4 rounded-lg" onClick={() => onSubmit()}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});


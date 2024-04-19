import { useTranslation } from 'react-i18next';
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAuthenticated, selectInit } from '@/store/auth.ts';
import {
    listenMessageEvent,
    selectCurrent,
    selectModel,
    selectSupportModels,
    useMessageActions,
    useMessages,
    useWorking
} from '@/store/chat.ts';
import { formatMessage } from '@/utils/processor.ts';
import ChatInterface from '@/components/home/ChatInterface.tsx';
import { clearHistoryState, getQueryParam } from '@/utils/path.ts';
import { forgetMemory, popMemory } from '@/utils/memory.ts';
import { useToast } from '@/components/ui/use-toast.ts';
import { ToastAction } from '@/components/ui/toast.tsx';
import { alignSelector } from '@/store/settings.ts';
import { FileArray } from '@/api/file.ts';
import ChatSpace from '@/components/home/ChatSpace.tsx';
import ActionButton from '@/components/home/assemblies/ActionButton.tsx';
import ChatInput from '@/components/home/assemblies/ChatInput.tsx';
import { cn } from '@/components/ui/lib/utils.ts';
import { goAuth } from '@/utils/app.ts';
import { getModelFromId } from '@/conf/model.ts';
import NavBar from '@/components/app/NavBar.tsx';

function fileReducer(state: FileArray, action: Record<string, any>): FileArray {
    switch (action.type) {
        case 'add':
            return [...state, action.payload];
        case 'remove':
            return state.filter((_, i) => i !== action.payload);
        case 'clear':
            return [];
        default:
            return state;
    }
}

function ChatWrapper() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { send: sendAction } = useMessageActions();
    const process = listenMessageEvent();
    const [files, fileDispatch] = useReducer(fileReducer, []);
    const [input, setInput] = useState('');
    const [needScroll, setNeedScroll] = useState(false);
    const init = useSelector(selectInit);
    const current = useSelector(selectCurrent);
    const auth = useSelector(selectAuthenticated);
    const model = useSelector(selectModel);
    const target = useRef(null);
    const align = useSelector(alignSelector);
    const contentWrapperRef = React.useRef<HTMLDivElement>(null);
    const messages = useMessages();
    const [showScrollDownButton, setShowScrollDownButton] = useState(false);
    const scrollToBottom = () => {
        setShowScrollDownButton(false);
        if (contentWrapperRef?.current) {
            const el = contentWrapperRef.current;
            el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }
    };
    const working = useWorking();
    const supportModels = useSelector(selectSupportModels);

    const requireAuth = useMemo(
        (): boolean => !!getModelFromId(supportModels, model)?.auth,
        [model]
    );

    const [instance, setInstance] = useState<HTMLElement | null>(null);
    void instance;

    function clearFile() {
        fileDispatch({ type: 'clear' });
    }

    async function processSend(
        data: string,
        passAuth?: boolean
    ): Promise<boolean> {
        if (requireAuth && !auth && !passAuth) {
            toast({
                title: t('login-require'),
                action: (
                    <ToastAction altText={t('login')} onClick={goAuth}>
                        {t('login')}
                    </ToastAction>
                )
            });
            return false;
        }

        if (working) return false;

        const message: string = formatMessage(files, data);
        if (message.length > 0 && data.trim().length > 0) {
            if (await sendAction(message)) {
                forgetMemory('history');
                clearFile();
                return true;
            }
        }
        return false;
    }

    async function handleSend() {
        if (await processSend(input)) {
            setInput('');
        }
        scrollToBottom();
    }

    async function handleCancel() {
        process({ id: current, event: 'stop' });
    }

    useEffect(() => {
        window.addEventListener('load', () => {
            const el = document.getElementById('input');
            if (el) el.focus();
        });
    }, []);

    useEffect(() => {
        if (!init) return;
        const query = getQueryParam('q').trim();
        if (query.length > 0) processSend(query).then();
        clearHistoryState();
    }, [init]);

    useEffect(() => {
        const history: string = popMemory('history');
        if (history.length) {
            setInput(history);
            toast({
                title: t('chat.recall'),
                description: t('chat.recall-desc'),
                action: (
                    <ToastAction
                        altText={t('chat.recall-cancel')}
                        onClick={() => {
                            setInput('');
                        }}
                    >
                        {t('chat.recall-cancel')}
                    </ToastAction>
                )
            });
        }
    }, []);

    return (
        <div className={`chat-container`}>
            <div className={`chat-wrapper`}>
                <NavBar />
                {messages.length > 0 ? (
                    <ChatInterface
                        setTarget={setInstance}
                        needScroll={needScroll}
                        ref={contentWrapperRef}
                        setShowScrollDownButton={setShowScrollDownButton}
                        showScrollDownButton={showScrollDownButton}
                    />
                ) : (
                    <ChatSpace />
                )}
                <div className={`chat-input`}>
                    <div className={`input-wrapper`}>
                        <div className={`chat-box no-scrollbar`}>
                            <ChatInput
                                className={cn(align && 'align')}
                                target={target}
                                value={input}
                                onValueChange={setInput}
                                onEnterPressed={handleSend}
                            />
                        </div>
                        <ActionButton
                            working={working}
                            onClick={() => {
                                setNeedScroll(true);
                                working ? handleCancel() : handleSend();
                            }}
                        />
                    </div>
                    <div className={`input-options`}></div>
                </div>
            </div>
        </div>
    );
}

export default ChatWrapper;

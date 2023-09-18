import "../assets/generation.less";
import {useSelector} from "react-redux";
import {selectAuthenticated} from "../store/auth.ts";
import {useTranslation} from "react-i18next";
import {Button} from "../components/ui/button.tsx";
import {ChevronLeft, Info, LogIn, Send} from "lucide-react";
import {login} from "../conf.ts";
import router from "../router.ts";
import {Input} from "../components/ui/input.tsx";
import {useEffect, useRef, useState} from "react";
import SelectGroup from "../components/SelectGroup.tsx";

type WrapperProps = {
    onSend?: (value: string) => boolean,
}

function Wrapper(props: WrapperProps) {
    const ref = useRef(null);
    const [ model, setModel ] = useState('GPT-3.5');

    function handleSend() {
        const target = ref.current as HTMLInputElement | null;
        if (!target) return;

        const value = target.value.trim();
        if (!value.length) return;

        if (props.onSend?.(value)) {
            target.value = '';
        }
    }

    useEffect(() => {
        ref.current && (ref.current as HTMLInputElement).focus();
        ref.current && (ref.current as HTMLInputElement).addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSend();
            }
        });
    })
    return (
        <div className={`generation-wrapper`}>
            <div className={`product`}>
                <img src={`/favicon.ico`} alt={""} />
                AI Code Generator
            </div>
            <div className={`input-box`}>
                <Input className={`input`} ref={ref} />
                <Button size={`icon`} className={`action`} variant={`default`} onClick={handleSend}>
                    <Send className={`h-5 w-5`} />
                </Button>
            </div>
            <div className={`model-box`}>
                <SelectGroup current={model} list={[
                    'GPT-3.5', 'GPT-3.5-16k', 'GPT-4', 'GPT-4-32k'
                ]} onChange={setModel} />
            </div>
        </div>
    )
}
function Generation() {
    const { t } = useTranslation();
    const auth = useSelector(selectAuthenticated);

    return (
        <div className={`generation-page`}>
            {
                auth ?
                    <div className={`generation-container`}>
                        <Button className={`action`} variant={`ghost`} size={`icon`} onClick={
                            () => router.navigate("/")
                        }>
                            <ChevronLeft className={`h-5 w-5 back`} />
                        </Button>
                        <Wrapper onSend={(value: string) => {
                            console.log(value);
                            return true;
                        }} />
                    </div> :
                    <div className={`login-action`}>
                        <div className={`tip`}>
                            <Info className={`h-4 w-4 mr-2`} />
                            { t('login-require') }
                        </div>
                        <Button size={`lg`} onClick={login}>
                            <LogIn className={`h-4 w-4 mr-2`} />
                            <p className={`text`}>
                                { t('login') }
                            </p>
                        </Button>
                    </div>
            }
        </div>
    )
}

export default Generation;

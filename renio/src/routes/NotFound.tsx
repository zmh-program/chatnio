import '../assets/404.less'
import {Button} from "../components/ui/button.tsx";
import { HelpCircle } from "lucide-react";
import router from "../router.ts";

function NotFound() {
    return (
        <div className={`error-page`}>
            <HelpCircle className={`icon`} />
            <h1>404</h1>
            <p>Page not found</p>
            <Button onClick={() => router.navigate('/')}>Home</Button>
        </div>
    )
}

export default NotFound

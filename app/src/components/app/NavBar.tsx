import '@/assets/pages/navbar.less';
import { useDispatch } from 'react-redux';
import { validateToken } from '@/store/auth.ts';
import { Button } from '@/components/ui/button.tsx';
import { Menu } from 'lucide-react';
import { useEffect } from 'react';
import { tokenField } from '@/conf/bootstrap.ts';
import { toggleMenu } from '@/store/menu.ts';
import ModeToggle from '@/components/ThemeProvider.tsx';
import { getMemory } from '@/utils/memory.ts';
import Announcement from '@/components/app/Announcement.tsx';
import {
    MaskAction,
    SettingsAction
} from '@/components/home/assemblies/ChatAction.tsx';
import ModelFinder from '@/components/home/ModelFinder.tsx';

function NavBar() {
    const dispatch = useDispatch();
    useEffect(() => {
        validateToken(dispatch, getMemory(tokenField));
    }, []);

    return (
        <nav className={`navbar`}>
            <div className={`items`}>
                <Button
                    size={`icon`}
                    variant={`ghost`}
                    onClick={() => dispatch(toggleMenu())}
                >
                    <Menu />
                </Button>
                <div className={`grow`} />
                <ModelFinder />
                <Announcement />
                <MaskAction />
                <ModeToggle />
                <SettingsAction />
            </div>
        </nav>
    );
}

export default NavBar;

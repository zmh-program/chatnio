import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog.tsx";
import {Button} from "../components/ui/button.tsx";
import "../assets/package.less";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {dialogSelector, refreshPackage} from "../store/package.ts";
import {useEffect} from "react";

function Package() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector(dialogSelector);
  useEffect(() => {
    refreshPackage(dispatch);
  }, []);

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Package;

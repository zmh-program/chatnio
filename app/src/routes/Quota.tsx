import {useDispatch, useSelector} from "react-redux";
import {dialogSelector, refreshQuota, setDialog} from "../store/quota.ts";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog.tsx";
import "../assets/quota.less";
import {BadgePercent, Cloud, ExternalLink, HardDriveDownload, HardDriveUpload, Plus} from "lucide-react";
import {Input} from "../components/ui/input.tsx";
import {testNumberInputEvent} from "../utils.ts";
import {Button} from "../components/ui/button.tsx";
import {Separator} from "../components/ui/separator.tsx";

type AmountComponentProps = {
  amount: number;
  active?: boolean;
  other?: boolean;
  onClick?: () => void;
}
function AmountComponent({ amount, active, other, onClick }: AmountComponentProps) {
  const { t } = useTranslation();

  return (
    <div className={`amount ${active ? 'active' : ''}`} onClick={onClick}>
      { (!other) ?
        <>
          <div className={`amount-title`}>
            <Cloud className={`h-4 w-4`} />
            { (amount * 10).toFixed(0) }
          </div>
          <div className={`amount-desc`}>
            { amount.toFixed(2) }
          </div>
        </>
        : <div className={`other`}>{ t('buy.other') }</div>
      }
    </div>
  )
}

function Quota() {
  const { t } = useTranslation();
  const [ current, setCurrent ] = useState(0);
  const [ amount, setAmount ] = useState(0);
  const open = useSelector(dialogSelector);
  const dispatch = useDispatch();
  useEffect(() => {
    refreshQuota(dispatch);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(state: boolean) => dispatch(setDialog(state))}>
      <DialogContent className={`quota-dialog`}>
        <DialogHeader>
          <DialogTitle>{ t('buy.choose') }</DialogTitle>
          <DialogDescription asChild>
            <div className={`dialog-wrapper`}>
              <div className={`buy-interface`}>
                <div className={`interface-item`}>
                  <div className={`amount-container`}>
                    <div className={`amount-wrapper`}>
                      <AmountComponent amount={1} active={current === 1} onClick={() => { setCurrent(1); setAmount(10) }} />
                      <AmountComponent amount={5} active={current === 2} onClick={() => { setCurrent(2); setAmount(50) }} />
                      <AmountComponent amount={25} active={current === 3} onClick={() => { setCurrent(3); setAmount(250) }} />
                      <AmountComponent amount={NaN} other={true} active={current === 4} onClick={() => setCurrent(4)} />
                    </div>
                    {
                      (current === 4) &&
                      <div className={`other-wrapper`}>
                        <div className={`amount-input-box`}>
                          <Cloud className={`h-4 w-4`} />
                          <Input className={`amount-input`} placeholder={t('buy.other-desc')} value={amount} onKeyDown={
                            (e) => {
                              if (testNumberInputEvent(e)) {
                                switch (e.key) {
                                  case 'ArrowUp':
                                    setAmount(amount + 1);
                                    break;
                                  case 'ArrowDown':
                                    setAmount(amount - 1);
                                    break;
                                }
                              }
                            }
                          } onChange={
                            (e) => {
                              if (e.target.value !== '') {
                                setAmount(parseInt(e.target.value));
                                if (amount > 99999) {
                                  setAmount(99999);
                                }
                              } else {
                                setAmount(0);
                              }
                            }
                          } maxLength={5} />
                        </div>
                        <div className={`amount-number`}>
                          { (amount / 10).toFixed(2) } CNY
                        </div>
                      </div>
                    }
                  </div>
                  <div className={`buy-action`}>
                    <Button variant={`default`} className={`buy-button`}>
                      <Plus className={`h-4 w-4 mr-2`} />
                      { t('buy.buy', { amount }) }
                    </Button>
                  </div>
                </div>
                <div className={`line`} />
                <div className={`interface-item grow`}>
                  <div className={`product-item`}>
                    <div className={`row title`}>
                      <div>{ t('buy.dalle') }</div>
                      <div className={`grow`} />
                      <div className={`column`}>
                        <Cloud className={`h-4 w-4`} /> 1 / image
                      </div>
                    </div>
                    <div className={`row desc`}>
                      <div className={`column`}>
                        <BadgePercent className={`h-4 w-4`} />
                        { t('buy.dalle-free') }
                      </div>
                      <div className={`grow`} />
                      <div className={`column`}>512 x 512</div>
                    </div>
                  </div>
                  <Separator orientation={`horizontal`} className={`my-2`} />
                  <div className={`product-item`}>
                    <div className={`row title`}>
                      <div>{ t('buy.gpt4') }</div>
                      <div className={`grow`} />
                      <div className={`column`}>
                        <Cloud className={`h-4 w-4`} /> { t('buy.flex') }
                      </div>
                    </div>
                    <div className={`row desc`}>
                      <div className={`column`}>
                        <HardDriveUpload className={`h-4 w-4`} />
                        { t('buy.input') }
                      </div>
                      <div className={`grow`} />
                      <div className={`column`}>
                        <Cloud className={`h-4 w-4`} />
                        2.1 / 1k token
                      </div>
                    </div>
                    <div className={`row desc`}>
                      <div className={`column`}>
                        <HardDriveDownload className={`h-4 w-4`} />
                        { t('buy.output') }
                      </div>
                      <div className={`grow`} />
                      <div className={`column`}>
                        <Cloud className={`h-4 w-4`} />
                        4.3 / 1k token
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`tip`}>
                <p>{ t('buy.tip') }</p>
                <Button variant={`outline`} asChild>
                  <a href={`https://openai.com/pricing`} target={`_blank`}>
                    <ExternalLink className={`h-4 w-4 mr-2`} />
                    { t('buy.learn-more') }
                  </a>
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default Quota;

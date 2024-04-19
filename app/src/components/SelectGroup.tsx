import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from './ui/select';
import { mobile } from '@/utils/device.ts';
import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge.tsx';

export type SelectItemBadgeProps = {
    variant: 'default' | 'gold';
    name: string;
};

export type SelectItemProps = {
    name: string;
    value: string;
    badge?: SelectItemBadgeProps;
    tag?: any;
    icon?: React.ReactNode;
};

type SelectGroupProps = {
    current: SelectItemProps;
    list: SelectItemProps[];
    onChange?: (select: string) => void;
    maxElements?: number;
    className?: string;
    classNameDesktop?: string;
    classNameMobile?: string;
    side?: 'left' | 'right' | 'top' | 'bottom';

    selectGroupTop?: SelectItemProps;
    selectGroupBottom?: SelectItemProps;
};

function GroupSelectItem(props: SelectItemProps) {
    return (
        <div className={`mr-1 flex flex-row items-center align-center`}>
            {props.icon && <div className={`mr-1`}>{props.icon}</div>}
            {props.value}
            {props.badge && (
                <Badge
                    className={`select-element badge ml-1 badge-${props.badge.variant}`}
                >
                    {props.badge.name}
                </Badge>
            )}
        </div>
    );
}

function SelectGroupDesktop(props: SelectGroupProps) {
    // 使用解构来简化访问props中的属性
    const {
        list,
        current,
        onChange,
        className,
        selectGroupTop,
        selectGroupBottom
    } = props;

    return (
        <div className={`select-group ${className}`}>
            <Select
                defaultValue={current?.name || '...'}
                value={current?.name || '...'}
                onValueChange={(value: string) => onChange?.(value)}
            >
                <SelectTrigger
                    className={`select-group-item ${
                        list.includes(current) ? 'active' : ''
                    }`}
                >
                    <SelectValue asChild>
                        <span>
                            {current ? current.value : 'Select an option'}
                        </span>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {selectGroupTop && (
                        <SelectItem
                            value={selectGroupTop.name}
                            onClick={() => onChange?.(selectGroupTop.name)}
                        >
                            <GroupSelectItem {...selectGroupTop} />
                        </SelectItem>
                    )}

                    {list.map((select: SelectItemProps, idx: number) => (
                        <SelectItem
                            key={idx}
                            value={select.name}
                            onClick={() => onChange?.(select.name)}
                        >
                            <GroupSelectItem {...select} />
                        </SelectItem>
                    ))}

                    {selectGroupBottom && (
                        <SelectItem
                            value={selectGroupBottom.name}
                            onClick={() => onChange?.(selectGroupBottom.name)}
                        >
                            <GroupSelectItem {...selectGroupBottom} />
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}

function SelectGroupMobile(props: SelectGroupProps) {
    return (
        <div className={`mb-2 w-full`}>
            <Select
                value={props.current?.name || ''}
                onValueChange={(value: string) => {
                    props.onChange?.(value);
                }}
            >
                <SelectTrigger className="select-group mobile whitespace-nowrap flex-nowrap">
                    <SelectValue placeholder={props.current?.value || ''} />
                </SelectTrigger>
                <SelectContent
                    className={`${props.className} ${props.classNameMobile}`}
                >
                    {props.selectGroupTop && (
                        <SelectItem
                            value={props.selectGroupTop.name}
                            onClick={() =>
                                props.onChange?.(props.selectGroupTop!.name)
                            }
                        >
                            <GroupSelectItem {...props.selectGroupTop} />
                        </SelectItem>
                    )}

                    {props.list.map((select: SelectItemProps, idx: number) => (
                        <SelectItem
                            className={`whitespace-nowrap`}
                            key={idx}
                            value={select.name}
                        >
                            <GroupSelectItem {...select} />
                        </SelectItem>
                    ))}

                    {props.selectGroupBottom && (
                        <SelectItem
                            value={props.selectGroupBottom.name}
                            onClick={() =>
                                props.onChange?.(props.selectGroupBottom!.name)
                            }
                        >
                            <GroupSelectItem {...props.selectGroupBottom} />
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}

function SelectGroup(props: SelectGroupProps) {
    const [state, setState] = useState(mobile);
    useEffect(() => {
        window.addEventListener('resize', () => {
            setState(mobile);
        });
    }, []);

    return state ? (
        <SelectGroupMobile {...props} />
    ) : (
        <SelectGroupDesktop {...props} />
    );
}

export default SelectGroup;

'use client'

import * as React from 'react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'

export interface ComboboxOption {
    value: string
    label: string
    disabled?: boolean
}

interface ComboboxProps {
    options: ComboboxOption[]
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    className?: string
    triggerClassName?: string
    disabled?: boolean
    size?: 'sm' | 'default'
}

function Combobox({
    options,
    value,
    onValueChange,
    placeholder = 'Selecciona...',
    searchPlaceholder = 'Buscar...',
    emptyText = 'Sin resultados.',
    className,
    triggerClassName,
    disabled = false,
    size = 'default',
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const selectedLabel = React.useMemo(
        () => options.find((o) => o.value === value)?.label,
        [options, value],
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={disabled}>
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "border-input focus-visible:border-ring focus-visible:ring-ring/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
                        size === 'default' ? 'h-9' : 'h-8',
                        !selectedLabel && 'text-muted-foreground',
                        triggerClassName,
                    )}
                >
                    <span className="truncate">
                        {selectedLabel || placeholder}
                    </span>
                    <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className={cn('p-0', className)}
                align="start"
                style={{ width: 'var(--radix-popover-trigger-width)' }}
            >
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    disabled={option.disabled}
                                    onSelect={() => {
                                        onValueChange?.(option.value)
                                        setOpen(false)
                                    }}
                                >
                                    <span className="truncate flex-1">{option.label}</span>
                                    {value === option.value && (
                                        <CheckIcon className="size-4 shrink-0" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export { Combobox }

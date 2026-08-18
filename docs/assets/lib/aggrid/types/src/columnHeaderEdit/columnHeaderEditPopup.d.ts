import { BeanStub } from 'ag-grid-community';
export declare class ColumnHeaderEditPopup extends BeanStub {
    private readonly params;
    private dialog?;
    private contentComp?;
    private closed;
    private restoreFocusEl;
    private focusEditorTimeout?;
    constructor(params: {
        initialValue: string;
        liveApply: boolean;
        /** Apply `value` to the header. Live mode calls this on every change; deferred mode on commit only. */
        onApply: (value: string) => void;
        onClosed: () => void;
    });
    postConstruct(): void;
    /** Deferred-mode commit: apply the current value, then close. */
    private commit;
    close(): void;
    setValue(value: string): void;
    getValue(): string;
    private onDialogClosed;
    private restoreFocus;
    destroy(): void;
}

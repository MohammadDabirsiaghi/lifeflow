import type { AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService } from 'ag-stack';
import { AgComponentStub } from 'ag-stack';
import type { AgColorPicker } from './agColorPicker';
export declare class AgColorPanel<TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TCommon, TPropertiesService extends IPropertiesService<TProperties, TCommon>, TComponentSelectorType extends string> extends AgComponentStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType> {
    private H;
    private S;
    private B;
    private A;
    private spectrumValRect?;
    private isSpectrumDragging;
    private spectrumHueRect?;
    private isSpectrumHueDragging;
    private spectrumAlphaRect?;
    private isSpectrumAlphaDragging;
    private readonly picker;
    private _Color;
    private colorChanged;
    private tabIndex;
    private readonly spectrumColor;
    private readonly spectrumVal;
    private readonly spectrumDragger;
    private readonly spectrumHue;
    private readonly spectrumHueSlider;
    private readonly spectrumAlpha;
    private readonly spectrumAlphaSlider;
    private readonly colorInput;
    private readonly recentColors;
    constructor(config: {
        picker: AgColorPicker<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType>;
    });
    wireBeans(beans: TBeanCollection): void;
    postConstruct(): void;
    private initTabIndex;
    private refreshSpectrumRect;
    private refreshHueRect;
    private refreshAlphaRect;
    private onSpectrumDraggerDown;
    private onSpectrumDraggerMove;
    private onSpectrumHueDown;
    private onSpectrumHueMove;
    private onSpectrumAlphaDown;
    private onSpectrumAlphaMove;
    private onMouseUp;
    private moveDragger;
    private moveHueSlider;
    private moveAlphaSlider;
    private moveSlider;
    private update;
    /**
     * @param saturation In the [0, 1] interval.
     * @param brightness In the [0, 1] interval.
     */
    setSpectrumValue(saturation: number, brightness: number, suppressColorInputUpdate?: boolean): void;
    private getSpectrumValue;
    private initRecentColors;
    setValue(val: string): void;
    private setColor;
    private onRecentColorClick;
    private addRecentColor;
    destroy(): void;
}

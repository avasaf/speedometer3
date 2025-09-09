import { React, Immutable, type IMState, type UseDataSource, ReactRedux, type Expression, getAppStore, DataSourceTypes, hooks, appConfigUtils } from 'jimu-core'
import { builderAppSync, type AllWidgetSettingProps } from 'jimu-for-builder'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { RichTextFormatKeys, type Editor } from 'jimu-ui/advanced/rich-text-editor'
import type { IMConfig } from '../config'
import { Switch, defaultMessages as jimuUiMessage, richTextUtils, TextArea, TextInput } from 'jimu-ui'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import defaultMessages from './translations/default'
import { ExpressionInput, ExpressionInputType } from 'jimu-ui/advanced/expression-builder'
import { replacePlaceholderTextContent } from '../utils'
import { RichFormatClear, RichTextFormats } from './editor-plugins'


type SettingProps = AllWidgetSettingProps<IMConfig>

const SUPPORTED_TYPES = Immutable([
  DataSourceTypes.FeatureLayer,
  DataSourceTypes.SceneLayer,
  DataSourceTypes.BuildingComponentSubLayer,
  DataSourceTypes.OrientedImageryLayer,
  DataSourceTypes.ImageryLayer,
  DataSourceTypes.SubtypeGroupLayer,
  DataSourceTypes.SubtypeSublayer
])
const defaultExpressionInputTypes = Immutable([ExpressionInputType.Static, ExpressionInputType.Attribute, ExpressionInputType.Statistics, ExpressionInputType.Expression])
const DefaultUseDataSources = Immutable([])
const Setting = (props: SettingProps): React.ReactElement => {
  const {
    id,
    config: propConfig,
    useDataSources: propUseDataSources,
    useDataSourcesEnabled,
    onSettingChange
  } = props

  const placeholderEditable = getAppStore().getState().appStateInBuilder?.appInfo?.type === 'Web Experience Template'
  const style = propConfig.style
  const wrap = style?.wrap ?? true
  const showSpeedometer = propConfig.showSpeedometer ?? true
  const gaugeColor = propConfig.speedometerGaugeColor ?? '#ccc'
  const needleColor = propConfig.speedometerNeedleColor ?? 'red'
  const tickFont = propConfig.speedometerTickFont ?? 'Arial'
  const tickSize = propConfig.speedometerTickSize ?? 10
  const tickColor = propConfig.speedometerTickColor ?? '#000'
  const textFont = propConfig.speedometerTextFont ?? 'Arial'
  const textSize = propConfig.speedometerTextSize ?? 12
  const textBold = propConfig.speedometerTextBold ?? false
  const textColor = propConfig.speedometerTextColor ?? '#000'
  const padding = propConfig.speedometerPadding ?? 0
  const thresholds = propConfig.speedometerThresholds ?? [
    { value: 1, color: '#ff0000' },
    { value: 2, color: '#ffff00' },
    { value: 3, color: '#00ff00' }
  ]

  const [localFont, setLocalFont] = React.useState(textFont)
  const [localSize, setLocalSize] = React.useState(String(textSize))
  const [localTickFont, setLocalTickFont] = React.useState(tickFont)
  const [localTickSize, setLocalTickSize] = React.useState(String(tickSize))
  const [localPadding, setLocalPadding] = React.useState(String(padding))
  const [localThreshold1, setLocalThreshold1] = React.useState(String(thresholds[0].value))
  const [localThreshold2, setLocalThreshold2] = React.useState(String(thresholds[1].value))
  const [localThreshold3, setLocalThreshold3] = React.useState(String(thresholds[2].value))

  React.useEffect(() => { setLocalFont(textFont) }, [textFont])
  React.useEffect(() => { setLocalSize(String(textSize)) }, [textSize])
  React.useEffect(() => { setLocalTickFont(tickFont) }, [tickFont])
  React.useEffect(() => { setLocalTickSize(String(tickSize)) }, [tickSize])
  React.useEffect(() => { setLocalPadding(String(padding)) }, [padding])
  React.useEffect(() => {
    setLocalThreshold1(String(thresholds[0].value))
    setLocalThreshold2(String(thresholds[1].value))
    setLocalThreshold3(String(thresholds[2].value))
  }, [thresholds])
  const enableDynamicStyle = style?.enableDynamicStyle ?? false
  const dynamicStyleConfig = style?.dynamicStyleConfig
  const text = propConfig.text
  const placeholder = propConfig.placeholder
  const placeholderText = React.useMemo(() => richTextUtils.getHTMLTextContent(placeholder) ?? '', [placeholder])
  const tooltip = propConfig.tooltip
  const appStateInBuilder = ReactRedux.useSelector((state: IMState) => state.appStateInBuilder)
  const mutableStateVersion = appStateInBuilder?.widgetsMutableStateVersion?.[id]?.editor
  const isInlineEditing = appStateInBuilder?.widgetsRuntimeInfo?.[id]?.isInlineEditing
  const hasDataSource = useDataSourcesEnabled && propUseDataSources?.length > 0
  const [editor, setEditor] = React.useState<Editor>(null)
  const [openTip, setOpenTip] = React.useState(false)

  React.useEffect(() => {
    const mutableStoreManager = window._appWindow._mutableStoreManager
    const editor = mutableStoreManager?.getStateValue([id, 'editor']) ?? null
    setEditor(editor)
  }, [mutableStateVersion, id])

  const translate = hooks.useTranslation(defaultMessages, jimuUiMessage)

  const handleDataSourceChange = (useDataSources: UseDataSource[]): void => {
    builderAppSync.publishWidgetToolbarStateChangeToApp(id, ['text-expression', 'text-arcade'])
    onSettingChange({
      id,
      useDataSources
    })
  }

  const toggleUseDataEnabled = (): void => {
    builderAppSync.publishWidgetToolbarStateChangeToApp(id, ['text-expression', 'text-arcade'])
    const dataSourcesEnabled = !useDataSourcesEnabled
    if (tooltip && !dataSourcesEnabled) {
      const config = propConfig.without('tooltip')
      onSettingChange({
        id,
        config,
        useDataSourcesEnabled: dataSourcesEnabled
      })
    } else {
      onSettingChange({ id, useDataSourcesEnabled: dataSourcesEnabled })
    }
  }

  const toggleWrap = (): void => {
    onSettingChange({
      id,
      config: propConfig.setIn(['style', 'wrap'], !wrap)
    })
  }

  const toggleSpeedometer = (): void => {
    onSettingChange({
      id,
      config: propConfig.set('showSpeedometer', !showSpeedometer)
    })
  }

  const handleGaugeColorChange = (color: string): void => {
    onSettingChange({
      id,
      config: propConfig.set('speedometerGaugeColor', color)
    })
  }

  const handleNeedleColorChange = (color: string): void => {
    onSettingChange({
      id,
      config: propConfig.set('speedometerNeedleColor', color)
    })
  }

  const handleTickColorChange = (color: string): void => {
    onSettingChange({
      id,
      config: propConfig.set('speedometerTickColor', color)
    })
  }

  const handleTextColorChange = (color: string): void => {
    onSettingChange({
      id,
      config: propConfig.set('speedometerTextColor', color)
    })
  }

  const handleThresholdValueAccept = (index: number, value: number | string): void => {
    const num = typeof value === 'number' ? value : parseInt(value)
    if (!isNaN(num)) {
      index === 0 && setLocalThreshold1(String(num))
      index === 1 && setLocalThreshold2(String(num))
      index === 2 && setLocalThreshold3(String(num))
      const arr = [...thresholds]
      arr[index] = { ...arr[index], value: num }
      onSettingChange({
        id,
        config: propConfig.set('speedometerThresholds', arr)
      })
    }
  }

  const handleThresholdColorChange = (index: number, color: string): void => {
    const arr = [...thresholds]
    arr[index] = { ...arr[index], color }
    onSettingChange({
      id,
      config: propConfig.set('speedometerThresholds', arr)
    })
  }

  const handlePaddingAccept = (value: number | string): void => {
    const num = typeof value === 'number' ? value : parseInt(value)
    if (!isNaN(num)) {
      setLocalPadding(String(num))
      onSettingChange({
        id,
        config: propConfig.set('speedometerPadding', num)
      })
    }
  }

  const handleTextFontAccept = (value: string): void => {
    setLocalFont(value)
    onSettingChange({
      id,
      config: propConfig.set('speedometerTextFont', value)
    })
  }

  const handleTextSizeAccept = (value: number | string): void => {
    const num = typeof value === 'number' ? value : parseInt(value)
    if (!isNaN(num)) {
      setLocalSize(String(num))
      onSettingChange({
        id,
        config: propConfig.set('speedometerTextSize', num)
      })
    }
  }

  const toggleTextBold = (): void => {
    onSettingChange({
      id,
      config: propConfig.set('speedometerTextBold', !textBold)
    })
  }

  const handleTickFontAccept = (value: string): void => {
    setLocalTickFont(value)
    onSettingChange({
      id,
      config: propConfig.set('speedometerTickFont', value)
    })
  }

  const handleTickSizeAccept = (value: number | string): void => {
    const num = typeof value === 'number' ? value : parseInt(value)
    if (!isNaN(num)) {
      setLocalTickSize(String(num))
      onSettingChange({
        id,
        config: propConfig.set('speedometerTickSize', num)
      })
    }
  }

  const handleTooltipChange = (expression: Expression): void => {
    if (expression == null) {
      return
    }

    onSettingChange({
      id,
      config: propConfig.set('tooltip', expression)
    })
    setOpenTip(false)
  }

  const handlePlaceholderTextChange = (text: string) => {
    text = text.replace(/\n/mg, '')
    const newPlaceholder = replacePlaceholderTextContent(placeholder, text)
    onSettingChange({
      id,
      config: propConfig.set('placeholder', newPlaceholder)
    })
  }

  const handleTextChange = (html: string, key?: RichTextFormatKeys, value?: any): void => {
    const onlyPlaceholder = richTextUtils.isBlankRichText(text) && !!placeholder
    const property = !isInlineEditing && onlyPlaceholder ? 'placeholder' : 'text'
    html = property === 'text' ? appConfigUtils.restoreResourceUrl(html) : html
    let config = propConfig.set(property, html)
    if (!isInlineEditing && key === RichTextFormatKeys.Color) {
      config = config.setIn(['style', 'color'], value)
    }
    onSettingChange({ id, config })
  }

  const expInputForms = React.useMemo(() => hasDataSource ? defaultExpressionInputTypes : Immutable([ExpressionInputType.Static]), [hasDataSource])

  return (
    <div className='widget-setting-text jimu-widget-setting'>
      <SettingSection>
        <SettingRow>
          <DataSourceSelector
            isMultiple
            types={SUPPORTED_TYPES}
            useDataSources={propUseDataSources}
            useDataSourcesEnabled={useDataSourcesEnabled}
            onToggleUseDataEnabled={toggleUseDataEnabled}
            onChange={handleDataSourceChange}
            widgetId={id}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection>
        <SettingRow flow='no-wrap' tag='label' label={translate('wrap')}>
          <Switch checked={wrap} onChange={toggleWrap} />
        </SettingRow>
        <SettingRow label={translate('tooltip')} flow='wrap' role='group' aria-label={translate('tooltip')}>
          <div className='w-100'>
            <ExpressionInput
              aria-label={translate('tooltip')}
              autoHide useDataSources={hasDataSource ? propUseDataSources : DefaultUseDataSources} onChange={handleTooltipChange} openExpPopup={() => { setOpenTip(true) }}
              expression={typeof tooltip === 'object' ? tooltip : null} isExpPopupOpen={openTip} closeExpPopup={() => { setOpenTip(false) }}
              types={expInputForms}
              widgetId={id}
            />
          </div>
        </SettingRow>
        {placeholderEditable && <SettingRow flow='wrap' label={translate('placeholder')}>
          <TextArea aria-label={translate('placeholder')} defaultValue={placeholderText} onAcceptValue={handlePlaceholderTextChange}></TextArea>
        </SettingRow>}
        <SettingRow flow='no-wrap' tag='label' label={translate('showSpeedometer')}>
          <Switch checked={showSpeedometer} onChange={toggleSpeedometer} />
        </SettingRow>
        {showSpeedometer && <>
          <SettingRow className='mb-3' flow='no-wrap' label={translate('gaugeColor')}>
            <ThemeColorPicker value={gaugeColor} onChange={handleGaugeColorChange} />
          </SettingRow>
          <SettingRow className='mb-3' flow='no-wrap' label={translate('needleColor')}>
            <ThemeColorPicker value={needleColor} onChange={handleNeedleColorChange} />
          </SettingRow>
          <SettingRow className='mb-3' flow='no-wrap' label={translate('tickColor')}>
            <ThemeColorPicker value={tickColor} onChange={handleTickColorChange} />
          </SettingRow>
          <SettingRow className='mb-3' flow='no-wrap' label={translate('tickFont')}>
            <TextInput style={{ width: 120 }} value={localTickFont} onChange={(_e, v) => setLocalTickFont(v)} onAcceptValue={handleTickFontAccept} />
          </SettingRow>
          <SettingRow className='mb-3' flow='no-wrap' label={translate('tickSize')}>
            <TextInput style={{ width: 80 }} type='number' value={localTickSize} onChange={(_e, v) => setLocalTickSize(v)} onAcceptValue={handleTickSizeAccept} />
          </SettingRow>
          <SettingRow className='mb-3' flow='no-wrap' label={translate('textColor')}>
            <ThemeColorPicker value={textColor} onChange={handleTextColorChange} />
          </SettingRow>
          <SettingRow className='mb-3' flow='no-wrap' label={translate('textFont')}>
            <TextInput style={{ width: 120 }} value={localFont} onChange={(_e, v) => setLocalFont(v)} onAcceptValue={handleTextFontAccept} />
          </SettingRow>
          <SettingRow className='mb-3' flow='no-wrap' label={translate('textSize')}>
            <TextInput style={{ width: 80 }} type='number' value={localSize} onChange={(_e, v) => setLocalSize(v)} onAcceptValue={handleTextSizeAccept} />
          </SettingRow>
          <SettingRow className='mb-3' flow='no-wrap' label={translate('gaugePadding')}>
            <TextInput style={{ width: 80 }} type='number' value={localPadding} onChange={(_e, v) => setLocalPadding(v)} onAcceptValue={handlePaddingAccept} />
          </SettingRow>
          <SettingRow className='mb-3' flow='no-wrap' label={translate('threshold1')}>
            <TextInput style={{ width: 80 }} type='number' value={localThreshold1} onChange={(_e, v) => setLocalThreshold1(v)} onAcceptValue={(v) => handleThresholdValueAccept(0, v)} />
            <ThemeColorPicker className='ml-2' value={thresholds[0].color} onChange={color => handleThresholdColorChange(0, color)} />
          </SettingRow>
          <SettingRow className='mb-3' flow='no-wrap' label={translate('threshold2')}>
            <TextInput style={{ width: 80 }} type='number' value={localThreshold2} onChange={(_e, v) => setLocalThreshold2(v)} onAcceptValue={(v) => handleThresholdValueAccept(1, v)} />
            <ThemeColorPicker className='ml-2' value={thresholds[1].color} onChange={color => handleThresholdColorChange(1, color)} />
          </SettingRow>
          <SettingRow className='mb-3' flow='no-wrap' label={translate('threshold3')}>
            <TextInput style={{ width: 80 }} type='number' value={localThreshold3} onChange={(_e, v) => setLocalThreshold3(v)} onAcceptValue={(v) => handleThresholdValueAccept(2, v)} />
            <ThemeColorPicker className='ml-2' value={thresholds[2].color} onChange={color => handleThresholdColorChange(2, color)} />
          </SettingRow>
          <SettingRow className='mb-3' flow='no-wrap' tag='label' label={translate('textBold')}>
            <Switch checked={textBold} onChange={toggleTextBold} />
          </SettingRow>
        </>}

      </SettingSection>

      {editor != null && <SettingSection>
        <SettingRow flow='no-wrap' label={translate('textFormat')} role='group' aria-label={translate('textFormat')}>
          <RichFormatClear
            editor={editor}
            onChange={handleTextChange}
          />
        </SettingRow>

        <SettingRow>
          <RichTextFormats
            widgetId={id}
            editor={editor}
            defaultColor={propConfig.style?.color}
            useDataSources={propUseDataSources}
            onChange={handleTextChange}
          />
        </SettingRow>
      </SettingSection>}
    </div >
  )
}

export default Setting
